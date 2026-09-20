import { useLayoutEffect, useRef, useState } from 'react'

/**
 * 瀑布流：按顺序把每件作品放进「当前最短的那一列」。
 * 메이슨리: 각 작품을 순서대로 "현재 가장 짧은 열" 에 배치.
 *
 * 高度用作品自己的画面比例预先算出来，不需要等图片加载，也不依赖浏览器的尺寸观察器，
 * 所以首屏就是最终版式，卡片之间的间距始终等于设定值，不会出现空洞或重叠。
 *
 * 높이는 작품의 화면 비율로 미리 계산하므로 이미지 로딩이나 브라우저 크기 관찰자에 의존하지 않는다.
 * 따라서 첫 화면이 곧 최종 레이아웃이고, 카드 간격은 항상 설정값과 같으며 빈 공간이나 겹침이 없다.
 */
export default function MasonryGrid({ items, renderItem, aspectOf, captionHeight = 0 }) {
  const ref = useRef(null)
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setWidth(el.getBoundingClientRect().width)
    measure()
    window.addEventListener('resize', measure)
    // 容器宽度也可能在窗口大小没变时改变（比如滚动条出现）
    // 창 크기가 그대로여도 컨테이너 폭이 바뀔 수 있음 (예: 스크롤바 등장)
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null
    observer?.observe(el)
    return () => {
      window.removeEventListener('resize', measure)
      observer?.disconnect()
    }
  }, [])

  const columnCount = width === 0 ? 3 : width < 560 ? 1 : width < 900 ? 2 : 3
  const columns = Array.from({ length: columnCount }, () => [])
  const heights = new Array(columnCount).fill(0)

  items.forEach((item, index) => {
    // 预估高度只用来决定放哪一列，不影响实际渲染高度
    // 예상 높이는 어느 열에 넣을지 정하는 데만 쓰이고 실제 렌더링 높이에는 영향 없음
    const aspect = aspectOf(item) || 1.5
    const estimated = 1 / aspect + captionHeight / Math.max(width / columnCount, 1)
    const shortest = heights.indexOf(Math.min(...heights))
    columns[shortest].push({ item, index })
    heights[shortest] += estimated
  })

  return (
    <div className="mg" ref={ref} style={{ '--mg-cols': columnCount }}>
      {columns.map((column, i) => (
        <div className="mg__col" key={i}>
          {column.map(({ item, index }) => renderItem(item, index))}
        </div>
      ))}
    </div>
  )
}
