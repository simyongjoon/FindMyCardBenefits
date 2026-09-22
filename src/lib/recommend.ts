import { todayString } from './benefits.ts'
import type { Benefit, BenefitCategory, Card } from '../types/card.ts'

/**
 * 추천 순수 함수 모음 — React를 import하지 않는다.
 * RN 이식 대상. 월 한도 표기는 lib/benefits.ts의 formatMonthlyLimit과 공유하지 않고,
 * 추천 문구 전용 "N만원" 표기를 여기서 제공한다.
 */

/** monthlyLimit이 null일 때 간주하는 월 한도 (원 단위) */
export const NO_LIMIT_SCORE = 20000

/** 추천 결과에 노출할 최대 카드 수 */
export const MAX_RECOMMENDATIONS = 5

export interface CardRecommendation {
  card: Card
  /** 관심 카테고리에 해당하는 이 카드의 혜택 (만료 제외) */
  matchedBenefits: Benefit[]
  /** matchedBenefits의 월 한도 합계 (null → NO_LIMIT_SCORE) */
  score: number
}

interface RecommendInput {
  allCards: Card[]
  allBenefits: Benefit[]
  myCardIds: string[]
  interests: BenefitCategory[]
  /** 기준 날짜 (YYYY-MM-DD). 기본값은 오늘. 만료 판정용 */
  today?: string
}

/**
 * 추천 카드 계산.
 * - 대상: 아직 등록하지 않은 카드만
 * - 점수: 관심 카테고리에 해당하는 혜택의 월 한도 합계 (null → NO_LIMIT_SCORE)
 * - validUntil이 지난 혜택은 제외
 * - 점수 높은 순(동점이면 이름순)으로 정렬, 상위 5장
 * - 점수 0인 카드(관심 혜택 없음)는 제외
 */
export function recommendCards({
  allCards,
  allBenefits,
  myCardIds,
  interests,
  today = todayString(),
}: RecommendInput): CardRecommendation[] {
  if (interests.length === 0) return []
  const owned = new Set(myCardIds)
  const interestSet = new Set<BenefitCategory>(interests)

  return allCards
    .filter((card) => !owned.has(card.id))
    .map((card) => {
      const matchedBenefits = allBenefits.filter(
        (benefit) =>
          benefit.cardId === card.id &&
          interestSet.has(benefit.category) &&
          !isExpiredBenefit(benefit, today),
      )
      const score = matchedBenefits.reduce(
        (acc, benefit) => acc + (benefit.monthlyLimit ?? NO_LIMIT_SCORE),
        0,
      )
      return { card, matchedBenefits, score }
    })
    .filter((rec) => rec.score > 0)
    .sort((a, b) => b.score - a.score || a.card.name.localeCompare(b.card.name, 'ko'))
    .slice(0, MAX_RECOMMENDATIONS)
}

/** validUntil이 지난 혜택인지 판정 (YYYY-MM-DD 문자열 비교). */
function isExpiredBenefit(benefit: Benefit, today: string): boolean {
  if (!benefit.validUntil) return false
  return benefit.validUntil < today
}

/**
 * 내 카드에 혜택이 없는 관심 카테고리 목록 (만료된 혜택은 없는 것으로 본다).
 * 입력 순서를 유지해 반환하므로 UI에서 그대로 "주유, 쇼핑"처럼 나열할 수 있다.
 */
export function findUncoveredInterests(
  allBenefits: Benefit[],
  myCardIds: string[],
  interests: BenefitCategory[],
  today: string = todayString(),
): BenefitCategory[] {
  if (interests.length === 0) return []
  const owned = new Set(myCardIds)
  return interests.filter(
    (category) =>
      !allBenefits.some(
        (benefit) =>
          benefit.category === category &&
          owned.has(benefit.cardId) &&
          !isExpiredBenefit(benefit, today),
      ),
  )
}

/**
 * 추천 헤드라인용 "N만원" 표기 — 점수(원 합계)를 만원 단위로 표기.
 * 30000 → "3만원", 25000 → "2.5만원", 10000 → "1만원"
 */
export function formatScoreManwon(score: number): string {
  const rounded = Math.round((score / 10000) * 10) / 10
  return `${rounded}만원`
}
