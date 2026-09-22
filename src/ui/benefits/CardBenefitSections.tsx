import type { CSSProperties } from 'react'
import { formatMonthlyLimit } from '../../lib/benefits.ts'
import type { CardBenefitGroup } from '../../lib/benefits.ts'
import { BenefitRow } from './BenefitRow.tsx'
import { CATEGORY_ICONS } from './CategoryIcon.tsx'

/** 카드별 보기 섹션의 DOM id — 상단 카드 요약 박스에서 스크롤 이동할 때 쓴다. */
export function cardSectionId(cardId: string): string {
  return `card-section-${cardId}`
}

interface CardBenefitSectionsProps {
  groups: CardBenefitGroup[]
  emptyMessage: string
}

/**
 * 카드별 보기 — 등록한 카드마다 섹션 1개.
 * - 섹션 헤더: 카드 색 미니 썸네일(44x28px, 모서리 6px) + 카드명(15px 굵게) + "혜택 N개"
 * - N은 필터를 적용한 뒤 그 섹션에 실제로 보이는 행 수
 * - 혜택 행은 혜택별 보기와 같은 BenefitRow를 쓰고 카드 태그는 생략
 * - 혜택이 없는 카드는 groupBenefitsByCard가 이미 빼므로 빈 섹션이 생기지 않는다
 * - 카드 색만 데이터의 color를 인라인 스타일로 사용 (CSS 변수 규칙의 예외)
 */
export function CardBenefitSections({ groups, emptyMessage }: CardBenefitSectionsProps) {
  if (groups.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-[14px] font-medium text-text-sub">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-7">
      {groups.map(({ card, benefits }) => (
        <section
          key={card.id}
          id={cardSectionId(card.id)}
          aria-label={`${card.name} 혜택`}
          className="scroll-mt-4"
        >
          <header className="flex items-center gap-3">
            <div
              aria-hidden
              style={{ backgroundColor: card.color } as CSSProperties}
              className="h-7 w-11 shrink-0 rounded-[6px]"
            />
            <p className="min-w-0 flex-1 truncate text-[15px] font-semibold leading-none text-text">
              {card.name}
            </p>
            <span className="shrink-0 text-[12px] leading-none text-text-sub">
              혜택 {benefits.length}개
            </span>
          </header>

          <ul aria-label={`${card.name} 혜택 목록`} className="mt-1 divide-y divide-border">
            {benefits.map((benefit) => {
              const Icon = CATEGORY_ICONS[benefit.category]
              return (
                <BenefitRow
                  key={benefit.id}
                  title={benefit.title}
                  category={benefit.category}
                  limitText={formatMonthlyLimit(benefit.monthlyLimit)}
                  optionGroup={benefit.optionGroup}
                  icon={<Icon size={20} className="text-text-sub" />}
                />
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
