import type { CSSProperties } from 'react'

interface BenefitRowProps {
  title: string
  category: string
  limitText: string
  optionGroup: string | null
  icon: React.ReactNode
  tag?: { label: string; color: string }
}

/**
 * 혜택 한 행 — 아이콘 박스(40px, var(--bg-sub), 모서리 12px) + 제목 15px 굵게 +
 * "카테고리 · 월 한도" 12px 보조색. 우측 카드 태그(카드 색, 11px, 모서리 6px)는
 * 카드별 보기에서는 생략한다. optionGroup이 있으면 제목 옆에 "택1" 배지.
 */
export function BenefitRow({ title, category, limitText, optionGroup, icon, tag }: BenefitRowProps) {
  return (
    <li className="flex items-center gap-3 py-4">
      <div
        aria-hidden
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card bg-bg-sub"
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-[15px] font-semibold leading-snug text-text">
          <span className="min-w-0 flex-1 truncate">{title}</span>
          {optionGroup ? (
            <span className="shrink-0 rounded-[4px] bg-bg-sub px-1.5 py-0.5 text-[10px] font-bold leading-none text-text-sub">
              택1
            </span>
          ) : null}
        </p>
        <p className="mt-1 text-[12px] leading-none text-text-sub">
          {category} · {limitText}
        </p>
      </div>
      {tag ? (
        <span
          style={{ backgroundColor: tag.color } as CSSProperties}
          className="shrink-0 rounded-[6px] px-2 py-1 text-[11px] font-semibold leading-none text-on-accent"
        >
          {tag.label}
        </span>
      ) : null}
    </li>
  )
}
