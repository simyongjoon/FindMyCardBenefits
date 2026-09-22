import { CreditCard, Sparkles, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ROUTES } from '../../shared/routes.ts'

export interface BottomTab {
  to: string
  label: string
  icon: LucideIcon
}

/** 하단 탭 정의 — UI(레이아웃)와 분리된 순수 데이터 */
export const BOTTOM_TABS: BottomTab[] = [
  { to: ROUTES.cards, label: '내 카드', icon: CreditCard },
  { to: ROUTES.benefits, label: '혜택', icon: Wallet },
  { to: ROUTES.recommend, label: '추천', icon: Sparkles },
]
