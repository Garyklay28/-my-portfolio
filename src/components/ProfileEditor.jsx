import { useEffect, useState } from 'react'
import { loadProfile, saveProfile, uploadMedia } from '../lib/content.js'

/** 各列表的字段定义 / 각 목록의 필드 정의 */
const LISTS = [
  { key: 'disciplines', label: '职能条 Disciplines / 직능', fields: [['en', 'English'], ['cn', '中文 · 한글']] },
  { key: 'education',   label: '教育背景 Education / 학력',  fields: [['degree', '学位 Degree'], ['school', '学校 School']] },
  { key: 'credits',     label: '影片经历 Credits / 필모',    fields: [['title', '片名 Title'], ['kind', '类型 Kind'], ['role', '职位 Role']] },
  { key: 'work',        label: '工作经历 Work / 경력',       fields: [['org', '机构 Org'], ['role', '职位 Role']] },
  { key: 'awards',      label: '获奖 Awards / 수상',         fields: [['festival', '电影节 Festival'], ['prize', '奖项 Prize'], ['status', '状态 Status']] },
  { key: 'contact',     label: '联系方式 Contact / 연락처',  fields: [['label', '标签 Label'], ['value', '内容 Value'], ['href', '链接 Href（可空）']] },
]

export default function ProfileEditor({ onSaved }) {
  const [p, setP] = useState(null)
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => { loadProfile().then(setP) }, [])

  if (!p) return <p className="admin__empty">读取中… / 불러오는 중…</p>

  const set = (k, v) => setP({ ...p, [k]: v })

  async function upload(e, apply) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy('upload'); setErr('')
    try {
      const url = await uploadMedia(file, 'profile')
      apply(url)
      setMsg(`上传成功 / 업로드 성공: ${file.name}`)
    } catch (e2) { setErr(e2.message || String(e2)) }
    finally { setBusy(''); e.target.value = '' }
  }

  async function save(e) {
    e.preventDefault()
    setBusy('save'); setErr(''); setMsg('')
    try {
      await saveProfile(p)
      setMsg('简介已保存 / 프로필 저장 완료')
      onSaved?.()
    } catch (e2) { setErr(e2.message || String(e2)) }
    finally { setBusy('') }
  }

  return (
    <form className="pe" onSubmit={save}>
      {err && <p className="auth__error admin__msg">{err}</p>}
      {msg && <p className="auth__notice admin__msg">{msg}</p>}

      <section className="pe__block">
        <h3 className="admin__h3">基本信息 / 기본 정보</h3>
        <div className="pe__grid">
          <Text label="姓名 Name" v={p.name} on={(v) => set('name', v)} />
          <Text label="中文名 / 한글명" v={p.nameCn} on={(v) => set('nameCn', v)} />
          <Text label="职业 Role" v={p.role} on={(v) => set('role', v)} />
          <Text label="标语 Tagline" v={p.tagline} on={(v) => set('tagline', v)} />
        </div>
        <Area label="首页引言 Quote（英文斜体那段）" rows={3} v={p.quote} on={(v) => set('quote', v)} />
      </section>

      <section className="pe__block">
        <h3 className="admin__h3">个人简介 / 소개글</h3>
        <Area label="中文 / 중국어" rows={5} v={p.bio} on={(v) => set('bio', v)} />
        <Area label="English" rows={5} v={p.bioEn} on={(v) => set('bioEn', v)} />
      </section>

      <section className="pe__block">
        <h3 className="admin__h3">导演照片 / 감독 사진</h3>
        <div className="admin__media">
          <input type="text" value={p.portrait ?? ''} onChange={(e) => set('portrait', e.target.value)} />
          <label className="admin__upload">
            {busy === 'upload' ? '上传中…' : '上传 / 업로드'}
            <input type="file" accept="image/*" hidden onChange={(e) => upload(e, (url) => set('portrait', url))} />
          </label>
        </div>
        {p.portrait && <img className="admin__preview" src={p.portrait} alt="" />}
      </section>

      <section className="pe__block">
        <h3 className="admin__h3">
          电影节桂冠 / 월계관 <span>{p.laurels?.length ?? 0}</span>
        </h3>
        <div className="pe__laurels">
          {(p.laurels ?? []).map((url, i) => (
            <div className="pe__laurel" key={i}>
              <img src={url} alt="" />
              <button type="button" onClick={() => set('laurels', p.laurels.filter((_, j) => j !== i))}>×</button>
            </div>
          ))}
        </div>
        <label className="admin__upload pe__addlaurel">
          {busy === 'upload' ? '上传中…' : '+ 添加桂冠 / 월계관 추가'}
          <input type="file" accept="image/*" hidden
                 onChange={(e) => upload(e, (url) => set('laurels', [...(p.laurels ?? []), url]))} />
        </label>
      </section>

      {LISTS.map(({ key, label, fields }) => (
        <ListEditor key={key} label={label} fields={fields}
                    rows={p[key] ?? []} onChange={(rows) => set(key, rows)} />
      ))}

      <button className="auth__submit pe__save" type="submit" disabled={busy === 'save'}>
        {busy === 'save' ? '保存中… / 저장 중…' : '保存简介 / 프로필 저장'}
      </button>
    </form>
  )
}

function Text({ label, v, on }) {
  return (
    <label className="auth__field">
      <span>{label}</span>
      <input type="text" value={v ?? ''} onChange={(e) => on(e.target.value)} />
    </label>
  )
}

function Area({ label, v, on, rows = 3 }) {
  return (
    <label className="auth__field">
      <span>{label}</span>
      <textarea rows={rows} value={v ?? ''} onChange={(e) => on(e.target.value)} />
    </label>
  )
}

function ListEditor({ label, fields, rows, onChange }) {
  const blank = Object.fromEntries(fields.map(([k]) => [k, '']))
  const up = (i, k, v) => onChange(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)))
  const move = (i, d) => {
    const j = i + d
    if (j < 0 || j >= rows.length) return
    const next = [...rows]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <section className="pe__block">
      <h3 className="admin__h3">{label} <span>{rows.length}</span></h3>

      {rows.length === 0 && <p className="admin__empty">还没有条目 / 항목이 없습니다</p>}

      {rows.map((row, i) => (
        <div className="pe__row" key={i}>
          <div className="pe__rowfields">
            {fields.map(([k, ph]) => (
              <input key={k} type="text" placeholder={ph} value={row[k] ?? ''} onChange={(e) => up(i, k, e.target.value)} />
            ))}
          </div>
          <div className="pe__rowacts">
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} title="上移">↑</button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} title="下移">↓</button>
            <button type="button" className="admin__del" onClick={() => onChange(rows.filter((_, j) => j !== i))} title="删除">×</button>
          </div>
        </div>
      ))}

      <button type="button" className="pe__add" onClick={() => onChange([...rows, blank])}>
        + 添加一条 / 항목 추가
      </button>
    </section>
  )
}
