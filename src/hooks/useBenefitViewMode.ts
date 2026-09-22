import { useCallback, useEffect, useState } from 'react'
import type { BenefitViewMode } from '../types/card.ts'

const STORAGE_KEY = 'benefits-view-mode'
const STORAGE_EVENT = 'benefits-view-mode-change'
/** 저장값이 없거나 깨졌으면 혜택별 보기로 시작. */
const DEFAULT_VIEW_MODE: BenefitViewMode = 'benefit'

function isViewMode(value: unknown): value is BenefitViewMode {
  return value === 'benefit' || value === 'card'
}

/** localStorage에서 보기 방식을 읽는다. 값이 이상하면 기본값. */
function readStoredViewMode(): BenefitViewMode {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return isViewMode(raw) ? raw : DEFAULT_VIEW_MODE
  } catch {
    return DEFAULT_VIEW_MODE
  }
}

function loadInitialViewMode(): BenefitViewMode {
  if (typeof window === 'undefined') return DEFAULT_VIEW_MODE
  return readStoredViewMode()
}

function notifyChange(): void {
  window.dispatchEvent(new Event(STORAGE_EVENT))
}

/**
 * 혜택 화면 보기 방식(혜택별/카드별) 상태.
 * - localStorage('benefits-view-mode')에 저장/복원 → 화면 이동·새로고침에도 유지
 * - 같은 탭·다른 탭 변경도 이벤트로 동기화 (useMyCards와 같은 방식)
 */
export function useBenefitViewMode() {
  const [viewMode, setViewModeState] = useState<BenefitViewMode>(loadInitialViewMode)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, viewMode)
    } catch {
      // 저장 실패(사설 모드 등)는 무시 — 메모리 상태로 동작
    }
  }, [viewMode])

  useEffect(() => {
    const sync = () => setViewModeState(readStoredViewMode())
    window.addEventListener(STORAGE_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(STORAGE_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const setViewMode = useCallback((mode: BenefitViewMode) => {
    setViewModeState(mode)
    try {
      window.localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      // 무시 — 메모리 상태로 동작
    }
    notifyChange()
  }, [])

  return { viewMode, setViewMode }
}
