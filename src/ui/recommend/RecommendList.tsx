import { formatMonthlyLimit } from '../../lib/benefits.ts'
import { formatScoreManwon } from '../../lib/recommend.ts'
import type { CardRecommendation } from '../../lib/recommend.ts'
import type { CSSProperties } from 'react'

interface RecommendListProps {
  recommendations: CardRecommendation[]
  onAdd: (cardId: string) => void
}

/**
 * 추천 카드 목록 — 카드 한 장당 하나의 블록.
 * 위쪽 줄: 44x28 썸네일(카드 색) + 카드명 15px 굵게 + 카드사 12px 보조색,
 * 오른쪽 끝에 "내 카드에 추가" 텍스트 버튼(강조색, 채움 아님).
 * 아래 줄: "관심 분야에서 월 최대 N만원 혜택"(N 강조색) + 관련 혜택(제목 + 월 한도, 13px).
 */
export function RecommendList({ recommendations, onAdd }: RecommendListProps) {
  return (
    <ul aria-label="추천 카드 목록" className="divide-y divide-border">
      {recommendations.map(({ card, matchedBenefits, score }) => (
        <li key={card.id} className="py-4">
          <div className="flex items-center gap-3">
            <div
              aria-hidden
              style={{ backgroundColor: card.color } as CSSProperties}
              className="h-7 w-11 shrink-0 rounded-[6px]"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold leading-snug text-text">
                {card.name}
              </p>
              <p className="mt-1 text-[12px] leading-none text-text-sub">{card.issuer}</p>
            </div>
            <button
              type="button"
              onClick={() => onAdd(card.id)}
              aria-label={`${card.name}을 내 카드에 추가`}
              className="shrink-0 px-2 py-1 text-[13px] font-semibold text-accent"
            >
              내 카드에 추가
            </button>
          </div>

          <p className="mt-3 text-[13px] font-medium leading-snug text-text">
            관심 분야에서 월 최대{' '}
            <span className="font-bold text-accent">{formatScoreManwon(score)}</span> 혜택
          </p>
          <ul aria-label={`${card.name} 관련 혜택`} className="mt-2 flex flex-col gap-1.5">
            {matchedBenefits.map((benefit) => (
              <li key={benefit.id} className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 flex-1 truncate text-[13px] text-text-sub">
                  {benefit.title}
                </span>
                <span className="shrink-0 text-[12px] text-text-muted">
                  {formatMonthlyLimit(benefit.monthlyLimit)}
                </span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}
