import type { Benefit, Card, CategoryFilter } from '../../types/card.ts'
import { BenefitList } from './BenefitList.tsx'
import { CardSummaryList } from './CardSummaryList.tsx'
import { CategoryChips } from './CategoryChips.tsx'

interface BenefitsViewProps {
  myCardCount: number
  totalBenefitCount: number
  cards: Card[]
  benefitCountByCard: Record<string, number>
  selectedCategory: CategoryFilter
  onSelectCategory: (category: CategoryFilter) => void
  filteredBenefits: Benefit[]
  cardById: Record<string, Card>
  emptyMessage: string
}

/**
 * 혜택 모아보기 순수 UI — 상태·계산 없이 props만 그린다.
 * 순서: 헤더("내 카드 N장" + "이번 달 받을 수 있는 혜택이 N개 있어요")
 * → 카드 요약 박스 → 카테고리 칩 → 혜택 목록.
 */
export function BenefitsView({
  myCardCount,
  totalBenefitCount,
  cards,
  benefitCountByCard,
  selectedCategory,
  onSelectCategory,
  filteredBenefits,
  cardById,
  emptyMessage,
}: BenefitsViewProps) {
  return (
    <section className="flex flex-col gap-5">
      <header>
        <p className="text-[12px] font-medium leading-none text-text-sub">
          내 카드 {myCardCount}장
        </p>
        <h1 className="mt-2 text-[22px] font-bold leading-snug text-text">
          이번 달 받을 수 있는 혜택이{' '}
          <span className="text-accent">{totalBenefitCount}개</span> 있어요
        </h1>
      </header>

      <CardSummaryList cards={cards} benefitCountByCard={benefitCountByCard} />

      <CategoryChips selected={selectedCategory} onSelect={onSelectCategory} />

      <BenefitList benefits={filteredBenefits} cardById={cardById} emptyMessage={emptyMessage} />
    </section>
  )
}
