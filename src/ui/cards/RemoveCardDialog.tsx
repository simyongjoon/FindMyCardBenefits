import type { Card } from '../../types/card.ts'
import { useDialogBehavior } from './MyCardList.tsx'

interface RemoveCardDialogProps {
  card: Card
  onCancel: () => void
  onConfirm: () => void
}

/**
 * 삭제 확인 다이얼로그 — 중앙 팝업.
 * "A카드를 삭제할까요?" + [취소](밋밋한 버튼) [삭제](유일한 채움 강조 버튼).
 * 채움 강조 버튼은 이 다이얼로그 안에서 1개만 사용한다.
 */
export function RemoveCardDialog({ card, onCancel, onConfirm }: RemoveCardDialogProps) {
  useDialogBehavior(onCancel)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${card.name} 삭제 확인`}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onCancel}
        className="absolute inset-0 bg-scrim"
      />
      <div className="relative w-full max-w-[430px] rounded-t-card border border-border bg-bg px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6 sm:mx-4 sm:rounded-card">
        <p className="text-center text-[17px] font-bold leading-snug text-text">
          {card.name}를 삭제할까요?
        </p>
        <p className="mt-2 text-center text-[13px] leading-relaxed text-text-sub">
          삭제하면 혜택 모아보기에서도 제외돼요
        </p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-[52px] flex-1 rounded-card bg-bg-sub text-[15px] font-semibold text-text"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-[52px] flex-1 rounded-card bg-accent text-[15px] font-semibold text-on-accent"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  )
}
