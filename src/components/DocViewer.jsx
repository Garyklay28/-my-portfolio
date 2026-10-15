import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { marked } from 'marked'

/**
 * Markdown 文档阅读器（全屏层）/ Markdown 문서 뷰어 (전체 화면)
 * 挂到 body 上：标签页面板有 transform，fixed 定位会被它困住
 * body 에 붙임: 탭 패널의 transform 때문에 fixed 위치가 패널 안에 갇히기 때문
 */
export default function DocViewer({ doc, onClose }) {
  const [html, setHtml] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    fetch(doc.href)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.text()
      })
      .then((text) => active && setHtml(marked.parse(text)))
      .catch((err) => active && setError(err.message))
    return () => { active = false }
  }, [doc.href])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return createPortal(
    <div className="detail" role="dialog" aria-modal="true" aria-label={doc.label}>
      <div className="detail__bar">
        <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <button className="detail__close" onClick={onClose}>← Close</button>
          <a className="asg__file" href={doc.href} download>
            <span className="asg__kind">MD</span>
            {doc.label} ↓
          </a>
        </div>
      </div>

      <div className="wrap">
        {error ? (
          <p className="asg__text">文档加载失败 / 문서를 불러오지 못했습니다 ({error})</p>
        ) : (
          // 内容来自本站 public/ 下自己的文件 / 내용은 이 사이트 public/ 의 자체 파일
          <article className="md" dangerouslySetInnerHTML={{ __html: html }} />
        )}
      </div>
    </div>,
    document.body,
  )
}
