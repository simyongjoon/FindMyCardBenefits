/**
 * 혜택 순수 함수 모음 — React를 import하지 않는다.
 * 카드별 혜택 개수, 카테고리 필터, 유효기간 제외 등 계산 로직은 여기에만 두고,
 * UI(페이지/컴포넌트)에서는 이 함수들을 호출하기만 한다. RN 이식 대상.
 */
import type { Benefit, BenefitCategory, Card, CategoryFilter } from '../types/card.ts'

/** 카테고리 전체 목록 — 13개. 혜택 칩/관심분야 칩의 기준 순서. */
export const BENEFIT_CATEGORIES: BenefitCategory[] = [
  '카페',
  '주유',
  '편의점',
  '쇼핑',
  '교통',
  '통신',
  '영화/문화',
  '배달',
  '구독/OTT',
  '해외',
  '의료',
  '마트',
  '기타',
]

export const CATEGORY_FILTERS: CategoryFilter[] = ['전체', ...BENEFIT_CATEGORIES]

/** 등록 가능한 카드 검색 — 카드명/카드사 부분 일치 (대소문자·공백 무시). */
export function searchCards(cards: Card[], query: string): Card[] {
  const normalized = query.replace(/\s+/g, '').toLowerCase()
  if (normalized.length === 0) return cards
  return cards.filter((card) => {
    const haystack = `${card.name}${card.issuer}`.replace(/\s+/g, '').toLowerCase()
    return haystack.includes(normalized)
  })
}

/** 아직 등록하지 않은 카드만 추린다 (카드 추가 시트용). */
export function getUnregisteredCards(allCards: Card[], myCardIds: string[]): Card[] {
  const idSet = new Set(myCardIds)
  return allCards.filter((card) => !idSet.has(card.id))
}

/** 등록한 카드 목록만 추린다. */
export function getMyCards(allCards: Card[], myCardIds: string[]): Card[] {
  const idSet = new Set(myCardIds)
  return allCards.filter((card) => idSet.has(card.id))
}

/** 등록한 카드의 혜택만 추린다. validUntil이 지난 혜택은 제외한다. */
export function getMyBenefits(
  allBenefits: Benefit[],
  myCardIds: string[],
  today: string = todayString(),
): Benefit[] {
  const idSet = new Set(myCardIds)
  return allBenefits.filter(
    (benefit) => idSet.has(benefit.cardId) && !isExpired(benefit, today),
  )
}

/** 선택한 카테고리 칩에 따라 혜택을 필터링한다. '전체'면 그대로 반환. */
export function filterBenefitsByCategory(
  benefits: Benefit[],
  category: CategoryFilter,
): Benefit[] {
  if (category === '전체') return benefits
  const target: BenefitCategory = category
  return benefits.filter((benefit) => benefit.category === target)
}

/** 특정 카드의 혜택 개수 (카드 요약 박스의 "혜택 N개"용). 만료된 혜택은 제외한다. */
export function countBenefitsByCard(
  benefits: Benefit[],
  cardId: string,
  today: string = todayString(),
): number {
  return benefits.reduce(
    (acc, benefit) =>
      benefit.cardId === cardId && !isExpired(benefit, today) ? acc + 1 : acc,
    0,
  )
}

/**
 * validUntil이 지난 혜택인지 판정. 날짜는 YYYY-MM-DD 문자열 비교로 충분하다.
 * validUntil이 null이면 만료되지 않은 것으로 본다.
 */
export function isExpired(benefit: Benefit, today: string = todayString()): boolean {
  if (!benefit.validUntil) return false
  return benefit.validUntil < today
}

/** 오늘 날짜를 YYYY-MM-DD 문자열로 반환 (로컬 기준). */
export function todayString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 월 한도 표기.
 * 10000 → "월 한도 1만원", 5000 → "월 한도 5천원", null → "한도 없음"
 */
export function formatMonthlyLimit(monthlyLimit: number | null): string {
  if (monthlyLimit === null) return '한도 없음'
  if (monthlyLimit % 10000 === 0) return `월 한도 ${monthlyLimit / 10000}만원`
  if (monthlyLimit % 1000 === 0) {
    const man = Math.floor(monthlyLimit / 10000)
    const chun = (monthlyLimit % 10000) / 1000
    if (man > 0) return `월 한도 ${man}만 ${chun}천원`
    return `월 한도 ${chun}천원`
  }
  return `월 한도 ${monthlyLimit.toLocaleString('ko-KR')}원`
}
