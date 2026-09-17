import { supabase, isAuthConfigured } from './supabase.js'
import { FILMS, IMAGE_GROUPS, PROFILE } from '../data/works.js'

/**
 * 内容加载：优先读 Supabase，失败或为空时回退到 src/data/works.js 的示例数据。
 * 콘텐츠 로딩: Supabase 우선, 실패하거나 비어 있으면 src/data/works.js 샘플 데이터로 폴백.
 *
 * 这样保证：数据库没建好、网络断了、或表还是空的，网站照样正常显示。
 * 덕분에 DB 미생성·네트워크 장애·빈 테이블 상황에서도 사이트가 정상 동작합니다.
 */

const STATIC = { source: 'static', films: FILMS, groups: IMAGE_GROUPS, profile: PROFILE }

/** DB 行 → PROFILE 形状；缺失的字段回退到示例数据
 *  DB 행 → PROFILE 형태; 누락 필드는 샘플 데이터로 폴백 */
function toProfile(row) {
  if (!row) return PROFILE
  const pick = (v, fb) => (v === null || v === undefined || v === '' ? fb : v)
  const list = (v, fb) => (Array.isArray(v) && v.length ? v : fb)
  return {
    ...PROFILE,
    name: pick(row.name, PROFILE.name),
    nameCn: pick(row.name_cn, PROFILE.nameCn),
    role: pick(row.role, PROFILE.role),
    tagline: pick(row.tagline, PROFILE.tagline),
    quote: pick(row.quote, PROFILE.quote),
    bio: pick(row.bio, PROFILE.bio),
    bioEn: pick(row.bio_en, PROFILE.bioEn),
    portrait: pick(row.portrait, PROFILE.portrait),
    disciplines: list(row.disciplines, PROFILE.disciplines),
    laurels: list(row.laurels, PROFILE.laurels),
    contact: list(row.contact, PROFILE.contact),
    education: list(row.education, PROFILE.education),
    credits: list(row.credits, PROFILE.credits),
    work: list(row.work, PROFILE.work),
    awards: list(row.awards, PROFILE.awards),
  }
}

/** 读取简介；表不存在或没数据时回退示例数据
 *  프로필 로딩; 테이블 부재·데이터 없음이면 샘플로 폴백 */
export async function loadProfile() {
  if (!isAuthConfigured) return PROFILE
  try {
    const { data, error } = await supabase.from('portfolio_profile').select('*').eq('id', 1).maybeSingle()
    if (error) {
      console.warn('[profile] 读取失败，回退到示例数据 /', error)
      return PROFILE
    }
    return toProfile(data)
  } catch (err) {
    console.warn('[profile] 加载异常，回退到示例数据 /', err)
    return PROFILE
  }
}

/** 保存简介（整行覆盖，id 固定为 1）/ 프로필 저장 (id 1 고정, 전체 덮어쓰기) */
export async function saveProfile(p) {
  if (!isAuthConfigured) throw new Error('Supabase 未配置 / Supabase 미설정')
  const row = {
    id: 1,
    name: p.name, name_cn: p.nameCn, role: p.role, tagline: p.tagline,
    quote: p.quote, bio: p.bio, bio_en: p.bioEn, portrait: p.portrait,
    disciplines: p.disciplines ?? [], laurels: p.laurels ?? [],
    contact: p.contact ?? [], education: p.education ?? [],
    credits: p.credits ?? [], work: p.work ?? [], awards: p.awards ?? [],
    updated_at: new Date().toISOString(),
  }
  const { error } = await supabase.from('portfolio_profile').upsert(row, { onConflict: 'id' })
  if (error) throw error
}

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
    const [projectsRes, worksRes, profile] = await Promise.all([
      supabase.from('portfolio_projects').select('*').order('sort_order', { ascending: true }),
      supabase.from('portfolio_works').select('*').order('sort_order', { ascending: true }),
      loadProfile(),
    ])

    if (projectsRes.error || worksRes.error) {
      console.warn('[content] Supabase 读取失败，回退到示例数据 /', projectsRes.error || worksRes.error)
      return STATIC
    }

    const rows = worksRes.data ?? []
    if (rows.length === 0) return { ...STATIC, source: 'static-empty', profile }

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
      profile,
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

// Supabase 免费版单个文件上限 50MB（超过会报 "The object exceeded the maximum allowed size"）
// Supabase 무료 플랜 파일당 최대 50MB (초과 시 "The object exceeded the maximum allowed size")
export const MAX_UPLOAD_MB = 50

const mb = (bytes) => (bytes / 1048576).toFixed(1)

/**
 * 上传前在浏览器里压缩图片：长边缩到 2560px 以内，重新编码。
 * 업로드 전 브라우저에서 이미지 압축: 긴 변 2560px 이하로 줄이고 재인코딩.
 *
 * - 本来就小（≤ 3MB 且尺寸不超）的图原样上传，不做无谓的有损压缩
 * - PNG 可能有透明背景（比如桂冠），优先转 WebP 保留透明；浏览器不支持时退回 PNG
 * - 压缩结果比原图还大时，用原图
 *
 * - 이미 작은 이미지(3MB 이하, 크기 초과 없음)는 그대로 업로드
 * - PNG 는 투명 배경(월계관 등)이 있을 수 있어 WebP 로 투명도 유지, 미지원 브라우저는 PNG
 * - 압축 결과가 원본보다 크면 원본 사용
 */
export async function compressImage(file, { maxEdge = 2560, quality = 0.86 } = {}) {
  if (!file.type.startsWith('image/') || /svg|gif/.test(file.type)) return file

  let bitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return file // 浏览器解不了的格式（如部分 HEIC）原样交给服务器 / 디코딩 불가 형식은 원본 그대로
  }

  const longEdge = Math.max(bitmap.width, bitmap.height)
  if (file.size <= 3 * 1048576 && longEdge <= maxEdge) {
    bitmap.close?.()
    return file
  }

  const scale = Math.min(1, maxEdge / longEdge)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close?.()

  const encode = (type) => new Promise((resolve) => canvas.toBlob(resolve, type, quality))
  const keepAlpha = file.type === 'image/png' || file.type === 'image/webp'
  let blob = await encode(keepAlpha ? 'image/webp' : 'image/jpeg')
  if (keepAlpha && blob && blob.type !== 'image/webp') blob = await encode('image/png')
  if (!blob || blob.size >= file.size) return file

  const ext = { 'image/webp': 'webp', 'image/png': 'png', 'image/jpeg': 'jpg' }[blob.type] || 'jpg'
  const name = file.name.replace(/\.[^.]+$/, '') + '.' + ext
  return new File([blob], name, { type: blob.type })
}

/** 超限时给出看得懂的提示，而不是服务器的英文报错 / 제한 초과 시 서버 영문 오류 대신 이해하기 쉬운 안내 */
export function checkUploadSize(file) {
  if (file.size <= MAX_UPLOAD_MB * 1048576) return
  const isVideo = file.type.startsWith('video/')
  throw new Error(
    `「${file.name}」有 ${mb(file.size)}MB，超过了单个文件 ${MAX_UPLOAD_MB}MB 的上限。` +
      (isVideo ? '请先用压缩脚本把视频压小再上传。' : '请换一张小一点的图片。') +
      ` / "${file.name}" 은(는) ${mb(file.size)}MB 로 파일당 ${MAX_UPLOAD_MB}MB 제한을 넘습니다. ` +
      (isVideo ? '압축 스크립트로 영상을 줄인 뒤 업로드하세요.' : '더 작은 이미지를 사용하세요.'),
  )
}

/**
 * 用 XMLHttpRequest 上传，这样能拿到上传进度（fetch 拿不到）。
 * 진행률을 받기 위해 XMLHttpRequest 로 업로드 (fetch 로는 진행률을 알 수 없음).
 */
export function xhrUpload({ url, headers = {}, body, onProgress, signal }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    for (const [k, v] of Object.entries(headers)) xhr.setRequestHeader(k, v)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded / e.total)
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(1)
        resolve()
        return
      }
      let message = xhr.responseText
      try {
        const j = JSON.parse(xhr.responseText)
        message = j.message || j.error || message
      } catch { /* 不是 JSON 就用原文 / JSON 이 아니면 원문 사용 */ }
      const err = new Error(message || `HTTP ${xhr.status}`)
      err.status = xhr.status
      reject(err)
    }
    xhr.onerror = () => reject(new Error('网络错误，上传中断 / 네트워크 오류로 업로드가 중단되었습니다'))
    xhr.onabort = () => reject(new DOMException('已取消 / 취소됨', 'AbortError'))

    if (signal) {
      if (signal.aborted) return xhr.abort()
      signal.addEventListener('abort', () => xhr.abort(), { once: true })
    }
    xhr.send(body)
  })
}

/** 确认仍处于登录状态，返回 session；否则报错 / 로그인 상태 확인 후 session 반환, 아니면 오류 */
export async function requireSession() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('登录已过期，请重新登录后再上传 / 로그인이 만료되었습니다. 다시 로그인한 뒤 업로드하세요')
  return session
}

/**
 * 上传文件到 media 桶，返回公开 URL。图片先压缩，再检查大小。
 * media 버킷에 업로드 후 공개 URL 반환. 이미지는 먼저 압축 후 크기 확인.
 *
 * options.onStage(stage)   'compress' | 'upload'
 * options.onProgress(0~1)  上传进度 / 업로드 진행률
 * options.signal           AbortSignal，用来取消 / 취소용
 */
export async function uploadMedia(input, folder = 'uploads', { onStage, onProgress, signal } = {}) {
  if (!isAuthConfigured) throw new Error('Supabase 未配置 / Supabase 미설정')

  const isImage = input.type.startsWith('image/')
  if (isImage) onStage?.('compress')
  const file = isImage ? await compressImage(input) : input
  checkUploadSize(file)

  const session = await requireSession()

  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  onStage?.('upload')
  try {
    await xhrUpload({
      url: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/media/${path}`,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        'x-upsert': 'false',
        'cache-control': 'max-age=31536000',
        ...(file.type ? { 'Content-Type': file.type } : {}),
      },
      body: file,
      onProgress,
      signal,
    })
  } catch (error) {
    // 服务器端的上限可能比 50MB 更低（例如桶单独设了限制），给出同样看得懂的提示
    // 서버 제한이 50MB 보다 낮을 수 있음 (버킷별 제한 등), 같은 방식으로 안내
    if (error.status === 413 || /maximum allowed size/i.test(error.message)) {
      throw new Error(
        `「${file.name}」(${mb(file.size)}MB) 超过了存储空间允许的单个文件上限。/ ` +
          `"${file.name}" (${mb(file.size)}MB) 이(가) 스토리지 파일당 제한을 넘습니다.`,
      )
    }
    throw error
  }

  const { data } = supabase.storage.from('media').getPublicUrl(path)
  return { url: data.publicUrl, originalSize: input.size, uploadedSize: file.size }
}
