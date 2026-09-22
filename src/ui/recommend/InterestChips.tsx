import { BENEFIT_CATEGORIES } from '../../lib/benefits.ts'
import type { BenefitCategory } from '../../types/card.ts'

interface InterestChipsProps {
  selected: BenefitCategory[]
  onToggle: (category: BenefitCategory) => void
}

/**
 * 관심분야 칩 — 여러 개 선택 가능, 가로 스크롤 없이 줄바꿈 나열.
 * 선택: 강조색 배경 + 흰 글씨 / 미선택: var(--bg-sub) 배경 + 보조 글자색.
 */
export function InterestChips({ selected, onToggle }: InterestChipsProps) {
  return (
    <div role="group" aria-label="관심분야 선택" className="flex flex-wrap gap-2">
      {BENEFIT_CATEGORIES.map((category) => {
        const isActive = selected.includes(category)
        return (
          <button
            key={category}
            type="button"
            aria-pressed={isActive}
            onClick={() => onToggle(category)}
            className={[
              'rounded-chip px-4 py-2 text-[13px] leading-none',
              isActive
                ? 'bg-accent font-semibold text-on-accent'
                : 'bg-bg-sub font-medium text-text-sub',
            ].join(' ')}
          >
            {category}
          </button>
        )
      })}
    </div>
  )
}
