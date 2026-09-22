import type { BenefitCategory, CategoryFilter } from '../../types/card.ts'

interface CategoryChipsProps {
  selected: CategoryFilter
  onSelect: (category: CategoryFilter) => void
  /** 내 카드 혜택에 실제로 존재하는 카테고리. 없으면 '전체'만 표시. */
  availableCategories: BenefitCategory[]
}

/**
 * 카테고리 칩 — 가로 스크롤. availableCategories(동적 목록)만 렌더링한다.
 * 선택: 강조색 배경 + 흰 글씨 / 미선택: var(--bg-sub) + 보조 글자색.
 * 색상은 토큰 클래스만 사용, hex 금지. 그림자/그라데이션 없음.
 */
export function CategoryChips({ selected, onSelect, availableCategories }: CategoryChipsProps) {
  return (
    <div
      role="tablist"
      aria-label="카테고리 필터"
      className="-mx-5 overflow-x-auto px-5"
    >
      <div className="flex gap-2 pb-1">
        {(['전체', ...availableCategories] as CategoryFilter[]).map((category) => {
          const isActive = category === selected
          return (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(category)}
              className={[
                'shrink-0 rounded-chip px-4 py-2 text-[13px] leading-none',
                isActive ? 'bg-accent font-semibold text-on-accent' : 'bg-bg-sub font-medium text-text-sub',
              ].join(' ')}
            >
              {category}
            </button>
          )
        })}
      </div>
    </div>
  )
}

