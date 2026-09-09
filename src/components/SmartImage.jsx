import { useState } from 'react'

/**
 * 从 public/images 读取图片。
 * 文件不存在（404）或未提供路径时，自动渲染带编号的占位符。
 */
export default function SmartImage({ src, alt, index, ratio = '3 / 2', className = '' }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div className="ph" style={{ aspectRatio: ratio }} role="img" aria-label={`${alt} — 图片占位符`}>
        <span className="ph__mark">{index ?? '—'}</span>
        <span className="ph__label">Image Placeholder</span>
        {src && <span className="ph__path">{src}</span>}
      </div>
    )
  }

  return (
    <img
      className={`card__img ${className}`}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      style={{ aspectRatio: ratio }}
      onError={() => setFailed(true)}
    />
  )
}
