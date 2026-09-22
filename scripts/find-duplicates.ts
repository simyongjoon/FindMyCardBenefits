/**
 * 혜택 중복 진단 도구 — `npm run check:dupes` 로 실행 (tsx).
 *
 * 같은 cardId 안에서 title이 완전히 같거나 아주 비슷한(앞 10글자가 같은) 항목을
 * 찾아 표로 출력만 한다. 데이터를 절대 수정·병합하지 않는다 (읽기 전용).
 * 진단 도구이므로 exit code는 항상 0 — validate:data처럼 빌드를 깨지 않는다.
 *
 * 옵션: --card=<cardId> 로 특정 카드만 검사
 *   예) npm run check:dupes -- --card=card-kb-narasarang
 */
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Benefit, Card } from '../src/types/card.ts'

/** '앞 10글자' 비교 기준 — 이 길이까지 같으면 비슷한 제목으로 본다. */
const TITLE_PREFIX_LENGTH = 10

const HERE = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = resolve(HERE, '../src/data')

function readJson<T>(fileName: string): T {
  return JSON.parse(readFileSync(resolve(DATA_DIR, fileName), 'utf8')) as T
}

/** 공백 차이는 같은 제목으로 보기 위해 공백을 제거한다. */
function normalizeTitle(title: string): string {
  return title.replace(/\s+/g, '')
}

/** rate/amount 중 하나만 의미가 있다 — 표의 'rate/amount' 열 값. */
function valueText(benefit: Benefit): string {
  if (benefit.rate !== null) return `${benefit.rate}%`
  if (benefit.amount !== null) return `${benefit.amount}원`
  return '-'
}

/** 표에 넣을 행 — 모든 행이 같은 key를 가져야 console.table 열이 맞는다. */
function toRow(benefit: Benefit) {
  return {
    id: benefit.id,
    title: benefit.title,
    category: benefit.category,
    'rate/amount': valueText(benefit),
    monthlyLimit: benefit.monthlyLimit,
    minMonthlySpend: benefit.minMonthlySpend,
    optionGroup: benefit.optionGroup,
    conditions: benefit.conditions,
    evidence: benefit.evidence,
  }
}

/** title + 조건까지 모두 같은지 (실질 중복 후보 판정) */
function signature(benefit: Benefit): string {
  return [
    normalizeTitle(benefit.title),
    benefit.category,
    benefit.rate,
    benefit.amount,
    benefit.monthlyLimit,
    benefit.minMonthlySpend,
    benefit.optionGroup,
    benefit.conditions,
  ].join('|')
}

interface Cluster {
  cardId: string
  members: Benefit[]
  /** title이 완전히 같은 경우 true, 앞 10글자만 같은 경우 false */
  exactTitle: boolean
  /** 카테고리·한도·조건까지 전부 같은 실질 중복 후보 */
  identical: boolean
}

/**
 * 같은 cardId 안에서만 제목을 비교해 클러스터를 만든다.
 * (다른 카드에 같은 이름의 혜택이 있는 것은 중복이 아니다.)
 */
function findClusters(benefits: Benefit[]): Cluster[] {
  const byCard = new Map<string, Benefit[]>()
  for (const benefit of benefits) {
    const list = byCard.get(benefit.cardId)
    if (list) list.push(benefit)
    else byCard.set(benefit.cardId, [benefit])
  }

  const clusters: Cluster[] = []
  for (const [cardId, cardBenefits] of byCard) {
    const buckets = new Map<string, Benefit[]>()
    for (const benefit of cardBenefits) {
      const key = normalizeTitle(benefit.title).slice(0, TITLE_PREFIX_LENGTH)
      const bucket = buckets.get(key)
      if (bucket) bucket.push(benefit)
      else buckets.set(key, [benefit])
    }
    for (const members of buckets.values()) {
      if (members.length < 2) continue
      const distinctTitles = new Set(members.map((b) => normalizeTitle(b.title)))
      const distinctSignatures = new Set(members.map(signature))
      clusters.push({
        cardId,
        members,
        exactTitle: distinctTitles.size === 1,
        identical: distinctSignatures.size === 1,
      })
    }
  }

  return clusters.sort((a, b) => b.members.length - a.members.length)
}

const cardArg = process.argv.find((arg) => arg.startsWith('--card='))
const cardFilter = cardArg ? cardArg.slice('--card='.length) : null

const cards = readJson<Card[]>('cards.json')
const allBenefits = readJson<Benefit[]>('benefits.json')
const cardNameById = new Map(cards.map((card) => [card.id, card.name]))

const targets = cardFilter
  ? allBenefits.filter((benefit) => benefit.cardId === cardFilter)
  : allBenefits

console.log('=== 혜택 중복 진단 (읽기 전용) ===')
console.log(
  cardFilter
    ? `범위: 카드 1장 (${cardFilter} · ${cardNameById.get(cardFilter) ?? 'cards.json에 없음'}) / 혜택 ${targets.length}건`
    : `범위: 카드 ${cards.length}장 전체 / 혜택 ${targets.length}건`,
)

if (targets.length === 0) {
  console.log(`\n검사할 혜택이 없습니다. (cardId 확인: ${cardFilter ?? '전체'})`)
  console.log('데이터는 수정하지 않았습니다.')
  process.exit(0)
}

const clusters = findClusters(targets)

if (clusters.length === 0) {
  console.log(`\n중복 의심 항목이 없습니다. (기준: 같은 카드 안에서 title 또는 앞 ${TITLE_PREFIX_LENGTH}글자)`)
} else {
  for (const cluster of clusters) {
    const cardName = cardNameById.get(cluster.cardId) ?? '(cards.json에 없는 카드)'
    const reason = cluster.exactTitle
      ? 'title 완전 동일'
      : `앞 ${TITLE_PREFIX_LENGTH}글자 동일`
    console.log(
      `\n▶ ${cluster.cardId} · ${cardName} — ${cluster.members.length}건 (${reason}${
        cluster.identical ? ' · 조건까지 전부 동일' : ''
      })`,
    )
    console.table(cluster.members.map(toRow))
  }
}

const exactCount = clusters.filter((cluster) => cluster.exactTitle).length
const similarOnlyCount = clusters.length - exactCount
const memberCount = clusters.reduce((acc, cluster) => acc + cluster.members.length, 0)
const identicalCount = clusters.filter((cluster) => cluster.identical).length

console.log('\n=== 요약 ===')
console.log(`검사한 혜택: ${targets.length}건`)
console.log(
  `중복 의심 클러스터: ${clusters.length}개 (title 완전 동일 ${exactCount}개 · 앞 ${TITLE_PREFIX_LENGTH}글자만 동일 ${similarOnlyCount}개)`,
)
console.log(`중복 의심 항목: ${memberCount}건`)
console.log(`조건까지 전부 동일(실질 중복 후보): ${identicalCount}개 클러스터`)
console.log('데이터는 수정하지 않았습니다.')
