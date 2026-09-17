import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { CSS } from '@dnd-kit/utilities'

/**
 * 可拖动排序的列表：拖左侧把手 ⠿ 改顺序，松手后把新顺序交给 onReorder。
 * 드래그 정렬 목록: 왼쪽 손잡이 ⠿ 를 끌어 순서 변경, 놓으면 새 순서를 onReorder 로 전달.
 *
 * - 鼠标、触屏都能用（PointerSensor），只从把手开始拖，不影响编辑/删除按钮
 * - 键盘也能用：Tab 到把手 → 空格拿起 → 方向键移动 → 空格放下
 * - 마우스·터치 모두 지원, 손잡이에서만 드래그 시작 (편집/삭제 버튼에 영향 없음)
 * - 키보드: Tab 으로 손잡이 → 스페이스로 들기 → 방향키 이동 → 스페이스로 놓기
 */
export default function SortableList({ rows, onReorder, renderRow, disabled = false }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return
    const from = rows.findIndex((r) => r.id === active.id)
    const to = rows.findIndex((r) => r.id === over.id)
    if (from < 0 || to < 0) return
    onReorder(arrayMove(rows, from, to))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy} disabled={disabled}>
        {rows.map((row) => (
          <SortableItem key={row.id} id={row.id}>
            {(handle) => renderRow(row, handle)}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  )
}

function SortableItem({ id, children }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id })

  const handle = (
    <button
      type="button"
      className="admin__handle"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      aria-label="拖动排序 / 드래그로 순서 변경"
      title="拖动排序 / 드래그로 순서 변경"
    >
      ⠿
    </button>
  )

  return (
    <div
      ref={setNodeRef}
      className={`admin__sortable${isDragging ? ' is-dragging' : ''}`}
      style={{ transform: CSS.Transform.toString(transform), transition, position: 'relative', zIndex: isDragging ? 5 : undefined }}
    >
      {children(handle)}
    </div>
  )
}
