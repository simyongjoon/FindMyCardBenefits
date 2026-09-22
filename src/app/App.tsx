import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ROUTES } from '../shared/routes.ts'
import { AppLayout } from '../ui/layout/AppLayout.tsx'
import { BenefitsPage } from './pages/BenefitsPage.tsx'
import { CardsPage } from './pages/CardsPage.tsx'
import { RecommendPage } from './pages/RecommendPage.tsx'

/** 라우터 껍데기 — 도메인 로직 없이 화면 연결만 담당 */
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to={ROUTES.benefits} replace />} />
          <Route path={ROUTES.cards} element={<CardsPage />} />
          <Route path={ROUTES.benefits} element={<BenefitsPage />} />
          <Route path={ROUTES.recommend} element={<RecommendPage />} />
          <Route path="*" element={<Navigate to={ROUTES.benefits} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
