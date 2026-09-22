import type { BenefitCategory } from '../../types/card.ts'
import type { CardRecommendation } from '../../lib/recommend.ts'
import { InterestChips } from './InterestChips.tsx'
import { RecommendList } from './RecommendList.tsx'

export interface RecommendToast {
  id: number
  message: string
}

interface RecommendViewProps {
  interests: BenefitCategory[]
  onToggleInterest: (category: BenefitCategory) => void
  uncoveredInterests: BenefitCategory[]
  recommendations: CardRecommendation[]
  onAdd: (cardId: string) => void
  toast: RecommendToast | null
}

/**
 * 관심분야 추천 순수 UI — 상태·계산 없이 props만 그린다.
 * 순서: 헤더("관심분야" + "어떤 혜택이 필요하세요?") → 관심 칩(줄바꿈) →
 * (미선택 시 빈 문구 | 선택 시 안내 박스 + 추천 목록/빈 문구) + 토스트.
 * 채움 강조 버튼 없음 — 텍스트 버튼("내 카드에 추가")만 사용.
 */
export function RecommendView({
  interests,
  onToggleInterest,
  uncoveredInterests,
  recommendations,
  onAdd,
  toast,
}: RecommendViewProps) {
  return (
    <section className="flex flex-col gap-5">
      <header>
        <p className="text-[12px] font-medium leading-none text-text-sub">관심분야</p>
        <h1 className="mt-2 text-[22px] font-bold leading-snug text-text">
          어떤 혜택이 필요하세요?
        </h1>
      </header>

      <InterestChips selected={interests} onToggle={onToggleInterest} />

      {interests.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-[14px] font-medium text-text-sub">관심 있는 분야를 골라보세요</p>
        </div>
      ) : (
        <>
          {uncoveredInterests.length > 0 ? (
            <div className="rounded-card bg-bg-sub px-4 py-3">
              <p className="text-[13px] leading-relaxed text-text-sub">
                내 카드에는 [{uncoveredInterests.join(', ')}] 혜택이 없어요
              </p>
            </div>
          ) : null}

          {recommendations.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-[14px] font-medium text-text-sub">
                추천할 카드가 없어요
              </p>
              <p className="mt-1 text-[12px] text-text-muted">
                관심 분야의 카드를 이미 모두 등록했어요
              </p>
            </div>
          ) : (
            <RecommendList recommendations={recommendations} onAdd={onAdd} />
          )}
        </>
      )}

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 left-1/2 z-50 w-max max-w-[calc(100vw-2.5rem)] -translate-x-1/2 rounded-chip bg-text px-4 py-2.5 text-center text-[13px] font-medium text-bg"
        >
          {toast.message}
        </div>
      ) : null}
    </section>
  )
}
