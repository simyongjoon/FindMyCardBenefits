import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { Search } from 'lucide-react'
import { searchCards } from '../../lib/benefits.ts'
import type { Card } from '../../types/card.ts'
import { useDialogBehavior } from './MyCardList.tsx'

interface AddCardSheetProps {
  cards: Card[]
  benefitCountByCard: Record<string, number>
  onClose: () => void
  onAdd: (cardId: string) => void
}

/**
 * 카드 추가 바텀시트.
 * - 검색 입력창(var(--bg-sub), 모서리 12px, 카드명/카드사 검색)
 * - 등록 가능한 카드 목록 (이미 등록된 카드는 제외하고 전달받음)
 * - 카드를 누르면 등록 후 시트 닫기, 검색 결과 없으면 빈 문구
 */
export function AddCardSheet({ cards, benefitCountByCard, onClose, onAdd }: AddCardSheetProps) {
  const [query, setQuery] = useState('')
  useDialogBehavior(onClose)

  const results = useMemo(() => searchCards(cards, query), [cards, query])

  return (
    <div role="dialog" aria-modal="true" aria-label="카드 추가" className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-scrim"
      />
      <div className="relative flex max-h-[80dvh] w-full max-w-[430px] flex-col rounded-t-card border border-border bg-bg px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
        <div aria-hidden className="mx-auto mb-3 h-1 w-10 rounded-chip bg-border" />
        <p className="text-[17px] font-bold text-text">카드 추가</p>

        <label className="mt-3 flex items-center gap-2 rounded-card bg-bg-sub px-4">
          <Search size={18} className="shrink-0 text-text-muted" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="카드명, 카드사로 검색"
            aria-label="카드 검색"
            className="h-12 w-full bg-transparent text-[15px] text-text outline-none placeholder:text-text-muted"
          />
        </label>

        {results.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-[14px] font-medium text-text-sub">
              {cards.length === 0 ? '추가할 수 있는 카드가 없어요' : '검색 결과가 없어요'}
            </p>
            {cards.length > 0 ? (
              <p className="mt-1 text-[12px] text-text-muted">다른 이름으로 검색해 보세요</p>
            ) : (
              <p className="mt-1 text-[12px] text-text-muted">이미 모든 카드를 등록했어요</p>
            )}
          </div>
        ) : (
          <ul aria-label="추가 가능한 카드 목록" className="mt-2 divide-y divide-border overflow-y-auto">
            {results.map((card) => (
              <li key={card.id}>
                <button
                  type="button"
                  onClick={() => {
                    onAdd(card.id)
                    onClose()
                  }}
                  className="flex w-full items-center gap-3 py-4 text-left"
                >
                  <div
                    aria-hidden
                    style={{ backgroundColor: card.color } as CSSProperties}
                    className="h-7 w-11 shrink-0 rounded-[6px]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold leading-snug text-text">
                      {card.name}
                    </span>
                    <span className="mt-1 block text-[12px] leading-none text-text-sub">
                      {card.issuer} · 혜택 {benefitCountByCard[card.id] ?? 0}개
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
