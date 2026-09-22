import type { Card } from '../../types/card.ts'
import { AddCardSheet } from './AddCardSheet.tsx'
import { MyCardList } from './MyCardList.tsx'
import { RemoveCardDialog } from './RemoveCardDialog.tsx'

interface MyCardsViewProps {
  myCardCount: number
  cards: Card[]
  benefitCountByCard: Record<string, number>
  unregisteredCards: Card[]
  isAddOpen: boolean
  onOpenAdd: () => void
  onCloseAdd: () => void
  onAdd: (cardId: string) => void
  cardToRemove: Card | null
  onRequestRemove: (card: Card) => void
  onCancelRemove: () => void
  onConfirmRemove: () => void
}

/**
 * 내 카드 순수 UI — 상태·계산 없이 props만 그린다.
 * 순서: "내 카드 N장" 헤더 → 등록 목록(빈 상태 포함) → 하단 "카드 추가" 채움 버튼.
 * 채움 강조 버튼은 이 화면에서 "카드 추가" 1개만 사용한다.
 */
export function MyCardsView({
  myCardCount,
  cards,
  benefitCountByCard,
  unregisteredCards,
  isAddOpen,
  onOpenAdd,
  onCloseAdd,
  onAdd,
  cardToRemove,
  onRequestRemove,
  onCancelRemove,
  onConfirmRemove,
}: MyCardsViewProps) {
  return (
    <section className="flex min-h-[calc(100dvh-12rem)] flex-col gap-4">
      <header>
        <h1 className="text-[22px] font-bold leading-snug text-text">
          내 카드 <span className="text-accent">{myCardCount}장</span>
        </h1>
      </header>

      <MyCardList cards={cards} benefitCountByCard={benefitCountByCard} onRequestRemove={onRequestRemove} />

      <div className="mt-auto pt-4">
        <button
          type="button"
          onClick={onOpenAdd}
          className="h-[52px] w-full rounded-card bg-accent text-[15px] font-semibold text-on-accent"
        >
          카드 추가
        </button>
      </div>

      {isAddOpen ? (
        <AddCardSheet
          cards={unregisteredCards}
          benefitCountByCard={benefitCountByCard}
          onClose={onCloseAdd}
          onAdd={onAdd}
        />
      ) : null}

      {cardToRemove ? (
        <RemoveCardDialog card={cardToRemove} onCancel={onCancelRemove} onConfirm={onConfirmRemove} />
      ) : null}
    </section>
  )
}
