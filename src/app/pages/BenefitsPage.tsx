import { useCallback, useEffect, useMemo, useState } from 'react'
import allBenefitsJson from '../../data/benefits.json'
import allCardsJson from '../../data/cards.json'
import { useBenefitViewMode } from '../../hooks/useBenefitViewMode.ts'
import { useMyCards } from '../../hooks/useMyCards.ts'
import {
  countBenefitsByCard,
  filterBenefitsByCardId,
  filterBenefitsByCategory,
  getAvailableCategories,
  getMyBenefits,
  getMyCards,
  groupBenefitsByCard,
} from '../../lib/benefits.ts'
import type { Benefit, BenefitViewMode, Card, CategoryFilter } from '../../types/card.ts'
import { cardSectionId } from '../../ui/benefits/CardBenefitSections.tsx'
import { BenefitsView } from '../../ui/benefits/BenefitsView.tsx'

const ALL_CARDS = allCardsJson as Card[]
const ALL_BENEFITS = allBenefitsJson as Benefit[]

/**
 * /benefits — 데이터 연결(컨테이너).
 * 계산은 src/lib/benefits.ts 순수 함수에 위임하고,
 * 그리기는 ui/benefits/BenefitsView에 위임한다.
 * 화면 상태는 3개: 보기 방식(혜택별/카드별, localStorage 유지) ·
 * 카테고리 칩 · 혜택별 보기에서 고른 카드.
 */
export function BenefitsPage() {
  const { myCardIds } = useMyCards()
  const { viewMode, setViewMode } = useBenefitViewMode()
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('전체')
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)

  const myCards = useMemo(() => getMyCards(ALL_CARDS, myCardIds), [myCardIds])
  const myBenefits = useMemo(() => getMyBenefits(ALL_BENEFITS, myCardIds), [myCardIds])

  // 칩 목록은 "내 카드 혜택에 실제로 있는 카테고리"만 — 카드 추가/삭제 시 자동 갱신
  const availableCategories = useMemo(() => getAvailableCategories(myBenefits), [myBenefits])

  // 선택한 칩이 사라진 카테고리(해당 카드 삭제 등)면 '전체'로 되돌린다
  useEffect(() => {
    if (selectedCategory !== '전체' && !availableCategories.includes(selectedCategory)) {
      setSelectedCategory('전체')
    }
  }, [availableCategories, selectedCategory])

  // 선택했던 카드가 삭제되면 카드 필터를 해제한다
  useEffect(() => {
    if (selectedCardId !== null && !myCardIds.includes(selectedCardId)) {
      setSelectedCardId(null)
    }
  }, [myCardIds, selectedCardId])

  const filteredBenefits = useMemo(
    () =>
      filterBenefitsByCardId(
        filterBenefitsByCategory(myBenefits, selectedCategory),
        selectedCardId,
      ),
    [myBenefits, selectedCategory, selectedCardId],
  )

  // 카드별 보기 — 필터 후 혜택이 없는 카드는 그룹 자체가 만들어지지 않는다(섹션 숨김)
  const cardGroups = useMemo(
    () => groupBenefitsByCard(myCards, filteredBenefits),
    [myCards, filteredBenefits],
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

  /** 카드 요약 박스 클릭 — 혜택별 보기는 카드 필터 토글, 카드별 보기는 섹션 스크롤 */
  const handleSelectCard = useCallback(
    (cardId: string) => {
      if (viewMode === 'card') {
        document
          .getElementById(cardSectionId(cardId))
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
      setSelectedCardId((prev) => (prev === cardId ? null : cardId))
    },
    [viewMode],
  )

  /** 보기 방식을 바꾸면 카드 필터는 해제한다 (카드별 보기는 모든 카드 섹션을 보여준다) */
  const handleChangeViewMode = useCallback(
    (mode: BenefitViewMode) => {
      if (mode === 'card') setSelectedCardId(null)
      setViewMode(mode)
    },
    [setViewMode],
  )

  const benefitEmptyMessage =
    myCards.length === 0 ? '등록한 카드의 혜택이 없어요' : `${selectedCategory} 혜택이 없어요`
  const cardEmptyMessage =
    myCards.length === 0
      ? '등록한 카드의 혜택이 없어요'
      : `${selectedCategory} 혜택이 있는 카드가 없어요`

  return (
    <BenefitsView
      myCardCount={myCards.length}
      totalBenefitCount={myBenefits.length}
      cards={myCards}
      benefitCountByCard={benefitCountByCard}
      viewMode={viewMode}
      onChangeViewMode={handleChangeViewMode}
      availableCategories={availableCategories}
      selectedCategory={selectedCategory}
      onSelectCategory={setSelectedCategory}
      selectedCardId={selectedCardId}
      onSelectCard={handleSelectCard}
      filteredBenefits={filteredBenefits}
      cardById={cardById}
      cardGroups={cardGroups}
      benefitEmptyMessage={benefitEmptyMessage}
      cardEmptyMessage={cardEmptyMessage}
    />
  )
}


