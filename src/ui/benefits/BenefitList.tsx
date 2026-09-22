import { formatMonthlyLimit } from '../../lib/benefits.ts'
import type { Benefit, Card } from '../../types/card.ts'
import { BenefitRow } from './BenefitRow.tsx'
import { CATEGORY_ICONS } from './CategoryIcon.tsx'

interface BenefitListProps {
  benefits: Benefit[]
  cardById: Record<string, Card>
  emptyMessage: string
}

/**
 * 혜택별 보기 목록 — 행 사이 var(--border) 구분선.
 * 각 행은 BenefitRow 공용 컴포넌트 + 우측 카드 태그.
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
          <BenefitRow
            key={benefit.id}
            title={benefit.title}
            category={benefit.category}
            limitText={formatMonthlyLimit(benefit.monthlyLimit)}
            optionGroup={benefit.optionGroup}
            icon={<Icon size={20} className="text-text-sub" />}
            tag={card ? { label: card.name, color: card.color } : undefined}
          />
        )
      })}
    </ul>
  )
}

