import MasonryGrid from './MasonryGrid.jsx'
import WorkCard from './WorkCard.jsx'

/** "16 / 9" → 1.778 */
function aspectOf(work) {
  const [w, h] = String(work.ratio || '3 / 2').split('/').map((n) => Number(n.trim()))
  return w > 0 && h > 0 ? w / h : 1.5
}

/**
 * 一组作品：按顺序从左到右排列，每张卡片保持自己的画面比例。
 * 작품 목록: 순서대로 왼쪽에서 오른쪽으로 배치, 각 카드는 자기 화면 비율 유지.
 */
export default function WorkGrid({ works, onOpen, bare = false }) {
  return (
    <MasonryGrid
      items={works}
      aspectOf={aspectOf}
      captionHeight={bare ? 0 : 58}
      renderItem={(w, i) => <WorkCard key={w.id} work={w} index={i} onOpen={onOpen} bare={bare} />}
    />
  )
}
