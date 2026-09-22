import type { CSSProperties } from 'react'
import type { Card } from '../../types/card.ts'

interface CardSummaryListProps {
  cards: Card[]
  benefitCountByCard: Record<string, number>
}

/**
 * 카드 요약 박스 — 등록 카드를 가로로 나열.
 * 카드 색 배경 + 흰 글씨, 높이 64px, 모서리 10px.
 * 카드 색은 데이터의 color를 인라인 스타일로만 사용 (CSS 변수 예외).
 */
export function CardSummaryList({ cards, benefitCountByCard }: CardSummaryListProps) {
  if (cards.length === 0) {
    return (
      <div className="rounded-card border border-border bg-bg px-4 py-5 text-center">
        <p className="text-[14px] font-medium text-text-sub">등록한 카드가 없어요</p>
        <p className="mt-1 text-[12px] text-text-muted">내 카드 탭에서 카드를 추가해 보세요</p>
      </div>
    )
  }

  return (
    <ul aria-label="등록한 카드" className="flex gap-2">
      {cards.map((card) => (
        <li key={card.id} className="min-w-0 flex-1">
          <div
            style={{ backgroundColor: card.color } as CSSProperties}
            className="flex h-16 min-w-0 flex-col justify-center gap-1 rounded-[10px] px-3"
          >
            <p className="truncate text-[13px] font-semibold leading-none text-on-accent">
              {card.name}
            </p>
            <p className="text-[11px] leading-none text-on-accent opacity-85">
              혜택 {benefitCountByCard[card.id] ?? 0}개
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}
