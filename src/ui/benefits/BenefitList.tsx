import type { CSSProperties } from 'react'
import { formatMonthlyLimit } from '../../lib/benefits.ts'
import type { Benefit, Card } from '../../types/card.ts'
import { CATEGORY_ICONS } from './CategoryIcon.tsx'

interface BenefitListProps {
  benefits: Benefit[]
  cardById: Record<string, Card>
  emptyMessage: string
}

/**
 * 혜택 목록 — 행 사이 var(--border) 구분선.
 * 아이콘 박스 40px(var(--bg-sub), 모서리 12px) + 제목 15px 굵게(택1 배지 포함) +
 * "카테고리 · 월 한도 N만원" 12px 보조색, 우측 카드 태그(카드 색, 흰 글씨 11px, 모서리 6px).
 * optionGroup이 있는 혜택은 제목 옆에 "택1" 작은 배지를 붙인다.
 */
export function BenefitList({ benefits, cardById, emptyMessage }: BenefitListProps) {
  if (benefits.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-[14px] font-medium text-text-sub">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <ul aria-label="혜택 목록" className="divide-y divide-border">
      {benefits.map((benefit) => {
        const card = cardById[benefit.cardId]
        const Icon = CATEGORY_ICONS[benefit.category]
        return (
          <li key={benefit.id} className="flex items-center gap-3 py-4">
            <div
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card bg-bg-sub"
            >
              <Icon size={20} className="text-text-sub" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[15px] font-semibold leading-snug text-text">
                <span className="min-w-0 flex-1 truncate">{benefit.title}</span>
                {benefit.optionGroup ? (
                  <span className="shrink-0 rounded-[4px] bg-bg-sub px-1.5 py-0.5 text-[10px] font-bold leading-none text-text-sub">
                    택1
                  </span>
                ) : null}
              </p>
              <p className="mt-1 text-[12px] leading-none text-text-sub">
                {benefit.category} · {formatMonthlyLimit(benefit.monthlyLimit)}
              </p>
            </div>
            {card ? (
              <span
                style={{ backgroundColor: card.color } as CSSProperties}
                className="shrink-0 rounded-[6px] px-2 py-1 text-[11px] font-semibold leading-none text-on-accent"
              >
                {card.name}
              </span>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}
