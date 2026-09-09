import WorkCard from './WorkCard.jsx'

/**
 * 一组作品的展示：
 * 前 3 件用非对称网格（1 大 + 2 小）制造节奏，其余用瀑布流。
 * 不足 3 件时全部走网格。
 */
export default function WorkGrid({ works, onOpen, bare = false }) {
  const featured = works.slice(0, 3)
  const rest = works.slice(3)

  return (
    <>
      <div className={`featured ${featured.length < 3 ? 'featured--pair' : ''}`}>
        {featured.map((w, i) => (
          <WorkCard key={w.id} work={w} index={i} onOpen={onOpen} bare={bare} />
        ))}
      </div>

      {rest.length > 0 && (
        <div className="masonry">
          {rest.map((w, i) => (
            <div className="masonry__item" key={w.id}>
              <WorkCard work={w} index={i + 3} onOpen={onOpen} bare={bare} />
            </div>
          ))}
        </div>
      )}
    </>
  )
}
