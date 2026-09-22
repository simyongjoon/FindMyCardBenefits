/** 앱 라우트 경로 — 문자열 하드코딩 방지용 */
export const ROUTES = {
  cards: '/cards',
  benefits: '/benefits',
  recommend: '/recommend',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]
