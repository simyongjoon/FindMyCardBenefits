import { useCallback, useEffect, useState } from 'react'
import { BENEFIT_CATEGORIES } from '../lib/benefits.ts'
import type { BenefitCategory } from '../types/card.ts'

const STORAGE_KEY = 'interests'
const STORAGE_EVENT = 'interests-change'

/** localStorage에서 관심분야를 읽는다. 없거나 깨졌으면 빈 배열로 시작. */
function readStoredInterests(): BenefitCategory[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    // 문자열 + 유효 카테고리만 남기고 중복 제거 (순서 유지).
    // 구버전 저장값에 없는 카테고리가 섞여 있어도 걸러진다.
    return [
      ...new Set(
        parsed.filter(
          (v): v is BenefitCategory =>
            typeof v === 'string' && (BENEFIT_CATEGORIES as string[]).includes(v),
        ),
      ),
    ]
  } catch {
    return []
  }
}

function loadInitialInterests(): BenefitCategory[] {
  if (typeof window === 'undefined') return []
  return readStoredInterests()
}

function notifyChange(): void {
  window.dispatchEvent(new Event(STORAGE_EVENT))
}

/**
 * 관심분야 상태 — 선택한 카테고리 배열 관리 (여러 개 선택 가능).
 * - localStorage에 저장/복원, 새로고침해도 유지
 * - 같은 탭·다른 탭 변경도 이벤트로 동기화 (useMyCards와 같은 방식)
 */
export function useInterests() {
  const [interests, setInterests] = useState<BenefitCategory[]>(loadInitialInterests)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(interests))
    } catch {
      // 저장 실패(사설 모드 등)는 무시 — 메모리 상태로 동작
    }
  }, [interests])

  useEffect(() => {
    const sync = () => setInterests(readStoredInterests())
    window.addEventListener(STORAGE_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(STORAGE_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const toggleInterest = useCallback((category: BenefitCategory) => {
    setInterests((prev) => {
      const next = prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // 무시 — 메모리 상태로 동작
      }
      notifyChange()
      return next
    })
  }, [])

  return { interests, toggleInterest }
}
