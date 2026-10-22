import WorkCard from './WorkCard.jsx'

/**
 * 一组作品：卡片尺寸统一，所以用普通网格就能行列对齐。
 * 작품 목록: 카드 크기가 같으므로 일반 그리드로 행·열이 정렬된다.
 */
export default function WorkGrid({ works, onOpen, bare = false }) {
  return (
    <div className="wg">
      {works.map((w, i) => (
        <WorkCard key={w.id} work={w} index={i} onOpen={onOpen} bare={bare} />
      ))}
    </div>
  )
}
