import { NavLink, Outlet } from 'react-router-dom'
import { BOTTOM_TABS } from '../navigation/tabs.tsx'

/**
 * 모바일 기준 앱 셸.
 * - 최대 폭 430px, 중앙 정렬
 * - 상단 콘텐츠 + 하단 탭 3개
 * - 색상은 CSS 변수 기반 토큰(bg/text/border/accent)만 사용, hex 금지
 * - 그림자/그라데이션 없음
 */
export function AppLayout() {
  return (
    <div className="min-h-dvh bg-bg-sub">
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-bg">
        <main className="flex-1 px-5 pb-28 pt-8">
          <Outlet />
        </main>

        <nav
          aria-label="하단 탭"
          className="fixed bottom-0 left-1/2 w-full max-w-[430px] -translate-x-1/2 border-t border-border bg-bg"
        >
          <ul className="grid grid-cols-3 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
            {BOTTOM_TABS.map((tab) => (
              <li key={tab.to}>
                <NavLink
                  to={tab.to}
                  className={({ isActive }) =>
                    [
                      'flex flex-col items-center gap-1 rounded-card px-2 py-2 text-[11px] leading-none',
                      isActive ? 'text-accent' : 'text-text-muted',
                    ].join(' ')
                  }
                >
                  {({ isActive }) => (
                    <>
                      <tab.icon size={22} strokeWidth={isActive ? 2.5 : 2} aria-hidden />
                      <span className={isActive ? 'font-semibold' : 'font-medium'}>{tab.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}
