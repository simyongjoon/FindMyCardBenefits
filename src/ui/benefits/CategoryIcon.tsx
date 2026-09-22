import {
  Bike,
  CarFront,
  Clapperboard,
  Coffee,
  Globe,
  HeartPulse,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Store,
  Tag,
  TrainFront,
  Tv,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { BenefitCategory } from '../../types/card.ts'

/** 카테고리 → 아이콘 매핑 (UI 전용, 로직 없음). 13개 전체 커버. */
export const CATEGORY_ICONS: Record<BenefitCategory, LucideIcon> = {
  카페: Coffee,
  주유: CarFront,
  편의점: Store,
  쇼핑: ShoppingBag,
  교통: TrainFront,
  통신: Smartphone,
  '영화/문화': Clapperboard,
  배달: Bike,
  '구독/OTT': Tv,
  해외: Globe,
  의료: HeartPulse,
  마트: ShoppingCart,
  기타: Tag,
}
