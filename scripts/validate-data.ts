/**
 * 샘플 데이터 검증 — `npm run validate:data` 로 실행 (tsx + zod).
 * (a) 타입 불일치, (b) evidence 빈 문자열, (c) 존재하지 않는 cardId,
 * (d) 카테고리 오타를 찾아 콘솔에 출력한다. 문제가 있으면 exit code 1.
 *
 * NOTE: 카테고리/종류 목록은 src/types/card.ts와 동기화를 유지한다.
 */
import { readFileSync } from 'node:fs'
import { z } from 'zod'

const CATEGORIES = [
  '카페',
  '주유',
  '편의점',
  '쇼핑',
  '교통',
  '통신',
  '영화/문화',
  '배달',
  '구독/OTT',
  '해외',
  '의료',
  '마트',
  'PX/군마트',
  '기타',
] as const

const KINDS = ['discount', 'cashback', 'points'] as const
const CARD_TYPES = ['credit', 'check'] as const

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const COLOR_RE = /^#[0-9A-Fa-f]{6}$/

const cardSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    issuer: z.string().min(1),
    type: z.enum(CARD_TYPES),
    annualFee: z.number().int().nonnegative().nullable(),
    minMonthlySpend: z.number().int().nonnegative().nullable(),
    eligibility: z.string().nullable(),
    color: z.string().regex(COLOR_RE, 'hex 색상(#RRGGBB) 형식이 아님'),
    sourceUrl: z.string().min(1),
    collectedAt: z.string().regex(DATE_RE, 'YYYY-MM-DD 형식이 아님'),
  })
  .strict()

const benefitSchema = z
  .object({
    id: z.string().min(1),
    cardId: z.string().min(1),
    category: z.enum(CATEGORIES),
    title: z.string().min(1),
    kind: z.enum(KINDS),
    rate: z.number().min(0).max(100).nullable(),
    amount: z.number().int().nonnegative().nullable(),
    monthlyLimit: z.number().int().nonnegative().nullable(),
    minMonthlySpend: z.number().int().nonnegative().nullable(),
    optionGroup: z.string().nullable(),
    validFrom: z.string().regex(DATE_RE, 'YYYY-MM-DD 형식이 아님').nullable(),
    validUntil: z.string().regex(DATE_RE, 'YYYY-MM-DD 형식이 아님').nullable(),
    conditions: z.string().nullable(),
    evidence: z.string(),
  })
  .strict()

type IssueCode = 'a' | 'b' | 'c' | 'd' | 'extra'

const issues: string[] = []
function push(code: IssueCode, message: string): void {
  issues.push(`(${code}) ${message}`)
}

function formatPath(path: Array<string | number | symbol>): string {
  return path.map(String).join('.')
}

function loadJson(file: string): unknown {
  const overrideDir = process.env.VALIDATE_FIXTURE_DIR
  const url =
    overrideDir && (file === 'cards.json' || file === 'benefits.json')
      ? `${overrideDir}/${file}`
      : new URL(`../src/data/${file}`, import.meta.url)
  return JSON.parse(readFileSync(url, 'utf8')) as unknown
}

const cardsRaw = loadJson('cards.json')
const benefitsRaw = loadJson('benefits.json')

// --- 카드 id 집합 (원시 기준, ref 검사(c)용) ---
const cardIds = new Set<string>()
if (Array.isArray(cardsRaw)) {
  cardsRaw.forEach((item, index) => {
    if (typeof item === 'object' && item !== null && 'id' in item) {
      const id = (item as { id: unknown }).id
      if (typeof id === 'string') {
        if (cardIds.has(id)) push('extra', `cards.json #${index}: 중복 id "${id}"`)
        cardIds.add(id)
      }
    }
  })
}

// (a) 타입 검사 — zod 스키마 불일치
const cardsParsed = z.array(cardSchema).safeParse(cardsRaw)
if (!cardsParsed.success) {
  for (const issue of cardsParsed.error.issues) {
    push('a', `cards.json ${formatPath(issue.path)}: ${issue.message}`)
  }
}
const benefitsParsed = z.array(benefitSchema).safeParse(benefitsRaw)
if (!benefitsParsed.success) {
  for (const issue of benefitsParsed.error.issues) {
    push('a', `benefits.json ${formatPath(issue.path)}: ${issue.message}`)
  }
}

// (b)(c)(d) 원시 기준 검사 — zod를 통과하지 못한 행도 최대한 찾아낸다
if (Array.isArray(benefitsRaw)) {
  const seenBenefitIds = new Set<string>()
  benefitsRaw.forEach((item, index) => {
    if (typeof item !== 'object' || item === null) {
      push('a', `benefits.json #${index}: 객체가 아님`)
      return
    }
    const row = item as Record<string, unknown>
    const label = typeof row.id === 'string' ? row.id : `#${index}`

    if (typeof row.id === 'string') {
      if (seenBenefitIds.has(row.id)) push('extra', `benefits.json ${label}: 중복 id`)
      seenBenefitIds.add(row.id)
    }
    if (
      typeof row.category === 'string' &&
      !(CATEGORIES as readonly string[]).includes(row.category)
    ) {
      push('d', `benefits.json ${label}: 카테고리 오타 "${row.category}"`)
    }
    if (typeof row.evidence !== 'string' || row.evidence.trim().length === 0) {
      push('b', `benefits.json ${label}: evidence가 비어 있음`)
    }
    if (typeof row.cardId === 'string' && !cardIds.has(row.cardId)) {
      push('c', `benefits.json ${label}: 존재하지 않는 cardId "${row.cardId}"`)
    }
  })
}

// --- 결과 출력 ---
if (issues.length === 0) {
  const cardCount = Array.isArray(cardsRaw) ? cardsRaw.length : 0
  const benefitCount = Array.isArray(benefitsRaw) ? benefitsRaw.length : 0
  console.log(
    `✅ 데이터 검증 통과 — 카드 ${cardCount}건, 혜택 ${benefitCount}건, 문제 0건`,
  )
} else {
  console.log(`❌ 데이터 검증 실패 — 문제 ${issues.length}건:`)
  for (const issue of issues) console.log(`  ${issue}`)
  process.exitCode = 1
}
