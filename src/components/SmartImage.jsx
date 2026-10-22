import { useState } from 'react'

/**
 * 从 public/images 读取图片。
 * 文件不存在（404）或未提供路径时，自动渲染带编号的占位符。
 */
export default function SmartImage({ src, alt, index, ratio = '3 / 2', className = '' }) {
  const [failed, setFailed] = useState(false)
  // 竖图放进横版卡片时，裁切保留上半部分：海报下方通常是演职员字幕，上方才是主画面
  // 세로 이미지를 가로 카드에 넣고 자를 때 위쪽을 남김: 포스터 아래는 보통 크레딧, 위가 주요 화면
  const [tall, setTall] = useState(false)

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
      className={`card__img${tall ? ' is-tall' : ''} ${className}`}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      style={{ aspectRatio: ratio }}
      onLoad={(e) => setTall(e.currentTarget.naturalHeight > e.currentTarget.naturalWidth)}
      onError={() => setFailed(true)}
    />
  )
}
