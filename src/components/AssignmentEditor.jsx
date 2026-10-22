import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { uploadMedia, seedAssignments } from '../lib/content.js'
import SortableList from './SortableList.jsx'
import UploadProgress from './UploadProgress.jsx'

const FILE_KINDS = [
  ['md', 'MD — 页面内阅读 / 페이지 안에서 읽기'],
  ['pdf', 'PDF — 新标签页 / 새 탭'],
  ['code', 'CODE — 源码 / 소스'],
  ['play', 'PLAY — 可游玩网页 / 플레이 가능 페이지'],
  ['repo', 'GIT — GitHub 仓库 / 저장소'],
  ['figma', 'FIGMA — Figma 文件 / 파일'],
  ['img', 'IMG — 图片 / 이미지'],
]

const EMPTY = {
  week: '', date: '', title: '', title_cn: '', body: '', body_cn: '',
  video: { src: '', poster: '', captions: '', ratio: '16 / 9' },
  image: { src: '', alt: '', ratio: '16 / 9', href: '' },
  files: [],
  sort_order: 0,
}

const tidy = (v) => (v || '').replace(/\s+/g, ' ').trim()
const mb = (b) => (b / 1048576).toFixed(1)

/** Projects（课程作业）编辑：增删改 + 上传视频/图片 + 文件链接列表
 *  Projects(수업 과제) 편집: 추가·수정·삭제 + 영상/이미지 업로드 + 파일 링크 목록 */
export default function AssignmentEditor({ onChanged }) {
  const [rows, setRows] = useState([])
  const [form, setForm] = useState({ ...EMPTY })
  const [editingId, setEditingId] = useState(null)
  const [busy, setBusy] = useState('')
  const [progress, setProgress] = useState(null)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const abortRef = useRef(null)

  useEffect(() => { refresh() }, [])
  useEffect(() => () => abortRef.current?.abort(), [])

  async function refresh() {
    const { data, error } = await supabase
      .from('portfolio_assignments').select('*').order('sort_order')
    if (error) {
      setErr(error.message + ' —— Projects 数据表可能还没建好 / Projects 테이블이 아직 없을 수 있습니다')
      return
    }
    setErr('')
    setRows(data ?? [])
  }

  function reset() {
    setForm({ ...EMPTY, video: { ...EMPTY.video }, image: { ...EMPTY.image }, files: [] })
    setEditingId(null)
    setMsg(''); setErr('')
  }

  function edit(row) {
    setEditingId(row.id)
    setForm({
      ...EMPTY,
      ...row,
      video: { ...EMPTY.video, ...(row.video ?? {}) },
      image: { ...EMPTY.image, ...(row.image ?? {}) },
      files: Array.isArray(row.files) ? row.files.map((f) => ({ ...f })) : [],
    })
    setMsg(''); setErr('')
    document.querySelector('.admin__form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const setVideo = (patch) => setForm((f) => ({ ...f, video: { ...f.video, ...patch } }))
  const setImage = (patch) => setForm((f) => ({ ...f, image: { ...f.image, ...patch } }))

  async function upload(e, folder, apply) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const controller = new AbortController()
    abortRef.current = controller
    setBusy('upload'); setErr(''); setMsg('')
    try {
      const { url } = await uploadMedia(file, folder, {
        signal: controller.signal,
        onStage: (stage) => setProgress(stage === 'compress'
          ? { label: '处理图片 / 이미지 처리 중', value: null, detail: file.name }
          : { label: '上传中 / 업로드 중', value: 0, detail: `${mb(file.size)}MB` }),
        onProgress: (v) => setProgress({ label: '上传中 / 업로드 중', value: v, detail: `${mb(file.size * v)} / ${mb(file.size)}MB` }),
      })
      apply(url)
      setMsg(`上传成功，记得点下方保存 / 업로드 성공, 아래에서 저장하세요: ${file.name}`)
    } catch (e2) {
      if (e2.name === 'AbortError') setMsg('已取消 / 취소했습니다')
      else setErr(e2.message || String(e2))
    } finally {
      abortRef.current = null
      setBusy(''); setProgress(null)
    }
  }

  async function save(e) {
    e.preventDefault()
    setBusy('save'); setErr(''); setMsg('')
    try {
      const video = form.video.src ? { ...form.video, src: tidy(form.video.src) } : null
      const image = form.image.src ? { ...form.image, src: tidy(form.image.src) } : null
      const files = form.files.filter((f) => tidy(f.href)).map((f) => ({
        kind: f.kind || 'pdf', label: tidy(f.label) || f.href, href: tidy(f.href),
      }))
      const payload = {
        week: tidy(form.week), date: tidy(form.date),
        title: tidy(form.title), title_cn: tidy(form.title_cn),
        body: form.body?.trim() || null, body_cn: form.body_cn?.trim() || null,
        video, image, files,
        sort_order: editingId ? form.sort_order : rows.reduce((m, r) => Math.max(m, r.sort_order ?? 0), -1) + 1,
      }
      const res = editingId
        ? await supabase.from('portfolio_assignments').update(payload).eq('id', editingId).select('id')
        : await supabase.from('portfolio_assignments').insert(payload).select('id')
      if (res.error) throw res.error
      if (!res.data?.length) throw new Error('没有写入权限，可能是登录已过期 / 쓰기 권한 없음, 로그인이 만료되었을 수 있습니다')
      setMsg(editingId ? '已更新 / 수정 완료' : '已添加 / 추가 완료')
      reset()
      await refresh()
      onChanged?.()
    } catch (e2) {
      setErr(e2.message || String(e2))
    } finally {
      setBusy('')
    }
  }

  async function remove(row) {
    if (!window.confirm(`确定删除「${row.title}」？此操作无法撤销。\n"${row.title}" 을(를) 삭제할까요? 되돌릴 수 없습니다.`)) return
    setBusy('del'); setErr('')
    try {
      const { error } = await supabase.from('portfolio_assignments').delete().eq('id', row.id)
      if (error) throw error
      setMsg('已删除 / 삭제 완료')
      await refresh()
      onChanged?.()
    } catch (e2) { setErr(e2.message || String(e2)) }
    finally { setBusy('') }
  }

  async function reorder(next) {
    const changed = next.map((r, i) => ({ id: r.id, sort_order: i, prev: r.sort_order }))
      .filter((c) => c.prev !== c.sort_order)
    if (!changed.length) return
    setRows(next.map((r, i) => ({ ...r, sort_order: i })))
    setBusy('sort'); setErr(''); setMsg('')
    try {
      const results = await Promise.all(changed.map((c) =>
        supabase.from('portfolio_assignments').update({ sort_order: c.sort_order }).eq('id', c.id).select('id')))
      const failed = results.find((r) => r.error)
      if (failed) throw failed.error
      if (results.some((r) => !r.data?.length)) {
        throw new Error('没有写入权限，可能是登录已过期 / 쓰기 권한 없음, 로그인이 만료되었을 수 있습니다')
      }
      setMsg('顺序已保存 / 순서 저장 완료')
      onChanged?.()
    } catch (e2) {
      await refresh()
      setErr('顺序没有保存，已恢复 / 순서가 저장되지 않아 복구했습니다: ' + (e2.message || String(e2)))
    } finally { setBusy('') }
  }

  async function doSeed() {
    if (!window.confirm('把代码里的 9 个课程作业导入数据库？只需做一次。\n코드의 과제 9개를 DB 로 가져올까요? 한 번만 하면 됩니다.')) return
    setBusy('seed'); setErr(''); setMsg('')
    try {
      const n = await seedAssignments()
      setMsg(`导入完成 / 가져오기 완료: ${n} 条 / 개`)
      await refresh()
      onChanged?.()
    } catch (e2) { setErr(e2.message || String(e2)) }
    finally { setBusy('') }
  }

  const addFile = () => setForm((f) => ({ ...f, files: [...f.files, { kind: 'pdf', label: '', href: '' }] }))
  const upFile = (i, patch) => setForm((f) => ({ ...f, files: f.files.map((x, j) => (j === i ? { ...x, ...patch } : x)) }))
  const delFile = (i) => setForm((f) => ({ ...f, files: f.files.filter((_, j) => j !== i) }))
  const moveFile = (i, d) => setForm((f) => {
    const j = i + d
    if (j < 0 || j >= f.files.length) return f
    const next = [...f.files]
    ;[next[i], next[j]] = [next[j], next[i]]
    return { ...f, files: next }
  })

  return (
    <>
      {rows.length === 0 && !err && (
        <div className="admin__banner">
          <p>
            Projects 页现在显示的是<b>代码里的 9 个作业</b>，数据库还是空的。导入之后就能在这里编辑。
            <br />
            Projects 페이지는 현재 <b>코드의 과제 9개</b>를 표시 중이며 DB 는 비어 있습니다. 가져오면 여기서 편집할 수 있습니다.
          </p>
          <button className="admin__seed" onClick={doSeed} disabled={busy === 'seed'}>
            {busy === 'seed' ? '导入中… / 가져오는 중…' : '导入现有作业 / 기존 과제 가져오기'}
          </button>
        </div>
      )}

      {err && <p className="auth__error admin__msg">{err}</p>}
      {msg && <p className="auth__notice admin__msg">{msg}</p>}

      <div className="admin__cols">
        <form className="admin__form" onSubmit={save}>
          <h3 className="admin__h3">
            {editingId ? '编辑 / 수정' : '新增 / 추가'}
            {editingId && <button type="button" className="admin__cancel" onClick={reset}>取消 / 취소</button>}
          </h3>

          <div className="mf">
            <label className="auth__field">
              <span>周次 Week（如 W9）</span>
              <input type="text" value={form.week} onChange={(e) => setForm({ ...form, week: e.target.value })} placeholder="W9" />
            </label>
            <label className="auth__field">
              <span>日期 Date</span>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </label>
          </div>

          <label className="auth__field">
            <span>标题 Title *</span>
            <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>
          <label className="auth__field">
            <span>中文名 / 한글명</span>
            <input type="text" value={form.title_cn} onChange={(e) => setForm({ ...form, title_cn: e.target.value })} />
          </label>
          <label className="auth__field">
            <span>说明（韩/英）/ 설명</span>
            <textarea rows={3} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          </label>
          <label className="auth__field">
            <span>说明（中文）/ 중국어 설명</span>
            <textarea rows={3} value={form.body_cn} onChange={(e) => setForm({ ...form, body_cn: e.target.value })} />
          </label>

          <fieldset className="asgf">
            <legend>视频 Video（可留空 / 비워도 됨）</legend>
            <UploadRow label="视频文件 / 영상" value={form.video.src} accept="video/*" busy={busy}
                       onText={(v) => setVideo({ src: v })} onPick={(e) => upload(e, 'assignments', (u) => setVideo({ src: u }))} />
            <UploadRow label="封面图 Poster / 포스터" value={form.video.poster} accept="image/*" busy={busy}
                       onText={(v) => setVideo({ poster: v })} onPick={(e) => upload(e, 'assignments', (u) => setVideo({ poster: u }))} />
            <div className="mf">
              <label className="auth__field">
                <span>字幕 VTT / 자막</span>
                <input type="text" value={form.video.captions} onChange={(e) => setVideo({ captions: e.target.value })} placeholder="/assignments/…vtt" />
              </label>
              <label className="auth__field">
                <span>比例 / 비율</span>
                <input type="text" value={form.video.ratio} onChange={(e) => setVideo({ ratio: e.target.value })} placeholder="16 / 9" />
              </label>
            </div>
          </fieldset>

          <fieldset className="asgf">
            <legend>图片 Image（可留空 / 비워도 됨）</legend>
            <UploadRow label="图片 / 이미지" value={form.image.src} accept="image/*" busy={busy}
                       onText={(v) => setImage({ src: v })} onPick={(e) => upload(e, 'assignments', (u) => setImage({ src: u }))} />
            <label className="auth__field">
              <span>说明文字 Alt / 대체 텍스트</span>
              <input type="text" value={form.image.alt} onChange={(e) => setImage({ alt: e.target.value })} />
            </label>
            <div className="mf">
              <label className="auth__field">
                <span>比例 / 비율</span>
                <input type="text" value={form.image.ratio} onChange={(e) => setImage({ ratio: e.target.value })} placeholder="16 / 9" />
              </label>
              <label className="auth__field">
                <span>点击打开 / 클릭 시 링크</span>
                <input type="text" value={form.image.href} onChange={(e) => setImage({ href: e.target.value })} />
              </label>
            </div>
          </fieldset>

          {progress && <UploadProgress {...progress} onCancel={() => abortRef.current?.abort()} />}

          <fieldset className="asgf">
            <legend>文件与链接 Files / 파일·링크 <span>{form.files.length}</span></legend>
            {form.files.length === 0 && <p className="admin__empty">还没有链接 / 링크 없음</p>}
            {form.files.map((f, i) => (
              <div className="pe__row" key={i}>
                <div className="pe__rowfields asgf__file">
                  <select value={f.kind} onChange={(e) => upFile(i, { kind: e.target.value })}>
                    {FILE_KINDS.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                  </select>
                  <input type="text" placeholder="显示名称 / 표시 이름" value={f.label} onChange={(e) => upFile(i, { label: e.target.value })} />
                  <input type="text" placeholder="链接或路径 / 링크 또는 경로" value={f.href} onChange={(e) => upFile(i, { href: e.target.value })} />
                </div>
                <div className="pe__rowacts">
                  <button type="button" onClick={() => moveFile(i, -1)} disabled={i === 0}>↑</button>
                  <button type="button" onClick={() => moveFile(i, 1)} disabled={i === form.files.length - 1}>↓</button>
                  <button type="button" className="admin__del" onClick={() => delFile(i)}>×</button>
                </div>
              </div>
            ))}
            <button type="button" className="pe__add" onClick={addFile}>+ 添加链接 / 링크 추가</button>
          </fieldset>

          <button className="auth__submit" type="submit" disabled={busy === 'save' || Boolean(progress)}>
            {busy === 'save' ? '保存中… / 저장 중…' : editingId ? '保存修改 / 수정 저장' : '添加 / 추가'}
          </button>
        </form>

        <div className="admin__list">
          <h3 className="admin__h3">已有内容 / 기존 항목 <span>{rows.length}</span></h3>
          {rows.length === 0 && <p className="admin__empty">还没有内容 / 항목이 없습니다</p>}
          {rows.length > 1 && (
            <p className="admin__sorthint">
              拖动左侧 ⠿ 调整顺序，松手自动保存
              <br />
              왼쪽 ⠿ 를 드래그하면 순서가 바뀌고 자동 저장됩니다
            </p>
          )}
          <SortableList
            rows={rows}
            disabled={busy === 'sort'}
            onReorder={reorder}
            renderRow={(row, handle) => (
              <div className="admin__row" key={row.id}>
                {handle}
                <div className="admin__thumb">
                  {row.video?.poster || row.image?.src
                    ? <img src={row.video?.poster || row.image?.src} alt="" loading="lazy" />
                    : <span>{row.week || '—'}</span>}
                </div>
                <div className="admin__rowmain">
                  <strong>{row.week ? `${row.week} · ` : ''}{row.title}</strong>
                  <span>{row.title_cn} {row.date && `· ${row.date}`}</span>
                  <span>{(row.files?.length ?? 0)} 个链接 / 링크 {row.files?.length ?? 0}개{row.video?.src ? ' · VIDEO' : ''}</span>
                </div>
                <div className="admin__actions">
                  <button onClick={() => edit(row)}>编辑</button>
                  <button className="admin__del" onClick={() => remove(row)} disabled={busy === 'del'}>删除</button>
                </div>
              </div>
            )}
          />
        </div>
      </div>
    </>
  )
}

function UploadRow({ label, value, accept, busy, onText, onPick }) {
  return (
    <label className="auth__field">
      <span>{label}</span>
      <div className="admin__media">
        <input type="text" value={value} onChange={(e) => onText(e.target.value)} placeholder="/assignments/… 或上传 / 또는 업로드" />
        <label className={`admin__upload${busy ? ' is-disabled' : ''}`}>
          {busy === 'upload' ? '处理中…' : '上传 / 업로드'}
          <input type="file" accept={accept} hidden disabled={Boolean(busy)} onChange={onPick} />
        </label>
      </div>
    </label>
  )
}
