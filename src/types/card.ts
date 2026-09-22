/** 카드/혜택 도메인 타입 — React에 의존하지 않아 RN으로 그대로 옮길 수 있다. */

export type CardType = 'credit' | 'check'

export interface Card {
  id: string
  name: string
  issuer: string
  type: CardType
  /** 연회비(원). 없으면 0, 모르면 null */
  annualFee: number | null
  /** 카드 전체 기준 전월실적(원). 없으면 null */
  minMonthlySpend: number | null
  /** 발급 자격. 예: "만 18~29세" */
  eligibility: string | null
  /** 카드 태그/요약 배경에 쓰는 색 (hex). 데이터 기반 예외로 인라인 스타일에만 사용 */
  color: string
  /** 출처 URL */
  sourceUrl: string
  /** 수집 날짜 (YYYY-MM-DD) */
  collectedAt: string
}

export type BenefitCategory =
  | '카페'
  | '주유'
  | '편의점'
  | '쇼핑'
  | '교통'
  | '통신'
  | '영화/문화'
  | '배달'
  | '구독/OTT'
  | '해외'
  | '의료'
  | '마트'
  | 'PX/군마트'
  | '기타'

export type BenefitKind = 'discount' | 'cashback' | 'points'

export type CategoryFilter = '전체' | BenefitCategory

export interface Benefit {
  id: string
  cardId: string
  category: BenefitCategory
  /** 예: "커피 전문점 30% 할인" */
  title: string
  /** 할인/캐시백/적립 */
  kind: BenefitKind
  /** % 단위. 정액 혜택이면 null */
  rate: number | null
  /** 정액(원 단위). 예: 1000원 할인. % 혜택이면 null */
  amount: number | null
  /** 월 한도 (원 단위). 한도 없으면 null */
  monthlyLimit: number | null
  /** 이 혜택에만 필요한 전월실적(원). 없으면 null.
   * 전월실적 구간마다 혜택이 다르면 구간별로 행을 나눠 저장한다. */
  minMonthlySpend: number | null
  /** 택1 혜택이면 같은 그룹명. 예: "A팩/B팩" */
  optionGroup: string | null
  /** 유효 기간 (YYYY-MM-DD). 없으면 null */
  validFrom: string | null
  validUntil: string | null
  /** 요일/시간대 등 기타 조건 */
  conditions: string | null
  /** 원문에서 그대로 가져온 근거 문장. 비어 있으면 안 된다 */
  evidence: string
}

/**
 * 혜택 화면 보기 방식. 'benefit' = 혜택별, 'card' = 카드별.
 * 도메인 데이터가 아니라 화면 상태값이지만 RN에서도 같은 값을 쓰므로 여기서 공유한다.
 */
export type BenefitViewMode = 'benefit' | 'card'

