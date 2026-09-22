import type {
  Benefit,
  BenefitCategory,
  BenefitViewMode,
  Card,
  CategoryFilter,
} from '../../types/card.ts'
import type { CardBenefitGroup } from '../../lib/benefits.ts'
import { BenefitList } from './BenefitList.tsx'
import { CardBenefitSections } from './CardBenefitSections.tsx'
import { CardSummaryList } from './CardSummaryList.tsx'
import { CategoryChips } from './CategoryChips.tsx'
import { ViewModeToggle } from './ViewModeToggle.tsx'

interface BenefitsViewProps {
  myCardCount: number
  totalBenefitCount: number
  cards: Card[]
  benefitCountByCard: Record<string, number>
  viewMode: BenefitViewMode
  onChangeViewMode: (mode: BenefitViewMode) => void
  /** 내 카드 혜택에 실제로 존재하는 카테고리만 (동적 칩) */
  availableCategories: BenefitCategory[]
  selectedCategory: CategoryFilter
  onSelectCategory: (category: CategoryFilter) => void
  selectedCardId: string | null
  onSelectCard: (cardId: string) => void
  filteredBenefits: Benefit[]
  cardById: Record<string, Card>
  cardGroups: CardBenefitGroup[]
  benefitEmptyMessage: string
  cardEmptyMessage: string
}

/**
 * 혜택 모아보기 순수 UI — 상태·계산 없이 props만 그린다.
 * 순서: 헤더("내 카드 N장" + "이번 달 받을 수 있는 혜택이 N개 있어요")
 * → 카드 요약 박스(+안내 한 줄) → 보기 방식 토글 → 카테고리 칩 → 목록.
 * 혜택별 보기는 BenefitList(카드 태그 포함), 카드별 보기는
 * CardBenefitSections(카드 섹션, 카드 태그 생략). 칩 필터는 두 보기 모두에 적용된다.
 */
export function BenefitsView({
  myCardCount,
  totalBenefitCount,
  cards,
  benefitCountByCard,
  viewMode,
  onChangeViewMode,
  availableCategories,
  selectedCategory,
  onSelectCategory,
  selectedCardId,
  onSelectCard,
  filteredBenefits,
  cardById,
  cardGroups,
  benefitEmptyMessage,
  cardEmptyMessage,
}: BenefitsViewProps) {
  const selectedCard = selectedCardId
    ? cards.find((card) => card.id === selectedCardId)
    : undefined

  // 카드 요약 박스 동작 안내 — 보기 방식에 따라 의미가 달라진다
  const cardHint =
    viewMode === 'benefit'
      ? selectedCard
        ? `${selectedCard.name} 혜택만 보는 중 · 카드를 다시 누르면 전체`
        : '카드를 누르면 그 카드 혜택만 볼 수 있어요'
      : '카드를 누르면 해당 카드 섹션으로 이동해요'

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

      <div className="flex flex-col gap-2">
        <CardSummaryList
          cards={cards}
          benefitCountByCard={benefitCountByCard}
          onCardClick={onSelectCard}
          selectedCardId={selectedCardId}
        />
        {cards.length > 0 ? (
          <p className="text-[12px] leading-none text-text-muted">{cardHint}</p>
        ) : null}
      </div>

      <ViewModeToggle value={viewMode} onChange={onChangeViewMode} />

      <CategoryChips
        selected={selectedCategory}
        onSelect={onSelectCategory}
        availableCategories={availableCategories}
      />

      {viewMode === 'benefit' ? (
        <BenefitList
          benefits={filteredBenefits}
          cardById={cardById}
          emptyMessage={benefitEmptyMessage}
        />
      ) : (
        <CardBenefitSections groups={cardGroups} emptyMessage={cardEmptyMessage} />
      )}
    </section>
  )
}

