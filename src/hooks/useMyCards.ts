import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'my-cards'
const STORAGE_EVENT = 'my-cards-change'
const DEFAULT_CARD_IDS = ['card-a', 'card-b', 'card-c']

function loadInitialIds(): string[] {
  if (typeof window === 'undefined') return [...DEFAULT_CARD_IDS]
  return readStoredIds()
}

/** localStorage에서 id 목록을 읽는다. 없거나 깨졌으면 기본 3장으로 시작. */
function readStoredIds(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return [...DEFAULT_CARD_IDS]
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return [...DEFAULT_CARD_IDS]
    // 문자열 id만 남기고 중복 제거
    return [...new Set(parsed.filter((v): v is string => typeof v === 'string'))]
  } catch {
    return [...DEFAULT_CARD_IDS]
  }
}

function notifyChange(): void {
  window.dispatchEvent(new Event(STORAGE_EVENT))
}

/**
 * 내 카드 상태 — 등록한 카드 id 목록 관리.
 * - 첫 진입 시 샘플 3장 전체 등록 상태로 시작
 * - localStorage에 저장/복원, 새로고침해도 유지
 * - 같은 탭의 다른 화면(혜택 탭 ↔ 내 카드 탭)과 즉시 동기화
 * - 다른 탭(브라우저 탭 간) 변경도 storage 이벤트로 동기화
 * - addCard / removeCard는 '내 카드' 탭에서 사용
 */
export function useMyCards() {
  const [myCardIds, setMyCardIds] = useState<string[]>(loadInitialIds)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(myCardIds))
    } catch {
      // 저장 실패(사설 모드 등)는 무시 — 메모리 상태로 동작
    }
  }, [myCardIds])

  useEffect(() => {
    const sync = () => setMyCardIds(readStoredIds())
    window.addEventListener(STORAGE_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(STORAGE_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const addCard = useCallback((cardId: string) => {
    setMyCardIds((prev) => {
      if (prev.includes(cardId)) return prev
      const next = [...prev, cardId]
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // 무시 — 메모리 상태로 동작
      }
      notifyChange()
      return next
    })
  }, [])

  const removeCard = useCallback((cardId: string) => {
    setMyCardIds((prev) => {
      if (!prev.includes(cardId)) return prev
      const next = prev.filter((id) => id !== cardId)
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // 무시 — 메모리 상태로 동작
      }
      notifyChange()
      return next
    })
  }, [])

  return { myCardIds, addCard, removeCard }
}

