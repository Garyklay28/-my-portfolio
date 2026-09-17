import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { uploadMedia, seedFromStatic } from '../lib/content.js'
import ProfileEditor from './ProfileEditor.jsx'

const EMPTY = {
  kind: 'film',
  project_id: null,
  title: '',
  title_cn: '',
  meta: '',
  role: '',
  body: '',
  body_en: '',
  image_url: '',
  video_url: '',
  ratio: '16 / 9',
  sort_order: 0,
}

/** 管理面板：仅登录后可见。增删改作品 + 上传图片/视频。
 *  관리 패널: 로그인 후에만 표시. 작품 추가·수정·삭제 + 이미지/영상 업로드. */
export default function AdminPanel({ onClose, onChanged, contentSource }) {
  const [tab, setTab] = useState('film') // film | image | projects
  const [projects, setProjects] = useState([])
  const [works, setWorks] = useState([])
  const [form, setForm] = useState({ ...EMPTY })
  const [editingId, setEditingId] = useState(null)
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  useEffect(() => { refresh() }, [])

  async function refresh() {
    setErr('')
    const [p, w] = await Promise.all([
      supabase.from('portfolio_projects').select('*').order('sort_order'),
      supabase.from('portfolio_works').select('*').order('sort_order'),
    ])
    if (p.error || w.error) {
      setErr((p.error || w.error).message + ' —— 数据表可能还没建好 / 테이블이 아직 없을 수 있습니다')
      return
    }
    setProjects(p.data ?? [])
    setWorks(w.data ?? [])
  }

  function resetForm(kind = tab) {
    setForm({ ...EMPTY, kind: kind === 'projects' ? 'film' : kind })
    setEditingId(null)
    setMsg('')
    setErr('')
  }

  async function handleUpload(e, field) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(field)
    setErr('')
    try {
      const { url, originalSize, uploadedSize } = await uploadMedia(file, field === 'video_url' ? 'videos' : 'images')
      setForm((f) => ({ ...f, [field]: url }))
      const shrunk = uploadedSize < originalSize
        ? `（已自动压缩 ${(originalSize / 1048576).toFixed(1)}MB → ${(uploadedSize / 1048576).toFixed(1)}MB / 자동 압축됨）`
        : ''
      setMsg(`上传成功 / 업로드 성공: ${file.name} ${shrunk}`)
    } catch (e2) {
      setErr(e2.message || String(e2))
    } finally {
      setBusy('')
      e.target.value = ''
    }
  }

  async function save(e) {
    e.preventDefault()
    setBusy('save'); setErr(''); setMsg('')
    try {
      if (tab === 'projects') {
        const payload = {
          title: form.title, title_cn: form.title_cn,
          meta: form.meta, role: form.role, sort_order: Number(form.sort_order) || 0,
        }
        const res = editingId
          ? await supabase.from('portfolio_projects').update(payload).eq('id', editingId)
          : await supabase.from('portfolio_projects').insert(payload)
        if (res.error) throw res.error
      } else {
        const payload = {
          kind: tab,
          project_id: tab === 'image' ? form.project_id || null : null,
          title: form.title, title_cn: form.title_cn, meta: form.meta, role: form.role,
          body: form.body, body_en: form.body_en,
          image_url: form.image_url || null,
          video_url: form.video_url || null,
          ratio: form.ratio || '16 / 9',
          sort_order: Number(form.sort_order) || 0,
        }
        const res = editingId
          ? await supabase.from('portfolio_works').update(payload).eq('id', editingId)
          : await supabase.from('portfolio_works').insert(payload)
        if (res.error) throw res.error
      }
      setMsg(editingId ? '已更新 / 수정 완료' : '已添加 / 추가 완료')
      resetForm()
      await refresh()
      onChanged?.()
    } catch (e2) {
      setErr(e2.message || String(e2))
    } finally {
      setBusy('')
    }
  }

  async function remove(table, id, label, extra = '') {
    if (!window.confirm(`确定删除「${label}」？此操作无法撤销。${extra}\n"${label}" 을(를) 삭제할까요? 되돌릴 수 없습니다.`)) return
    setBusy('del'); setErr('')
    try {
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) throw error
      setMsg('已删除 / 삭제 완료')
      await refresh()
      onChanged?.()
    } catch (e2) {
      setErr(e2.message || String(e2))
    } finally {
      setBusy('')
    }
  }

  function edit(row) {
    setEditingId(row.id)
    setForm({ ...EMPTY, ...row, project_id: row.project_id ?? null })
    setMsg(''); setErr('')
    document.querySelector('.admin__form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function doSeed() {
    if (!window.confirm('把当前网站上的示例作品全部导入数据库？只需做一次。\n현재 사이트의 샘플 작품을 DB 로 가져올까요? 한 번만 하면 됩니다.')) return
    setBusy('seed'); setErr(''); setMsg('')
    try {
      const r = await seedFromStatic()
      setMsg(`导入完成 / 가져오기 완료: 影片 ${r.films} · 项目 ${r.projects} · 静帧 ${r.images}`)
      await refresh()
      onChanged?.()
    } catch (e2) {
      setErr(e2.message || String(e2))
    } finally {
      setBusy('')
    }
  }

  const list = tab === 'projects' ? projects : works.filter((w) => w.kind === tab)
  const isProjects = tab === 'projects'
  // 项目分组隶属于 Images：主标签只有 Film / Images / Profile
  // 프로젝트 그룹은 Images 소속: 메인 탭은 Film / Images / Profile 뿐
  const inImages = tab === 'image' || tab === 'projects'
  const stillCount = (projectId) => works.filter((w) => w.kind === 'image' && w.project_id === projectId).length

  // 静帧按项目分组显示（和网站 Images 页结构一致）
  // 스틸을 프로젝트별로 묶어 표시 (사이트 Images 페이지 구조와 동일)
  const stillGroups = tab === 'image'
    ? [
        ...projects.map((p) => ({ key: p.id, title: p.title, rows: list.filter((w) => w.project_id === p.id) })),
        {
          key: 'none',
          title: '未分组 / 미분류',
          rows: list.filter((w) => !w.project_id || !projects.some((p) => p.id === w.project_id)),
        },
      ].filter((g) => g.key !== 'none' || g.rows.length > 0)
    : null

  const goProjects = () => { setTab('projects'); resetForm('projects') }

  const renderRow = (row) => (
    <div className="admin__row" key={row.id}>
      {!isProjects && (
        <div className="admin__thumb">
          {row.image_url ? <img src={row.image_url} alt="" loading="lazy" /> : <span>—</span>}
        </div>
      )}
      <div className="admin__rowmain">
        <strong>{row.title}</strong>
        <span>{row.title_cn} {row.meta && `· ${row.meta}`}</span>
        {isProjects && <span>静帧 {stillCount(row.id)} 张 / 스틸 {stillCount(row.id)}장</span>}
        {row.video_url && <span className="admin__badge">VIDEO</span>}
      </div>
      <div className="admin__actions">
        <button onClick={() => edit(row)}>编辑</button>
        <button
          className="admin__del"
          onClick={() =>
            isProjects
              ? remove('portfolio_projects', row.id, row.title,
                  `\n⚠️ 这个项目下的 ${stillCount(row.id)} 张静帧也会一起被删除。\n⚠️ 이 프로젝트의 스틸 ${stillCount(row.id)}장도 함께 삭제됩니다.`)
              : remove('portfolio_works', row.id, row.title)
          }
          disabled={busy === 'del'}
        >删除</button>
      </div>
    </div>
  )

  return (
    <div className="admin" role="dialog" aria-modal="true" aria-label="Admin panel">
      <div className="admin__bar">
        <div className="wrap admin__barinner">
          <div>
            <p className="eyebrow">Admin / 管理 · 관리</p>
            <h2 className="slab admin__title">Manage Works</h2>
          </div>
          <button className="detail__close" onClick={onClose}>← Close</button>
        </div>
      </div>

      <div className="wrap admin__body">
        {contentSource !== 'supabase' && tab !== 'profile' && (
          <div className="admin__banner">
            <p>
              网站当前显示的是<b>代码里的示例作品</b>，数据库还是空的。点下面的按钮可以把它们一次性导入数据库，之后就能在这里编辑。
              <br />
              현재 사이트는 <b>코드에 있는 샘플 작품</b>을 표시 중이며 DB 는 비어 있습니다. 아래 버튼으로 한 번에 가져오면 이곳에서 편집할 수 있습니다.
            </p>
            <button className="admin__seed" onClick={doSeed} disabled={busy === 'seed'}>
              {busy === 'seed' ? '导入中… / 가져오는 중…' : '导入现有作品 / 기존 작품 가져오기'}
            </button>
          </div>
        )}

        <div className="admin__tabs" role="tablist">
          {[['film', 'Film 影片'], ['image', 'Images 图片'], ['profile', 'Profile 简介']].map(([id, label]) => {
            const selected = id === 'image' ? inImages : tab === id
            return (
              <button
                key={id}
                role="tab"
                aria-selected={selected}
                onClick={() => { if (selected) return; setTab(id); if (id !== 'profile') resetForm(id) }}
              >
                {label}
              </button>
            )
          })}
        </div>

        {inImages && (
          <div className="admin__subtabs" role="tablist" aria-label="Images">
            {[['image', '静帧 Stills / 스틸'], ['projects', '项目分组 Projects / 프로젝트']].map(([id, label]) => (
              <button key={id} role="tab" aria-selected={tab === id} onClick={() => { setTab(id); resetForm(id) }}>
                {label}
              </button>
            ))}
          </div>
        )}

        {err && <p className="auth__error admin__msg">{err}</p>}
        {msg && <p className="auth__notice admin__msg">{msg}</p>}

        {tab === 'profile' ? (
          <ProfileEditor onSaved={onChanged} />
        ) : (
        <div className="admin__cols">
          {/* ---------- 表单 / 폼 ---------- */}
          <form className="admin__form" onSubmit={save}>
            <h3 className="admin__h3">
              {editingId ? '编辑 / 수정' : '新增 / 추가'}
              {editingId && (
                <button type="button" className="admin__cancel" onClick={() => resetForm()}>取消 / 취소</button>
              )}
            </h3>

            <Field label="标题 Title *" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
            <Field label="中文名 / 한글명" value={form.title_cn} onChange={(v) => setForm({ ...form, title_cn: v })} />
            <Field label="分类 Meta（如 Feature · 2025）" value={form.meta} onChange={(v) => setForm({ ...form, meta: v })} />
            <Field label="职位 Role" value={form.role} onChange={(v) => setForm({ ...form, role: v })} />

            {!isProjects && (
              <>
                {tab === 'image' && (
                  <>
                    <label className="auth__field">
                      <span>所属项目 / 소속 프로젝트</span>
                      <select value={form.project_id ?? ''} onChange={(e) => setForm({ ...form, project_id: e.target.value || null })}>
                        <option value="">（未分组 / 미분류）</option>
                        {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                      </select>
                    </label>
                    {projects.length === 0 && (
                      <p className="admin__hint">
                        还没有项目分组。<button type="button" onClick={goProjects}>先去建一个 →</button>
                        <br />
                        프로젝트가 없습니다. <button type="button" onClick={goProjects}>먼저 만들기 →</button>
                      </p>
                    )}
                  </>
                )}

                <label className="auth__field">
                  <span>说明（中文）/ 설명</span>
                  <textarea rows={3} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
                </label>
                <label className="auth__field">
                  <span>说明（English）</span>
                  <textarea rows={3} value={form.body_en} onChange={(e) => setForm({ ...form, body_en: e.target.value })} />
                </label>

                <MediaField
                  label="图片 Image" field="image_url" form={form} setForm={setForm}
                  busy={busy} onUpload={handleUpload} accept="image/*"
                />
                {tab === 'film' && (
                  <MediaField
                    label="视频 Video（可选，单个 ≤ 50MB / 선택, 파일당 50MB 이하）" field="video_url" form={form} setForm={setForm}
                    busy={busy} onUpload={handleUpload} accept="video/*"
                  />
                )}

                <Field label="比例 Ratio（如 16 / 9、2 / 3）" value={form.ratio} onChange={(v) => setForm({ ...form, ratio: v })} />
              </>
            )}

            <Field label="排序 Sort（数字越小越靠前）" value={String(form.sort_order)} onChange={(v) => setForm({ ...form, sort_order: v })} type="number" />

            <button className="auth__submit" type="submit" disabled={busy === 'save'}>
              {busy === 'save' ? '保存中… / 저장 중…' : editingId ? '保存修改 / 수정 저장' : '添加 / 추가'}
            </button>
          </form>

          {/* ---------- 列表 / 목록 ---------- */}
          <div className="admin__list">
            <h3 className="admin__h3">
              {isProjects ? '项目分组 / 프로젝트' : '已有内容 / 기존 항목'} <span>{list.length}</span>
            </h3>
            {list.length === 0 && !stillGroups?.length && <p className="admin__empty">还没有内容 / 항목이 없습니다</p>}
            {stillGroups
              ? stillGroups.map((g) => (
                  <div className="admin__group" key={g.key}>
                    <p className="admin__grouphead">{g.title} <span>{g.rows.length}</span></p>
                    {g.rows.length === 0 && <p className="admin__empty">此项目暂无静帧 / 이 프로젝트에 스틸 없음</p>}
                    {g.rows.map(renderRow)}
                  </div>
                ))
              : list.map(renderRow)}
          </div>
        </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', required }) {
  return (
    <label className="auth__field">
      <span>{label}</span>
      <input type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} required={required} />
    </label>
  )
}

function MediaField({ label, field, form, setForm, busy, onUpload, accept }) {
  return (
    <label className="auth__field">
      <span>{label}</span>
      <div className="admin__media">
        <input
          type="text"
          value={form[field] ?? ''}
          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          placeholder="/images/... 或上传 / 또는 업로드"
        />
        <label className="admin__upload">
          {busy === field ? '上传中…' : '上传 / 업로드'}
          <input type="file" accept={accept} onChange={(e) => onUpload(e, field)} hidden />
        </label>
      </div>
      {form[field] && accept.startsWith('image') && (
        <img className="admin__preview" src={form[field]} alt="" />
      )}
    </label>
  )
}
