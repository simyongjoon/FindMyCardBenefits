# 데이터 변환 규칙 (benefits.json 입력 가이드)

사용자가 준 원본 형식 → `src/data/cards.json` · `src/data/benefits.json` 스키마로
옮길 때 적용하는 규칙. 새 카드를 추가할 때마다 이 파일을 먼저 보고, 예외가 생기면
여기에追記한다. 스키마 정의는 `src/types/card.ts`, 검증은 `npm run validate:data`.

## 0. 용어 정리

- `monthlyLimit`: 월 한도(원). 한도 없으면 `null`.
- `minMonthlySpend`: 전월실적(원). 없으면 `null`.
- `conditions`: 그 외 제한(일/건당/횟수/가맹점/기간성 조건)을 사람이 읽는 한 줄 문장.
- `evidence`: 원문 근거. `원문: ...` 접두 + 빈 문자열 금지(검증 b).

## 1. 한도 (limitAmount → monthlyLimit / conditions)

| 원본 | 변환 |
| --- | --- |
| "월 N원"이 명시 | `monthlyLimit: N` |
| 일 한도만 있음 (예: 일 5천원) | `monthlyLimit: null`, `conditions`에 "일 5천원까지" 명시 |
| 건당 한도만 있음 (예: 건당 4천원) | `monthlyLimit: null`, `conditions`에 "건당 4천원까지" 명시 |
| 횟수 제한만 있음 (예: 월 1회, 월 2회) | `monthlyLimit: null`, `conditions`에 "월 1회" 명시 |
| 한도 자체가 없음 (CU, CGV 무료, 해외수수료 면제) | `monthlyLimit: null`, 횟수 조건이 있으면 `conditions`에 명시 |
| 일+월 둘 다 있음 (예: 월 3천원 일 1천원) | `monthlyLimit`에 월 금액, `conditions`에 일 금액 ("일 1천원까지") |

- 추천 점수는 `monthlyLimit ?? 20000`으로 계산되므로, 일 한도만 있는 혜택은
  2만원으로 간주된다. 의도적으로 낮추/높이고 싶으면 규칙을 바꿔야 한다.

## 2. 전월실적 vs 건당 최소금액 (minSpend → minMonthlySpend / conditions)

| 원본 | 변환 |
| --- | --- |
| "전월실적 N만원", "지난달 실적 N만원"이 명시 | `minMonthlySpend: N원` |
| "결제 건당 N만원 이상/미만" (구간 조건) | `minMonthlySpend: null`, `conditions`에 구간 명시 ("결제 건당 3만원 이상 7만원 미만") |
| 건당 최소결제금액 (예: 건당 1만원 이상) | `minMonthlySpend: null`, `conditions`에 명시 |
| `minSpend: 0` 또는 `null` | `minMonthlySpend: null` |

- 전월실적 구간마다 혜택이 다르면 구간별로 행을 나눈다 (B카드 해외직구 3%/5%,
  대중교통 10/20/30/50/100만원 5행 참고).
- 카드 전체 기준 전월실적은 `Card.minMonthlySpend`에, 혜택별 실적은
  `Benefit.minMonthlySpend`에 입력한다.

## 3. 종류 매핑 (type → kind / rate / amount)

| 원본 type | kind | rate / amount |
| --- | --- | --- |
| 할인 | `discount` | `%`면 `rate`, `원`이면 `amount` |
| 캐시백 | `cashback` | `%`면 `rate`, `원`이면 `amount` |
| 적립 | `points` | `%`면 `rate` |
| 기타 (무료 증정 등 수치 없음) | `discount` | 둘 다 `null` (예: CGV 팝콘) |
| 면제 (수수료 100% 면제) | `discount` | `rate: 100` |

- `%`와 `원`이 동시에 오는 경우는 지금까지 없음. 생기면 규칙 추가.

## 4. 카테고리 (category)

- 13종: 카페, 주유, 편의점, 쇼핑, 교통, 통신, 영화/문화, 배달, 구독/OTT,
  해외, 의료, 마트, 기타. 오타는 `validate:data`의 (d)로 검출.
- 애매한 항목의 선례:
  - 군마트(PX)·국군콘도·레스토랑·패스트푸드·어학시험 → `기타`
  - 서점 → `영화/문화` (원문 카테고리 유지)
  - GS 팝서비스 → `편의점`

## 5. 택1 / 유효기간 / ID

- 택1: 같은 그룹명을 `optionGroup`에 입력 (예: D카드 `"모닝팩"` 2행).
  혜택 화면에 "택1" 배지가 붙는다.
- 유효기간: `validUntil`이 지난 행은 목록·개수·추천에서 전부 제외된다.
  만료 테스트용 행 1건 유지 (`benefit-movie-i-expired`, 2024-12-31).
- ID 규칙: 카드 `card-{발급사}-{별칭}` (예: `card-hana-narasarang`),
  혜택 `benefit-{카드별칭}-{NN}` (예: `benefit-kb-narasarang-01`).

## 6. 카드 색 / 출처

- 카드 색은 발급사 계열의 차분한 톤으로 임의 지정 (하나 `#2B5AA6`, KB `#8C6D1F`).
  바꾸고 싶으면 말해달라고 확인받는다.
- `sourceUrl`은 카드사 대표 URL, `collectedAt`은 추가 당일(YYYY-MM-DD).
- `eligibility`: 나라사랑카드는 "나라사랑카드 발급 대상(병역판정검사 대상자 등)".

## 7. 검증

- `npm run validate:data` — (a)타입 (b)evidence빈값 (c)없는cardId (d)카테고리 오타.
- 새 카드 추가 후에는 validate + `tsc --noEmit` + `vite build`까지 돌린다.
