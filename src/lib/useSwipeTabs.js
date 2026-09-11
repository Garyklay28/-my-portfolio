import { useEffect, useRef } from 'react'

/**
 * 手机端左右滑动切换标签页。
 * 모바일에서 좌우 스와이프로 탭 전환.
 *
 * - 手指跟随：拖动时内容跟着手指走，松手后决定是切换还是回弹
 * - 方向锁定：先判断是横滑还是竖滑，竖滑时完全不干预页面滚动
 * - 边缘阻尼：第一页往右、最后一页往左拖时有橡皮筋阻力
 * - 只响应触摸，电脑鼠标不受影响
 *
 * - 손가락 추적: 드래그 중 콘텐츠가 따라오고, 손을 떼면 전환 또는 복귀
 * - 방향 고정: 가로/세로를 먼저 판별, 세로일 때는 스크롤에 전혀 개입하지 않음
 * - 가장자리 저항: 첫 탭에서 오른쪽, 마지막 탭에서 왼쪽으로 끌면 고무줄 저항
 * - 터치에만 반응, PC 마우스에는 영향 없음
 */
export function useSwipeTabs(areaRef, panelRef, { canPrev, canNext, onPrev, onNext }) {
  // 回调放进 ref，避免每次渲染重新绑定监听器
  // 콜백을 ref 에 보관해 렌더링마다 리스너를 다시 붙이지 않음
  const cb = useRef({ canPrev, canNext, onPrev, onNext })
  useEffect(() => {
    cb.current = { canPrev, canNext, onPrev, onNext }
  })

  useEffect(() => {
    const area = areaRef.current
    if (!area) return

    // 从这些元素上开始的触摸不算滑动（输入框、视频进度条等）
    // 이 요소에서 시작된 터치는 스와이프로 취급하지 않음 (입력란·영상 등)
    const IGNORE = 'input, textarea, select, video, [data-no-swipe]'
    const EASE = 'cubic-bezier(0.2, 0.7, 0.3, 1)'

    let sx = 0, sy = 0, dx = 0, t0 = 0
    let lock = null      // null | 'x' | 'y'
    let active = false

    const panel = () => panelRef.current

    function setStyle(transform, opacity, transition) {
      const p = panel()
      if (!p) return
      p.style.transition = transition
      p.style.transform = transform
      p.style.opacity = opacity
    }

    function snapBack() {
      setStyle('', '', `transform 0.28s ${EASE}, opacity 0.28s ${EASE}`)
    }

    function commit(dir) {
      // dir = 1 下一页（从右边进入），-1 上一页（从左边进入）
      // dir = 1 다음 탭 (오른쪽에서 진입), -1 이전 탭 (왼쪽에서 진입)
      if (dir > 0) cb.current.onNext()
      else cb.current.onPrev()
      setStyle(`translateX(${dir > 0 ? 36 : -36}%)`, '0', 'none')
      requestAnimationFrame(() =>
        requestAnimationFrame(() =>
          setStyle('', '', `transform 0.34s ${EASE}, opacity 0.34s ${EASE}`),
        ),
      )
    }

    function onStart(e) {
      if (e.touches.length !== 1 || e.target.closest(IGNORE)) return
      active = true
      lock = null
      dx = 0
      sx = e.touches[0].clientX
      sy = e.touches[0].clientY
      t0 = Date.now()
    }

    function onMove(e) {
      if (!active) return
      const mx = e.touches[0].clientX - sx
      const my = e.touches[0].clientY - sy

      if (!lock) {
        if (Math.abs(mx) < 10 && Math.abs(my) < 10) return
        lock = Math.abs(mx) > Math.abs(my) * 1.2 ? 'x' : 'y'
      }
      if (lock !== 'x') return

      dx = mx
      const atEdge = (dx > 0 && !cb.current.canPrev()) || (dx < 0 && !cb.current.canNext())
      const shown = atEdge ? dx * 0.22 : dx
      const fade = 1 - Math.min(Math.abs(shown) / window.innerWidth, 1) * 0.45
      setStyle(`translateX(${shown}px)`, String(fade), 'none')
    }

    function onEnd() {
      if (!active) return
      active = false
      if (lock !== 'x') return

      const speed = Math.abs(dx) / Math.max(Date.now() - t0, 1) // px / ms
      // 拖过屏幕宽度 22%，或者快速轻扫（>40px 且速度快）都算切换
      // 화면 폭 22% 이상 끌거나, 빠르게 튕기면(40px 이상 + 빠른 속도) 전환
      const passed = Math.abs(dx) > window.innerWidth * 0.22 || (Math.abs(dx) > 40 && speed > 0.45)

      if (passed && dx < 0 && cb.current.canNext()) commit(1)
      else if (passed && dx > 0 && cb.current.canPrev()) commit(-1)
      else snapBack()
    }

    area.addEventListener('touchstart', onStart, { passive: true })
    area.addEventListener('touchmove', onMove, { passive: true })
    area.addEventListener('touchend', onEnd, { passive: true })
    area.addEventListener('touchcancel', snapBack, { passive: true })
    return () => {
      area.removeEventListener('touchstart', onStart)
      area.removeEventListener('touchmove', onMove)
      area.removeEventListener('touchend', onEnd)
      area.removeEventListener('touchcancel', snapBack)
    }
  }, [areaRef, panelRef])
}
