interface PageHeaderProps {
  title: string
  description?: string
}

/** 1단계 빈 페이지용 공통 헤더 — 토스 스타일 미니멀 타이틀 */
export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-6">
      <h1 className="text-[22px] font-bold leading-tight text-text">{title}</h1>
      {description ? <p className="mt-2 text-[14px] leading-relaxed text-text-sub">{description}</p> : null}
    </header>
  )
}
