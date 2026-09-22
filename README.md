# 카드 혜택 모아보기 (PWA)

1단계: 프로젝트 뼈대 + 디자인 시스템 — Vite + React + TypeScript + Tailwind CSS v4 + PWA.

## 실행

```bash
npm install
npm run dev      # 개발 서버
npm run build    # 타입체크 + 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기

npm run validate:data  # cards.json / benefits.json zod 검증
npm run check:dupes    # 혜택 중복 진단 (읽기 전용, --card=<cardId> 옵션)
```

## 라우팅

| 경로 | 화면 | 비고 |
| --- | --- | --- |
| `/cards` | 내 카드 | |
| `/benefits` | 혜택 모아보기 | 기본 화면 (`/` 접속 시 이동) |
| `/recommend` | 추천 | |

### 혜택 화면 동작

- 보기 방식 세그먼트 토글 `[혜택별] [카드별]` — localStorage `benefits-view-mode`에 저장
- 혜택별: 카테고리 칩(동적) 필터 + 혜택 목록. 카드 요약 박스를 누르면 그 카드 혜택만 보기(토글)
- 카드별: 등록 카드마다 섹션. 카드 요약 박스를 누르면 해당 섹션으로 스크롤.
  칩 필터는 섹션 안에도 적용되고, 혜택이 0건인 카드는 섹션 자체가 사라짐
- 카테고리 칩은 고정 목록이 아니라 내 카드 혜택에 있는 카테고리만 (`getAvailableCategories`).
  선택한 칩이 사라지면 자동으로 `전체`로 복귀

## 구조 (UI ↔ 데이터 분리, RN 이식 대비)

```text
src/
  app/            # 라우터 + 페이지 조립 (RN의 화면 조립부에 대응)
    App.tsx
    pages/        # BenefitsPage(컨테이너) / CardsPage(컨테이너) / RecommendPage
  ui/             # RN으로 옮길 순수 UI (도메인 로직 없음)
    layout/AppLayout.tsx      # 430px 셸 + 하단 탭
    navigation/tabs.tsx       # 탭 정의(데이터) — 아이콘은 lucide-react
    components/PageHeader.tsx # 공용 타이틀
    benefits/                 # 혜택 화면 UI (props만 그림)
      BenefitsView.tsx / ViewModeToggle.tsx / CardSummaryList.tsx / CategoryChips.tsx
      BenefitList.tsx / BenefitRow.tsx / CardBenefitSections.tsx / CategoryIcon.tsx
    cards/                    # 내 카드 화면 UI (props만 그림)
      MyCardsView.tsx / MyCardList.tsx / AddCardSheet.tsx / RemoveCardDialog.tsx
    recommend/                # 추천 화면 UI (props만 그림)
      RecommendView.tsx / InterestChips.tsx / RecommendList.tsx
  types/card.ts   # Card / Benefit / Category (RN 재사용, React 미의존)
  lib/            # 순수 함수 (RN 재사용, React 미의존)
    benefits.ts   # 개수·필터(카테고리/카드)·카드 그룹핑·검색·한도 표기·만료 제외
                  # 카테고리 14종(BENEFIT_CATEGORIES + 'PX/군마트')과
                  # 사용 중인 카테고리만 뽑는 getAvailableCategories(동적 칩)
    recommend.ts  # 추천 점수·상위 5장·미보유 관심분야 (NO_LIMIT_SCORE 상수, 만료 제외)
  hooks/          # 웹 경계 (localStorage + 동기화)
    useMyCards.ts / useInterests.ts / useBenefitViewMode.ts
  scripts/
    validate-data.ts     # zod 데이터 검증 (`npm run validate:data`)
                         # (a)타입 (b)evidence빈값 (c)없는cardId (d)카테고리 오타
    find-duplicates.ts   # 중복 혜택 진단 (`npm run check:dupes`) — 읽기 전용
  data/           # cards.json(12장) / benefits.json(69건) 샘플 + 플랫폼 어댑터 경계
                  # 전월실적 구간별 행 분리, 택1(optionGroup), 만료(validUntil) 행 포함
                  # 일 한도만 있는 혜택은 monthlyLimit null + conditions에 일 한도 명시
                  # 같은 혜택을 구간별로 나눈 행은 제목에 구간을 넣어 화면에서 구분되게 한다
                  # 건당 최소금액(minSpend)은 전월실적이 아니면 conditions에 명시
  shared/         # 경로 상수 등 플랫폼 무관 유틸
    routes.ts
  styles/
    theme.css     # CSS 변수 + Tailwind v4 @theme 연결
```

규칙: `types/`·`lib/`는 React를 import하지 않는다. `ui/`는 `lib/`의
결과(props)만 받아 그린다. 플랫폼 종속(localStorage 등)은 `hooks/`·`data/`에만 둔다.

## 디자인 시스템 (라이트 모드)

- 색상은 `src/styles/theme.css`의 `:root` CSS 변수로만 정의, 컴포넌트에 hex 직접 사용 금지
- `--bg / --bg-sub / --text / --text-sub / --text-muted / --border / --accent(#3182F6)`
  + `--on-accent`(강조색·카드색 위 흰 글씨)
- 강조색은 파란색(`--accent`) 하나만, 그림자/그라데이션 금지
- 선택/강조 표시는 그림자 대신 강조색 외곽선(`.card-selected`, 2px)으로 — 카드 요약 박스 선택 상태
- 채움 강조 버튼은 한 화면에 1개만 (내 카드 화면의 "카드 추가",
  삭제 확인 다이얼로그가 열렸을 때는 다이얼로그의 "삭제"만, 추천 화면은 0개,
  혜택 화면은 칩/세그먼트 선택 상태만)
- 카드 모서리 12px(`rounded-card`), 칩 알약 모양 999px(`rounded-chip`)
- 폰트: Pretendard(CDN) → 시스템 폰트 폴백
- 다크 모드는 추후 `[data-theme="dark"]` 블록만 추가

## PWA

- `vite-plugin-pwa` + `manifest` 설정 완료
- 아이콘 자리: `public/pwa-192x192.png`, `public/pwa-512x512.png` (2단계에서 실 PNG 추가)
