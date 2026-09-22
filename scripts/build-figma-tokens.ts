/**
 * Figma Variables import 파일 생성 — `npm run build:figma` (검증만: `npm run check:figma`).
 *
 * 출력 포맷은 Figma 공식 샘플(figma/plugin-samples 의 variables-import-export)이
 * 그대로 읽는 **W3C Design Tokens(DTCG) 포맷**이다:
 *   - 중첩 객체 = 변수 그룹 → 변수명은 "그룹/이름" (예: color/bg, card/card-a)
 *   - 토큰은 `$type`(color|number) + `$value`
 *   - 색은 hex(`#RRGGBB`) 또는 `rgba(r, g, b, a)` 문자열, 숫자는 number
 *   - 같은 값 참조는 alias 문자열 `"{color.text}"` (샘플이 `.`→`/` 로 변환)
 *   - `$` 로 시작하는 키(주석/설명)는 샘플이 건너뛴다
 * Figma는 파일명을 컬렉션 이름으로 쓰므로, 가져온 뒤 컬렉션 이름을 "Light"로 바꾸면 된다.
 *
 * 원본은 docs/design-tokens.json(그 원본은 src/styles/theme.css) — 이 스크립트는
 * 값을 새로 만들지 않고 옮기기만 하며, 아래를 검증한 뒤 쓰기/비교한다.
 *   1. 파생 토큰이 원본 색과 실제로 일치하는지
 *   2. 카드 색 12장이 cards.json 순서/값과 일치하는지
 *   3. 모든 색 값이 Figma 샘플 parseColor 가 받는 형식인지 (hex/rgba)
 *   4. 쓴 파일을 다시 읽어 생성 결과와 완전히 같은지 (왕복 확인)
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const SOURCE = resolve(ROOT, 'docs/design-tokens.json')
const TARGET = resolve(ROOT, 'docs/figma-tokens.json')
const CARDS = resolve(ROOT, 'src/data/cards.json')

/** DTCG 토큰 — Figma 샘플이 지원하는 color/number(+alias)만 쓴다. */
interface DtcgToken {
  $type: 'color' | 'number'
  $value: string | number
  $description?: string
}

interface SourceTokens {
  color: Record<string, { value: string; opacity?: number; usage?: string }>
  derived: Record<
    string,
    {
      value?: string
      opacity?: number
      background?: string
      text?: string
      width?: number
      offset?: number
      secondary?: string
      stripeOpacity?: number
      usage?: string
    }
  >
  radius: Record<string, { value: number; usage?: string }>
  fontSize: Record<string, { value: number; weight?: string; usage?: string }>
  layout: Record<string, number | string>
  cardColors: { id: string; name: string; issuer: string; value: string }[]
}
interface CardJson {
  id: string
  color: string
}

const problems: string[] = []
const notes: string[] = []

function fail(message: string): void {
  problems.push(message)
}

function note(message: string): void {
  notes.push(message)
}

function expect(label: string, actual: unknown, expected: unknown): void {
  if (actual !== expected) fail(`${label}: ${String(actual)} ≠ 원본 ${String(expected)}`)
}

/** #RRGGBB + opacity → Figma 샘플 parseColor 가 받는 rgba() 문자열 */
function hexToRgba(hex: string, opacity: number): string {
  const match = /^#([0-9a-fA-F]{6})$/.exec(hex)
  if (!match) throw new Error(`hex 형식이 아님: ${hex}`)
  const value = match[1]
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

/** camelCase → kebab-case (Figma 변수명 관례: layout/max-width) */
function camelToKebab(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

/** Figma 샘플 parseColor 의 정규식과 동일 — 통과 못하면 import 시 예외가 난다. */
const FIGMA_HEX_RE = /^#([A-Fa-f0-9]{3}){1,2}$/
const FIGMA_RGBA_RE = /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([\d.]+)\s*\)$/

function assertFigmaColor(label: string, value: string | number): void {
  if (typeof value !== 'string') {
    fail(`${label}: 색 값이 문자열이 아님 (${typeof value})`)
    return
  }
  if (value.startsWith('{')) return // alias
  if (!FIGMA_HEX_RE.test(value) && !FIGMA_RGBA_RE.test(value)) {
    fail(`${label}: Figma parseColor 가 못 읽는 값 "${value}"`)
  }
}

const tokens = JSON.parse(readFileSync(SOURCE, 'utf8')) as SourceTokens
const cards = JSON.parse(readFileSync(CARDS, 'utf8')) as CardJson[]


/* ---------- 1) color 그룹 (핵심 9개 + 반투명 scrim) ---------- */
const colorGroup: Record<string, DtcgToken> = {}
for (const [name, token] of Object.entries(tokens.color)) {
  if (token.opacity === undefined) {
    colorGroup[name] = { $type: 'color', $value: token.value, $description: token.usage }
  } else {
    colorGroup[name] = {
      $type: 'color',
      $value: hexToRgba(token.value, token.opacity),
      $description: `${token.usage ?? ''} (${token.value} ${Math.round(token.opacity * 100)}%)`.trim(),
    }
  }
}
expect(
  'color.scrim 알파 합성',
  colorGroup.scrim?.$value,
  hexToRgba(tokens.color.scrim.value, 0.45),
)
note(`색 ${Object.keys(colorGroup).length}개 (scrim 은 알파 합성)`)

/* ---------- 2) derived 그룹 (파생 색/수치 + alias) ---------- */
const derivedGroup: Record<string, DtcgToken> = {
  'card-summary-subtitle': {
    $type: 'color',
    $value: hexToRgba(tokens.derived.cardSummarySubtitle.value ?? '#ffffff', 0.85),
    $description: tokens.derived.cardSummarySubtitle.usage,
  },
  'toast-background': {
    $type: 'color',
    $value: '{color.text}',
    $description: tokens.derived.toast.usage,
  },
  'toast-text': {
    $type: 'color',
    $value: '{color.bg}',
    $description: '토스트 글씨 — color.bg 참조',
  },
  'selected-card-outline': {
    $type: 'color',
    $value: '{color.accent}',
    $description: tokens.derived.selectedCardOutline.usage,
  },
  'selected-card-outline-width': {
    $type: 'number',
    $value: 2,
    $description: '선택된 카드 외곽선 두께 (stroke weight)',
  },
  'selected-card-outline-offset': {
    $type: 'number',
    $value: 2,
    $description: '선택된 카드 외곽선 바깥 여백 — offset 2px',
  },
  'pwa-theme-color': {
    $type: 'color',
    $value: '{color.bg}',
    $description: tokens.derived.pwaThemeColor.usage,
  },
  'favicon-background': {
    $type: 'color',
    $value: '{color.accent}',
    $description: 'public/favicon.svg 배경 — color.accent 참조',
  },
  'favicon-secondary': {
    $type: 'color',
    $value: '{color.bg}',
    $description: 'public/favicon.svg 카드 도형 — color.bg 참조',
  },
  'favicon-stripe-opacity': {
    $type: 'number',
    $value: 0.25,
    $description: '파비콘 카드 줄무늬 불투명도',
  },
}
// 파생 값이 원본 색과 어긋나면 여기서 잡힌다
expect('derived.toast.background', tokens.derived.toast.background, tokens.color.text.value)
expect('derived.toast.text', tokens.derived.toast.text, tokens.color.bg.value)
expect(
  'derived.selectedCardOutline.value',
  tokens.derived.selectedCardOutline.value,
  tokens.color.accent.value,
)
expect('derived.pwaThemeColor.value', tokens.derived.pwaThemeColor.value, tokens.color.bg.value)
expect('derived.favicon.value', tokens.derived.favicon.value, tokens.color.accent.value)
expect('derived.favicon.secondary', tokens.derived.favicon.secondary, tokens.color.bg.value)
expect(
  'derived.cardSummarySubtitle.value',
  tokens.derived.cardSummarySubtitle.value,
  tokens.color['on-accent'].value,
)
expect('derived.favicon.stripeOpacity', tokens.derived.favicon.stripeOpacity, 0.25)
note(`파생 토큰 ${Object.keys(derivedGroup).length}개 (alias 6개 포함)`)

/* ---------- 3) card 그룹 (카드 색 12장) ---------- */
const cardGroup: Record<string, DtcgToken> = {}
if (tokens.cardColors.length !== cards.length) {
  fail(`카드 색 개수 불일치: 토큰 ${tokens.cardColors.length} ≠ cards.json ${cards.length}`)
}
for (const [index, card] of tokens.cardColors.entries()) {
  const source = cards[index]
  if (!source || source.id !== card.id) {
    fail(`cardColors[${index}] id 불일치: ${card.id} ≠ ${source?.id ?? '없음'}`)
  } else if (source.color.toLowerCase() !== card.value.toLowerCase()) {
    fail(`${card.id} 색 불일치: 토큰 ${card.value} ≠ cards.json ${source.color}`)
  }
  cardGroup[card.id] = {
    $type: 'color',
    $value: card.value,
    $description: `${card.name} · ${card.issuer} — 글씨는 항상 color/on-accent`,
  }
}
note(`카드 색 ${Object.keys(cardGroup).length}장`)

/* ---------- 4) radius / font-size / layout 그룹 (FLOAT 변수) ---------- */
const radiusGroup: Record<string, DtcgToken> = {}
for (const [name, token] of Object.entries(tokens.radius)) {
  radiusGroup[name] = { $type: 'number', $value: token.value, $description: token.usage }
}

const fontSizeGroup: Record<string, DtcgToken> = {}
for (const [name, token] of Object.entries(tokens.fontSize)) {
  fontSizeGroup[name] = {
    $type: 'number',
    $value: token.value,
    // 굵기/용도는 Figma FLOAT 변수로 표현할 수 없어 설명으로만 남긴다
    $description: [token.weight ? `${token.weight}` : '', token.usage ?? '']
      .filter(Boolean)
      .join(' · '),
  }
}

const layoutGroup: Record<string, DtcgToken> = {}
for (const [name, value] of Object.entries(tokens.layout)) {
  if (typeof value === 'number') {
    layoutGroup[camelToKebab(name)] = { $type: 'number', $value: value }
  }
}
// layout.miniThumb 은 "44x28" 문자열 → Figma 에서는 숫자 2개로 나눠야 한다
const miniThumb = /^(\d+)x(\d+)$/.exec(String(tokens.layout.miniThumb))
if (!miniThumb) {
  fail(`layout.miniThumb 형식이 "NxN" 이 아님: ${String(tokens.layout.miniThumb)}`)
} else {
  layoutGroup['mini-thumb-width'] = { $type: 'number', $value: Number(miniThumb[1]), $description: '카드 미니 썸네일 너비 (44x28)' }
  layoutGroup['mini-thumb-height'] = { $type: 'number', $value: Number(miniThumb[2]), $description: '카드 미니 썸네일 높이 (44x28)' }
}
note(`radius ${Object.keys(radiusGroup).length}개 · font-size ${Object.keys(fontSizeGroup).length}개 · layout ${Object.keys(layoutGroup).length}개`)

/* ---------- 5) 파일 조립 (DTCG) ---------- */
const OUTPUT: Record<string, unknown> = {
  $description:
    'Figma Variables import 파일 (W3C Design Tokens 포맷). 원본: docs/design-tokens.json ← src/styles/theme.css. 그룹 경로가 Figma 변수명(color/bg)이 된다. 그림자·그라데이션 없음.',
  color: colorGroup,
  derived: derivedGroup,
  card: cardGroup,
  radius: radiusGroup,
  'font-size': fontSizeGroup,
  layout: layoutGroup,
}

// 색으로 취급되는 값은 전부 Figma 샘플 parseColor 로 읽히는지 확인
for (const [groupName, group] of [
  ['color', colorGroup],
  ['derived', derivedGroup],
  ['card', cardGroup],
] as const) {
  for (const [name, token] of Object.entries(group)) {
    if (token.$type === 'color') assertFigmaColor(`${groupName}/${name}`, token.$value)
  }
}
// alias 는 "그룹/이름" 형태여야 하므로 대상 존재 여부까지 확인
const allVariableNames = new Set<string>()
for (const [groupName, group] of Object.entries({
  color: colorGroup,
  derived: derivedGroup,
  card: cardGroup,
  radius: radiusGroup,
  'font-size': fontSizeGroup,
  layout: layoutGroup,
})) {
  for (const name of Object.keys(group)) allVariableNames.add(`${groupName}/${name}`)
}
for (const token of Object.values(derivedGroup)) {
  if (typeof token.$value === 'string' && token.$value.startsWith('{')) {
    const target = token.$value.replace(/[{}]/g, '').replace(/\./g, '/')
    if (!allVariableNames.has(target)) fail(`alias 대상이 없음: ${token.$value}`)
  }
}

const serialized = `${JSON.stringify(OUTPUT, null, 2)}\n`
const checkOnly = process.argv.includes('--check')

if (problems.length > 0) {
  for (const problem of problems) console.log(`✗ ${problem}`)
  console.log(`❌ Figma 토큰 생성 중단 — 문제 ${problems.length}건 (파일을 쓰지 않음)`)
  process.exit(1)
}

if (checkOnly) {
  let current = ''
  try {
    current = readFileSync(TARGET, 'utf8')
  } catch {
    console.log('✗ docs/figma-tokens.json 이 없습니다 — npm run build:figma 로 생성하세요.')
    process.exit(1)
  }
  if (current !== serialized) {
    console.log('✗ docs/figma-tokens.json 이 원본과 어긋납니다 — npm run build:figma 로 다시 생성하세요.')
    process.exit(1)
  }
  console.log(`✅ Figma 토큰 최신 — ${notes.join(' · ')}`)
  process.exit(0)
}

writeFileSync(TARGET, serialized, 'utf8')

// 왕복 확인 — 쓴 파일을 다시 읽어 생성 결과와 완전히 같은지
const reread = readFileSync(TARGET, 'utf8')
if (reread !== serialized) {
  console.log('✗ 왕복 확인 실패 — 다시 읽은 파일이 생성 결과와 다릅니다.')
  process.exit(1)
}

console.log('=== Figma Variables import 파일 생성 ===')
for (const noteLine of notes) console.log(`· ${noteLine}`)
console.log(`→ docs/figma-tokens.json (${serialized.length} bytes, 최상위 그룹 ${Object.keys(OUTPUT).length - 1}개)`)
console.log('✅ 왕복 확인 통과 · 색 값 모두 Figma parseColor 형식 · alias 대상 존재')

