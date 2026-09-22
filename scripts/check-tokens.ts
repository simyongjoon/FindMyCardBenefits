/**
 * 디자인 토큰 사본 검증 — `npm run check:tokens` (tsx).
 * docs/design-tokens.json 의 색 9개가 src/styles/theme.css 의 :root 변수와
 * 같은지, cardColors 가 src/data/cards.json 과 같은지 확인한다.
 * 값이 어긋나면 exit code 1 (theme.css 가 원본이므로 토큰 사본을 맞춰야 한다).
 */
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')

const COLOR_VARS: Record<string, string> = {
  bg: '--bg',
  'bg-sub': '--bg-sub',
  text: '--text',
  'text-sub': '--text-sub',
  'text-muted': '--text-muted',
  border: '--border',
  accent: '--accent',
  'on-accent': '--on-accent',
}

interface TokenColor {
  value: string
}
interface TokenCardColor {
  id: string
  value: string
}
interface DesignTokens {
  color: Record<string, TokenColor>
  cardColors: TokenCardColor[]
}
interface CardJson {
  id: string
  color: string
}

const tokens = JSON.parse(
  readFileSync(resolve(ROOT, 'docs/design-tokens.json'), 'utf8'),
) as DesignTokens
const themeCss = readFileSync(resolve(ROOT, 'src/styles/theme.css'), 'utf8')
const cards = JSON.parse(readFileSync(resolve(ROOT, 'src/data/cards.json'), 'utf8')) as CardJson[]

let problems = 0

for (const [tokenName, cssVar] of Object.entries(COLOR_VARS)) {
  const tokenColor = tokens.color[tokenName]
  const match = themeCss.match(new RegExp(`${cssVar}:\\s*(#[0-9a-fA-F]{6})`))
  if (!tokenColor) {
    console.log(`✗ 토큰에 color.${tokenName} 이 없습니다`)
    problems += 1
    continue
  }
  if (!match) {
    console.log(`✗ theme.css 에서 ${cssVar} 를 찾지 못했습니다`)
    problems += 1
    continue
  }
  if (tokenColor.value.toLowerCase() !== match[1].toLowerCase()) {
    console.log(
      `✗ ${tokenName}: 토큰 ${tokenColor.value} ≠ theme.css ${cssVar} ${match[1]}`,
    )
    problems += 1
  }
}

if (tokens.cardColors.length !== cards.length) {
  console.log(
    `✗ cardColors 개수 불일치: 토큰 ${tokens.cardColors.length}장 ≠ cards.json ${cards.length}장`,
  )
  problems += 1
}

for (const [index, card] of cards.entries()) {
  const tokenCard = tokens.cardColors[index]
  if (!tokenCard || tokenCard.id !== card.id) {
    console.log(`✗ cardColors[${index}] 카드 id 불일치: ${tokenCard?.id ?? '없음'} ≠ ${card.id}`)
    problems += 1
    continue
  }
  if (tokenCard.value.toLowerCase() !== card.color.toLowerCase()) {
    console.log(`✗ ${card.id} 색 불일치: 토큰 ${tokenCard.value} ≠ cards.json ${card.color}`)
    problems += 1
  }
}

if (problems === 0) {
  console.log(
    `✅ 디자인 토큰 일치 — 색 ${Object.keys(COLOR_VARS).length}개, 카드 색 ${cards.length}장`,
  )
  process.exit(0)
}

console.log(`❌ 디자인 토큰 불일치 ${problems}건 — docs/design-tokens.json 을 갱신하세요.`)
process.exit(1)
