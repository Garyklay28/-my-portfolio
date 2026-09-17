import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { uploadMedia, seedFromStatic, requireSession, MAX_UPLOAD_MB } from '../lib/content.js'
import UploadProgress from './UploadProgress.jsx'
import ProfileEditor from './ProfileEditor.jsx'
import SortableList from './SortableList.jsx'

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
  // 上传进度 { field, label, value(0~1 或 null), detail } / 업로드 진행률
  const [progress, setProgress] = useState(null)
  // 选了视频、还没决定怎么上传时的检查结果 / 영상 선택 후 업로드 방식 결정 전 확인 결과
  const [videoPrep, setVideoPrep] = useState(null)
  const abortRef = useRef(null)

  // 关闭面板时中止进行中的压缩/上传；上传中离开页面前提醒
  // 패널을 닫으면 진행 중인 압축/업로드 중단, 업로드 중 페이지 이탈 시 경고
  useEffect(() => () => abortRef.current?.abort(), [])
  useEffect(() => {
    if (!progress) return
    const warn = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [progress])

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

  const mb = (b) => (b / 1048576).toFixed(1)

  async function handleUpload(e, field) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (field === 'video_url') return pickVideo(file)
    return runUpload(field, file)
  }

  // 选了视频：先读出大小、分辨率、编码，再让你决定压缩还是直接传
  // 영상 선택: 크기·해상도·코덱을 먼저 읽고, 압축할지 바로 올릴지 결정하게 함
  async function pickVideo(file) {
    setErr(''); setMsg('')
    setVideoPrep({ file, probing: true })
    try {
      const { probeVideo, browserCanCompress } = await import('../lib/videoCompress.js')
      const [info, canCompress] = await Promise.all([
        probeVideo(file).catch(() => null),
        browserCanCompress(),
      ])
      setVideoPrep((cur) => (cur?.file === file ? { file, info, canCompress } : cur))
    } catch (e2) {
      setVideoPrep((cur) => (cur?.file === file ? { file, info: null, canCompress: false } : cur))
      setErr(e2.message || String(e2))
    }
  }

  async function runUpload(field, file, { compress = false } = {}) {
    const controller = new AbortController()
    abortRef.current = controller
    setErr(''); setMsg(''); setBusy(field)
    try {
      // 先确认登录状态，免得压完才发现登录过期 / 압축 후에야 로그인 만료를 알게 되지 않도록 먼저 확인
      await requireSession()

      let toUpload = file
      let note = ''

      if (compress) {
        const { compressVideo } = await import('../lib/videoCompress.js')
        setProgress({ field, label: '压缩中 / 압축 중', value: 0, detail: `${file.name} · ${mb(file.size)}MB` })
        const started = Date.now()
        const r = await compressVideo(file, {
          signal: controller.signal,
          onProgress: (v) => {
            const elapsed = (Date.now() - started) / 1000
            const left = v > 0.03 ? Math.round((elapsed / v) * (1 - v)) : null
            setProgress({
              field, label: '压缩中 / 압축 중', value: v,
              detail: left == null ? '估算剩余时间… / 남은 시간 계산 중…' : `约剩 ${left} 秒 / 약 ${left}초 남음`,
            })
          },
        })
        toUpload = r.file
        note = ` · ${r.width}×${r.height} H.264`
        if (r.droppedAudio) note += ' ⚠️ 这个浏览器处理不了音频，已省略音轨 / 이 브라우저가 오디오를 처리하지 못해 오디오 트랙을 뺐습니다'
      }

      const { url, uploadedSize } = await uploadMedia(toUpload, field === 'video_url' ? 'videos' : 'images', {
        signal: controller.signal,
        onStage: (stage) =>
          setProgress(stage === 'compress'
            ? { field, label: '处理图片 / 이미지 처리 중', value: null, detail: file.name }
            : { field, label: '上传中 / 업로드 중', value: 0, detail: `${mb(toUpload.size)}MB` }),
        onProgress: (v) =>
          setProgress({ field, label: '上传中 / 업로드 중', value: v, detail: `${mb(toUpload.size * v)} / ${mb(toUpload.size)}MB` }),
      })

      setForm((f) => ({ ...f, [field]: url }))
      if (field === 'video_url') setVideoPrep(null)
      const shrunk = uploadedSize < file.size ? `（${mb(file.size)}MB → ${mb(uploadedSize)}MB）` : ''
      setMsg(`上传成功，记得点下方保存 / 업로드 성공, 아래에서 저장하세요: ${file.name} ${shrunk}${note}`)
    } catch (e2) {
      if (e2.name === 'AbortError') setMsg('已取消 / 취소했습니다')
      else setErr(e2.message || String(e2))
    } finally {
      abortRef.current = null
      setBusy('')
      setProgress(null)
    }
  }

  const cancelUpload = () => abortRef.current?.abort()

  // 排序由拖动决定：新增的条目放到当前分组末尾
  // 순서는 드래그로 결정: 새 항목은 해당 그룹의 맨 뒤에 추가
  const nextOrder = (rows) => rows.reduce((m, r) => Math.max(m, r.sort_order ?? 0), -1) + 1

  function sortOrderForSave() {
    if (tab === 'projects') return editingId ? form.sort_order : nextOrder(projects)
    if (tab === 'film') return editingId ? form.sort_order : nextOrder(works.filter((w) => w.kind === 'film'))
    const pid = form.project_id || null
    const original = works.find((w) => w.id === editingId)
    if (original && (original.project_id || null) === pid) return form.sort_order
    return nextOrder(works.filter((w) => w.kind === 'image' && (w.project_id || null) === pid && w.id !== editingId))
  }

  async function save(e) {
    e.preventDefault()
    setBusy('save'); setErr(''); setMsg('')
    try {
      if (tab === 'projects') {
        const payload = {
          title: form.title, title_cn: form.title_cn,
          meta: form.meta, role: form.role, sort_order: sortOrderForSave(),
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
          sort_order: sortOrderForSave(),
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

  async function reorder(table, newRows) {
    const changed = newRows
      .map((r, i) => ({ id: r.id, sort_order: i, prev: r.sort_order }))
      .filter((c) => c.prev !== c.sort_order)
    if (changed.length === 0) return

    // 乐观更新：界面立刻按新顺序显示 / 낙관적 업데이트: 화면에 새 순서 즉시 반영
    const order = new Map(newRows.map((r, i) => [r.id, i]))
    const apply = (rows) =>
      rows
        .map((r) => (order.has(r.id) ? { ...r, sort_order: order.get(r.id) } : r))
        .sort((a, b) => a.sort_order - b.sort_order)
    if (table === 'portfolio_projects') setProjects(apply)
    else setWorks(apply)

    setBusy('sort'); setErr(''); setMsg('')
    try {
      const results = await Promise.all(
        changed.map((c) => supabase.from(table).update({ sort_order: c.sort_order }).eq('id', c.id).select('id')),
      )
      const failed = results.find((r) => r.error)
      if (failed) throw failed.error
      // RLS 拒绝时不会报错，只是更新了 0 行，所以要单独检查
      // RLS 거부 시 오류 없이 0행만 수정되므로 별도로 확인
      if (results.some((r) => !r.data || r.data.length === 0)) {
        throw new Error('没有写入权限，可能是登录已过期，请重新登录 / 쓰기 권한 없음, 로그인이 만료되었을 수 있으니 다시 로그인하세요')
      }
      setMsg('顺序已保存 / 순서 저장 완료')
      onChanged?.()
    } catch (e2) {
      // 先恢复再显示错误：refresh() 开头会清空错误信息
      // 먼저 복구한 뒤 오류 표시: refresh() 가 시작할 때 오류 메시지를 비우기 때문
      await refresh()
      setErr('顺序没有保存，已恢复为数据库里的顺序 / 순서가 저장되지 않아 DB 의 순서로 복구했습니다: ' + (e2.message || String(e2)))
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

  const renderRow = (row, handle) => (
    <div className="admin__row" key={row.id}>
      {handle}
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
                >
                  {progress?.field === 'image_url' && <UploadProgress {...progress} onCancel={cancelUpload} />}
                </MediaField>
                {tab === 'film' && (
                  <MediaField
                    label="视频 Video（可选，可在网页里压缩 / 선택, 웹에서 압축 가능）" field="video_url" form={form} setForm={setForm}
                    busy={busy} onUpload={handleUpload} accept="video/*"
                  >
                    {videoPrep && !progress && (
                      <VideoPrep
                        prep={videoPrep}
                        disabled={Boolean(busy)}
                        onCompress={() => runUpload('video_url', videoPrep.file, { compress: true })}
                        onDirect={() => runUpload('video_url', videoPrep.file)}
                        onDismiss={() => setVideoPrep(null)}
                      />
                    )}
                    {progress?.field === 'video_url' && <UploadProgress {...progress} onCancel={cancelUpload} />}
                  </MediaField>
                )}

                <Field label="比例 Ratio（如 16 / 9、2 / 3）" value={form.ratio} onChange={(v) => setForm({ ...form, ratio: v })} />
              </>
            )}

            <button className="auth__submit" type="submit" disabled={busy === 'save' || Boolean(progress)}>
              {busy === 'save' ? '保存中… / 저장 중…' : editingId ? '保存修改 / 수정 저장' : '添加 / 추가'}
            </button>
          </form>

          {/* ---------- 列表 / 목록 ---------- */}
          <div className="admin__list">
            <h3 className="admin__h3">
              {isProjects ? '项目分组 / 프로젝트' : '已有内容 / 기존 항목'} <span>{list.length}</span>
            </h3>
            {list.length === 0 && !stillGroups?.length && <p className="admin__empty">还没有内容 / 항목이 없습니다</p>}
            {list.length > 1 && (
              <p className="admin__sorthint">
                拖动左侧 ⠿ 调整顺序，松手自动保存{stillGroups ? '（静帧在各自项目内排序）' : ''}
                <br />
                왼쪽 ⠿ 를 드래그하면 순서가 바뀌고 자동 저장됩니다{stillGroups ? ' (스틸은 프로젝트 안에서 정렬)' : ''}
              </p>
            )}
            {stillGroups
              ? stillGroups.map((g) => (
                  <div className="admin__group" key={g.key}>
                    <p className="admin__grouphead">{g.title} <span>{g.rows.length}</span></p>
                    {g.rows.length === 0 && <p className="admin__empty">此项目暂无静帧 / 이 프로젝트에 스틸 없음</p>}
                    <SortableList
                      rows={g.rows}
                      renderRow={renderRow}
                      onReorder={(rows) => reorder('portfolio_works', rows)}
                      disabled={busy === 'sort'}
                    />
                  </div>
                ))
              : (
                  <SortableList
                    rows={list}
                    renderRow={renderRow}
                    onReorder={(rows) => reorder(isProjects ? 'portfolio_projects' : 'portfolio_works', rows)}
                    disabled={busy === 'sort'}
                  />
                )}
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

function MediaField({ label, field, form, setForm, busy, onUpload, accept, children }) {
  return (
    <>
      <label className="auth__field">
        <span>{label}</span>
        <div className="admin__media">
          <input
            type="text"
            value={form[field] ?? ''}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            placeholder="/images/... 或上传 / 또는 업로드"
          />
          <label className={`admin__upload${busy ? ' is-disabled' : ''}`}>
            {busy === field ? '处理中…' : '上传 / 업로드'}
            <input type="file" accept={accept} onChange={(e) => onUpload(e, field)} disabled={Boolean(busy)} hidden />
          </label>
        </div>
        {form[field] && accept.startsWith('image') && (
          <img className="admin__preview" src={form[field]} alt="" />
        )}
      </label>
      {children}
    </>
  )
}

/** 选了视频之后：显示信息 + 建议，让你选压缩后上传或直接上传
 *  영상 선택 후: 정보와 권장 사항을 보여주고, 압축 후 업로드 또는 바로 업로드 선택 */
function VideoPrep({ prep, disabled, onCompress, onDirect, onDismiss }) {
  const { file, info, canCompress, probing } = prep
  const sizeMB = (file.size / 1048576).toFixed(1)
  const over = file.size > MAX_UPLOAD_MB * 1048576
  const badCodec = Boolean(info?.videoCodec && info.videoCodec !== 'avc')
  const recommend = over || badCodec
  const CODEC = { avc: 'H.264', hevc: 'HEVC (H.265)', vp9: 'VP9', av1: 'AV1' }

  return (
    <div className="vp">
      <div>
        <div className="vp__file">{file.name}</div>
        <div className="vp__meta">
          {sizeMB}MB
          {info && ` · ${info.width}×${info.height} · ${CODEC[info.videoCodec] || info.videoCodec || '?'} · ${Math.round(info.duration)}s`}
          {probing && ' · 读取中… / 읽는 중…'}
        </div>
      </div>

      {!probing && (
        <>
          {over && (
            <p className="vp__note vp__note--warn">
              超过 {MAX_UPLOAD_MB}MB 上限，必须压缩后才能上传。<br />
              {MAX_UPLOAD_MB}MB 제한을 넘어 압축해야 업로드할 수 있습니다.
            </p>
          )}
          {badCodec && (
            <p className="vp__note vp__note--warn">
              {CODEC[info.videoCodec] || info.videoCodec} 编码在部分浏览器（如 Chrome、Firefox）里播不了，建议压缩成 H.264。<br />
              이 코덱은 일부 브라우저(Chrome·Firefox 등)에서 재생되지 않아 H.264 압축을 권장합니다.
            </p>
          )}
          {!recommend && info && (
            <p className="vp__note vp__note--ok">
              已经是 H.264 且小于 {MAX_UPLOAD_MB}MB，可以直接上传。<br />
              이미 H.264 이고 {MAX_UPLOAD_MB}MB 미만이라 바로 올려도 됩니다.
            </p>
          )}
          {!canCompress && (
            <p className="vp__note vp__note--warn">
              这个浏览器不支持网页内压缩。请用 Chrome 打开管理页面，或在电脑上运行 scripts/compress-video.sh。<br />
              이 브라우저는 웹 압축을 지원하지 않습니다. Chrome 으로 관리 페이지를 열거나 scripts/compress-video.sh 를 실행하세요.
            </p>
          )}

          <div className="vp__actions">
            <button type="button" className={recommend ? 'vp__primary' : ''} onClick={onCompress} disabled={disabled || !canCompress}>
              压缩后上传{recommend ? '（推荐）' : ''} / 압축 후 업로드
            </button>
            <button type="button" className={!recommend ? 'vp__primary' : ''} onClick={onDirect} disabled={disabled || over}>
              直接上传原文件 / 원본 그대로 업로드
            </button>
            <button type="button" className="vp__ghost" onClick={onDismiss} disabled={disabled}>
              取消 / 취소
            </button>
          </div>
        </>
      )}
    </div>
  )
}
