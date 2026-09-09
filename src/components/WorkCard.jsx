import SmartImage from './SmartImage.jsx'

/** bare = true 时只显示图片与编号，不显示下方标题与说明（图片板块用） */
export default function WorkCard({ work, index, onOpen, bare = false }) {
  const num = String(index + 1).padStart(2, '0')

  return (
    <button className="card" onClick={() => onOpen(index)} aria-label={`查看作品 ${num} ${work.title}`}>
      <div className="card__frame" style={{ aspectRatio: work.ratio }}>
        <span className="card__index" aria-hidden="true">{num}</span>
        <SmartImage src={work.image} alt={work.title} index={num} ratio={work.ratio} />
        {work.video && <span className="card__play" aria-hidden="true">▶</span>}
        <span className="card__view" aria-hidden="true">{work.video ? 'Play' : 'View'}</span>
      </div>

      {!bare && (
        <div className="card__meta">
          <span className="card__num">{num}</span>
          <div>
            <h3 className="card__title">{work.title}</h3>
            <p className="card__sub">{work.titleCn} · {work.meta}</p>
          </div>
        </div>
      )}
    </button>
  )
}
