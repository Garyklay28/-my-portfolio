import { supabase, isAuthConfigured } from './supabase.js'
import { FILMS, IMAGE_GROUPS } from '../data/works.js'

/**
 * 内容加载：优先读 Supabase，失败或为空时回退到 src/data/works.js 的示例数据。
 * 콘텐츠 로딩: Supabase 우선, 실패하거나 비어 있으면 src/data/works.js 샘플 데이터로 폴백.
 *
 * 这样保证：数据库没建好、网络断了、或表还是空的，网站照样正常显示。
 * 덕분에 DB 미생성·네트워크 장애·빈 테이블 상황에서도 사이트가 정상 동작합니다.
 */

const STATIC = { source: 'static', films: FILMS, groups: IMAGE_GROUPS }

/** DB 行 → 组件需要的形状 / DB 행 → 컴포넌트가 기대하는 형태 */
function toWork(row) {
  return {
    id: row.id,
    title: row.title,
    titleCn: row.title_cn || '',
    meta: row.meta || '',
    role: row.role || '',
    body: row.body || '',
    bodyEn: row.body_en || '',
    image: row.image_url || '',
    video: row.video_url || undefined,
    ratio: row.ratio || '16 / 9',
    _row: row,
  }
}

export async function loadContent() {
  if (!isAuthConfigured) return STATIC

  try {
    const [projectsRes, worksRes] = await Promise.all([
      supabase.from('portfolio_projects').select('*').order('sort_order', { ascending: true }),
      supabase.from('portfolio_works').select('*').order('sort_order', { ascending: true }),
    ])

    if (projectsRes.error || worksRes.error) {
      console.warn('[content] Supabase 读取失败，回退到示例数据 /', projectsRes.error || worksRes.error)
      return STATIC
    }

    const rows = worksRes.data ?? []
    if (rows.length === 0) return { ...STATIC, source: 'static-empty' }

    const films = rows.filter((r) => r.kind === 'film').map(toWork)

    const groups = (projectsRes.data ?? []).map((p) => ({
      id: p.id,
      title: p.title,
      titleCn: p.title_cn || '',
      meta: p.meta || '',
      role: p.role || '',
      items: rows.filter((r) => r.kind === 'image' && r.project_id === p.id).map(toWork),
      _row: p,
    }))

    return {
      source: 'supabase',
      films: films.length ? films : FILMS,
      groups: groups.filter((g) => g.items.length > 0).length ? groups : IMAGE_GROUPS,
    }
  } catch (err) {
    console.warn('[content] 加载异常，回退到示例数据 /', err)
    return STATIC
  }
}

/** 把现有示例数据一次性导入数据库 / 샘플 데이터를 DB 로 일괄 가져오기 */
export async function seedFromStatic() {
  if (!isAuthConfigured) throw new Error('Supabase 未配置 / Supabase 미설정')

  const report = { projects: 0, films: 0, images: 0 }

  // 影片 / 영화
  const filmRows = FILMS.map((f, i) => ({
    kind: 'film',
    title: f.title,
    title_cn: f.titleCn,
    meta: f.meta,
    role: f.role,
    body: f.body,
    body_en: f.bodyEn,
    image_url: f.image,
    video_url: f.video ?? null,
    ratio: f.ratio,
    sort_order: i,
  }))
  const { error: fe, data: fd } = await supabase.from('portfolio_works').insert(filmRows).select('id')
  if (fe) throw fe
  report.films = fd?.length ?? 0

  // 图片项目 + 静帧 / 이미지 프로젝트 + 스틸
  for (const [gi, g] of IMAGE_GROUPS.entries()) {
    const { data: proj, error: pe } = await supabase
      .from('portfolio_projects')
      .insert({ title: g.title, title_cn: g.titleCn, meta: g.meta, role: g.role, sort_order: gi })
      .select('id')
      .single()
    if (pe) throw pe
    report.projects += 1

    const itemRows = g.items.map((it, i) => ({
      kind: 'image',
      project_id: proj.id,
      title: it.title,
      title_cn: it.titleCn,
      meta: it.meta,
      role: it.role ?? null,
      body: it.body,
      body_en: it.bodyEn,
      image_url: it.image,
      ratio: it.ratio,
      sort_order: i,
    }))
    const { error: ie, data: idata } = await supabase.from('portfolio_works').insert(itemRows).select('id')
    if (ie) throw ie
    report.images += idata?.length ?? 0
  }

  return report
}

/** 上传文件到 media 桶，返回公开 URL / media 버킷에 업로드 후 공개 URL 반환 */
export async function uploadMedia(file, folder = 'uploads') {
  if (!isAuthConfigured) throw new Error('Supabase 未配置 / Supabase 미설정')

  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
  const safe = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { error } = await supabase.storage.from('media').upload(safe, file, {
    cacheControl: '31536000',
    upsert: false,
  })
  if (error) throw error

  const { data } = supabase.storage.from('media').getPublicUrl(safe)
  return data.publicUrl
}
