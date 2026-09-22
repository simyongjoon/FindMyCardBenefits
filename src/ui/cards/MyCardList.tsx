import { useEffect } from 'react'
import type { CSSProperties } from 'react'
import type { Card } from '../../types/card.ts'

interface MyCardListProps {
  cards: Card[]
  benefitCountByCard: Record<string, number>
  onRequestRemove: (card: Card) => void
}

/**
 * 등록한 카드 목록 — 행 사이 var(--border) 구분선.
 * 미니 썸네일 44x28(모서리 6px, 카드 색) + 카드명 15px 굵게 +
 * eligibility가 있으면 카드명 아래 12px 보조 글자색으로 표시 +
 * "카드사 · 혜택 N개" 12px 보조색, 우측 "삭제" 텍스트 버튼.
 */
export function MyCardList({ cards, benefitCountByCard, onRequestRemove }: MyCardListProps) {
  if (cards.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-[15px] font-semibold text-text">아직 등록한 카드가 없어요</p>
        <p className="mt-2 text-[13px] leading-relaxed text-text-sub">
          카드를 추가하면 혜택을 한눈에 볼 수 있어요
        </p>
      </div>
    )
  }

  return (
    <ul aria-label="등록한 카드 목록" className="divide-y divide-border">
      {cards.map((card) => (
        <li key={card.id} className="flex items-center gap-3 py-4">
          <div
            aria-hidden
            style={{ backgroundColor: card.color } as CSSProperties}
            className="h-7 w-11 shrink-0 rounded-[6px]"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold leading-snug text-text">
              {card.name}
            </p>
            {card.eligibility ? (
              <p className="mt-1 truncate text-[12px] leading-none text-text-sub">
                {card.eligibility}
              </p>
            ) : null}
            <p className="mt-1 text-[12px] leading-none text-text-sub">
              {card.issuer} · 혜택 {benefitCountByCard[card.id] ?? 0}개
            </p>
          </div>
          <button
            type="button"
            onClick={() => onRequestRemove(card)}
            aria-label={`${card.name} 삭제`}
            className="shrink-0 px-2 py-1 text-[13px] font-medium text-text-sub"
          >
            삭제
          </button>
        </li>
      ))}
    </ul>
  )
}

/** 바텀시트/다이얼로그 공통 — Esc로 닫기, 배경 스크롤 잠금 */
export function useDialogBehavior(onClose: () => void) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])
}
