import SmartImage from './SmartImage.jsx'

/** 卡片统一用 3:2 横版，整站一个形状，行列才能完全对齐。
 *  超出的部分裁切掉，点进详情仍是完整图。
 *  카드는 3:2 가로형으로 통일해 사이트 전체가 한 형태이고 행·열이 정확히 정렬된다.
 *  넘치는 부분은 잘리며, 상세에서는 전체 이미지가 보인다. */
export const CARD_RATIO = '3 / 2'

/** bare = true 时只显示图片与编号，不显示下方标题与说明（图片板块用） */
export default function WorkCard({ work, index, onOpen, bare = false }) {
  const num = String(index + 1).padStart(2, '0')

  return (
    <button className="card" onClick={() => onOpen(index)} aria-label={`查看作品 ${num} ${work.title}`}>
      <div className="card__frame" style={{ aspectRatio: CARD_RATIO }}>
        <span className="card__index" aria-hidden="true">{num}</span>
        <SmartImage src={work.image} alt={work.title} index={num} ratio={CARD_RATIO} />
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
