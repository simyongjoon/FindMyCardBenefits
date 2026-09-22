import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import allBenefitsJson from '../../data/benefits.json'
import allCardsJson from '../../data/cards.json'
import { useInterests } from '../../hooks/useInterests.ts'
import { useMyCards } from '../../hooks/useMyCards.ts'
import { findUncoveredInterests, recommendCards } from '../../lib/recommend.ts'
import type { CardRecommendation } from '../../lib/recommend.ts'
import type { Benefit, Card } from '../../types/card.ts'
import { RecommendView } from '../../ui/recommend/RecommendView.tsx'
import type { RecommendToast } from '../../ui/recommend/RecommendView.tsx'

const ALL_CARDS = allCardsJson as Card[]
const ALL_BENEFITS = allBenefitsJson as Benefit[]

const TOAST_DURATION_MS = 2000

/**
 * /recommend — 데이터 연결(컨테이너).
 * 계산은 src/lib/recommend.ts 순수 함수에 위임하고,
 * 그리기는 ui/recommend/RecommendView에 위임한다.
 * useMyCards가 localStorage와 동기화되므로 여기서 추가한 카드가
 * /cards·/benefits 탭에 즉시 반영된다.
 */
export function RecommendPage() {
  const { myCardIds, addCard } = useMyCards()
  const { interests, toggleInterest } = useInterests()
  const [toast, setToast] = useState<RecommendToast | null>(null)
  const toastTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    }
  }, [])

  const recommendations: CardRecommendation[] = useMemo(
    () =>
      recommendCards({
        allCards: ALL_CARDS,
        allBenefits: ALL_BENEFITS,
        myCardIds,
        interests,
      }),
    [myCardIds, interests],
  )

  const uncoveredInterests = useMemo(
    () => findUncoveredInterests(ALL_BENEFITS, myCardIds, interests),
    [myCardIds, interests],
  )

  const handleAdd = useCallback(
    (cardId: string) => {
      const target = ALL_CARDS.find((card) => card.id === cardId)
      if (!target) return
      addCard(cardId)
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
      setToast({ id: Date.now(), message: `${target.name}를 추가했어요` })
      toastTimer.current = window.setTimeout(() => setToast(null), TOAST_DURATION_MS)
    },
    [addCard],
  )

  return (
    <RecommendView
      interests={interests}
      onToggleInterest={toggleInterest}
      uncoveredInterests={uncoveredInterests}
      recommendations={recommendations}
      onAdd={handleAdd}
      toast={toast}
    />
  )
}
