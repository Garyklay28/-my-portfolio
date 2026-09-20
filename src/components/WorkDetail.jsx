import { useEffect } from 'react'
import SmartImage from './SmartImage.jsx'

/** 作品详情：左图 + 右说明 两栏（手机端上下堆叠） */
export default function WorkDetail({ works, index, onClose, onStep }) {
  const work = works[index]
  const num = String(index + 1).padStart(2, '0')

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onStep(1)
      if (e.key === 'ArrowLeft') onStep(-1)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, onStep])

  if (!work) return null

  return (
    <div className="detail" role="dialog" aria-modal="true" aria-label={work.title}>
      <div className="detail__bar">
        <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <button className="detail__close" onClick={onClose}>← Close</button>
          <div className="detail__nav">
            <button onClick={() => onStep(-1)} disabled={index === 0}>Prev</button>
            <button onClick={() => onStep(1)} disabled={index === works.length - 1}>Next</button>
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className="detail__grid">
          <div className="detail__media">
            {work.video ? (
              <video
                className="detail__video"
                controls
                preload="metadata"
                poster={work.image}
                playsInline
                key={work.video}
              >
                <source src={work.video} type="video/mp4" />
                你的浏览器无法播放这段预告片。
              </video>
            ) : (
              <SmartImage src={work.image} alt={work.title} index={num} ratio={work.ratio} className="" />
            )}
          </div>

          <div className="detail__body">
            <div className="detail__index" aria-hidden="true">{num}</div>
            <h2 className="slab detail__title">{work.title}</h2>
            <p className="detail__titlecn">{work.titleCn}</p>

            <dl className="detail__facts">
              <div className="detail__fact"><dt>Category</dt><dd>{work.meta}</dd></div>
              {work.role && <div className="detail__fact"><dt>Role</dt><dd>{work.role}</dd></div>}
            </dl>

            <p className="detail__text">{work.body}</p>
            <p className="detail__text">{work.bodyEn}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
