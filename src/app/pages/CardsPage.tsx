import { useCallback, useMemo, useState } from 'react'
import allBenefitsJson from '../../data/benefits.json'
import allCardsJson from '../../data/cards.json'
import { useMyCards } from '../../hooks/useMyCards.ts'
import { countBenefitsByCard, getMyCards, getUnregisteredCards } from '../../lib/benefits.ts'
import type { Benefit, Card } from '../../types/card.ts'
import { MyCardsView } from '../../ui/cards/MyCardsView.tsx'

const ALL_CARDS = allCardsJson as Card[]
const ALL_BENEFITS = allBenefitsJson as Benefit[]

/**
 * /cards — 데이터 연결(컨테이너).
 * 계산은 src/lib/benefits.ts 순수 함수에 위임하고,
 * 그리기는 ui/cards/MyCardsView에 위임한다.
 * useMyCards가 localStorage와 동기화되므로 추가/삭제가 혜택 탭에 즉시 반영된다.
 */
export function CardsPage() {
  const { myCardIds, addCard, removeCard } = useMyCards()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [cardToRemove, setCardToRemove] = useState<Card | null>(null)

  const myCards = useMemo(() => getMyCards(ALL_CARDS, myCardIds), [myCardIds])
  const unregisteredCards = useMemo(
    () => getUnregisteredCards(ALL_CARDS, myCardIds),
    [myCardIds],
  )

  const benefitCountByCard = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const card of ALL_CARDS) counts[card.id] = countBenefitsByCard(ALL_BENEFITS, card.id)
    return counts
  }, [])

  const handleConfirmRemove = useCallback(() => {
    if (cardToRemove) removeCard(cardToRemove.id)
    setCardToRemove(null)
  }, [cardToRemove, removeCard])

  return (
    <MyCardsView
      myCardCount={myCards.length}
      cards={myCards}
      benefitCountByCard={benefitCountByCard}
      unregisteredCards={unregisteredCards}
      isAddOpen={isAddOpen}
      onOpenAdd={() => setIsAddOpen(true)}
      onCloseAdd={() => setIsAddOpen(false)}
      onAdd={addCard}
      cardToRemove={cardToRemove}
      onRequestRemove={setCardToRemove}
      onCancelRemove={() => setCardToRemove(null)}
      onConfirmRemove={handleConfirmRemove}
    />
  )
}
