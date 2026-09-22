import type { BenefitViewMode } from '../../types/card.ts'

/** 표시 순서·라벨 (UI 전용 상수) */
const OPTIONS: { value: BenefitViewMode; label: string }[] = [
  { value: 'benefit', label: '혜택별' },
  { value: 'card', label: '카드별' },
]

interface ViewModeToggleProps {
  value: BenefitViewMode
  onChange: (mode: BenefitViewMode) => void
}

/**
 * 보기 방식 세그먼트 토글 — var(--bg-sub) 알약 안에 두 버튼이 전체 폭의 절반씩.
 * 선택된 쪽만 강조색 배경 + 흰 글씨, 나머지는 보조 글자색.
 * 상태는 부모(페이지)가 관리하고 여기서는 props만 그린다.
 */
export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  return (
    <div role="tablist" aria-label="보기 방식" className="flex rounded-chip bg-bg-sub p-1">
      {OPTIONS.map((option) => {
        const isActive = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={[
              'flex-1 rounded-chip py-2 text-[13px] leading-none',
              isActive
                ? 'bg-accent font-semibold text-on-accent'
                : 'font-medium text-text-sub',
            ].join(' ')}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
