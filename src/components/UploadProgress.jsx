/**
 * 上传 / 压缩进度条。value 为 null 时显示不确定进度（来回滑动）。
 * 업로드 / 압축 진행률 표시줄. value 가 null 이면 진행률을 알 수 없는 상태로 표시.
 */
export default function UploadProgress({ label, value, detail, onCancel }) {
  const pct = value == null ? null : Math.round(value * 100)
  return (
    <div className="up">
      <div className="up__head">
        <span className="up__label">{label}</span>
        <span className="up__pct">{pct == null ? '…' : `${pct}%`}</span>
      </div>
      <div
        className={`up__bar${pct == null ? ' is-indeterminate' : ''}`}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct ?? undefined}
      >
        <i style={pct == null ? undefined : { width: `${pct}%` }} />
      </div>
      {(detail || onCancel) && (
        <div className="up__foot">
          <span>{detail}</span>
          {onCancel && (
            <button type="button" className="up__cancel" onClick={onCancel}>取消 / 취소</button>
          )}
        </div>
      )}
    </div>
  )
}
