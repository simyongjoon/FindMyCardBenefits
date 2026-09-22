import { useMemo, useState } from 'react'
import allBenefitsJson from '../../data/benefits.json'
import allCardsJson from '../../data/cards.json'
import { useMyCards } from '../../hooks/useMyCards.ts'
import {
  countBenefitsByCard,
  filterBenefitsByCategory,
  getMyBenefits,
  getMyCards,
} from '../../lib/benefits.ts'
import type { Benefit, Card, CategoryFilter } from '../../types/card.ts'
import { BenefitsView } from '../../ui/benefits/BenefitsView.tsx'

const ALL_CARDS = allCardsJson as Card[]
const ALL_BENEFITS = allBenefitsJson as Benefit[]

/**
 * /benefits — 데이터 연결(컨테이너).
 * 계산은 src/lib/benefits.ts 순수 함수에 위임하고,
 * 그리기는 ui/benefits/BenefitsView에 위임한다.
 */
export function BenefitsPage() {
  const { myCardIds } = useMyCards()
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('전체')

  const myCards = useMemo(() => getMyCards(ALL_CARDS, myCardIds), [myCardIds])
  const myBenefits = useMemo(() => getMyBenefits(ALL_BENEFITS, myCardIds), [myCardIds])
  const filteredBenefits = useMemo(
    () => filterBenefitsByCategory(myBenefits, selectedCategory),
    [myBenefits, selectedCategory],
  )

  const cardById = useMemo(() => {
    const map: Record<string, Card> = {}
    for (const card of myCards) map[card.id] = card
    return map
  }, [myCards])

  const benefitCountByCard = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const card of myCards) counts[card.id] = countBenefitsByCard(myBenefits, card.id)
    return counts
  }, [myCards, myBenefits])

  const emptyMessage =
    myCards.length === 0 ? '등록한 카드의 혜택이 없어요' : `${selectedCategory} 혜택이 없어요`

  return (
    <BenefitsView
      myCardCount={myCards.length}
      totalBenefitCount={myBenefits.length}
      cards={myCards}
      benefitCountByCard={benefitCountByCard}
      selectedCategory={selectedCategory}
      onSelectCategory={setSelectedCategory}
      filteredBenefits={filteredBenefits}
      cardById={cardById}
      emptyMessage={emptyMessage}
    />
  )
}

