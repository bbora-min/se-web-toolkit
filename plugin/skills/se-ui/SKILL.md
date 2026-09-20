---
name: se-ui
description: SE 디자인 시스템(@se/ui, @se/tokens, @se/charts)을 쓰는 React 프로젝트에서 화면·컴포넌트·스타일을 만들거나 고칠 때 반드시 사용. 컴포넌트 선택, 토큰 클래스, 페이지 패턴, 금지 규칙, 3상태. se-design과 짝으로 쓴다.
---

# se-ui — 디자인 시스템 사용법

이 프로젝트의 UI는 `@se/ui`(컴포넌트)·`@se/tokens`(색·간격·타이포)·`@se/charts`(차트)로만 만든다.
**새 컴포넌트를 만들기 전에 `references/INDEX.md`에서 있는지 먼저 확인한다.** 내부 도구 화면의 대부분은 거기 있는 것의 조합으로 끝난다.

## 언제
- `package.json`에 `@se/ui`가 있는 프로젝트에서 화면·컴포넌트·스타일 작업을 할 때 항상
- 코드를 쓰기 **전에** `se-design` 스킬의 디자인 플랜을 먼저 쓴다 (10줄). 플랜 없이 코드부터 쓰지 않는다

## 규칙 — 1–3은 `@se/eslint-plugin`이 error로 막고, 4–5는 warn(템플릿의 `lint`는 `--max-warnings=0`이라 역시 실패)
1. **색은 토큰 클래스만.** `bg-canvas` `bg-surface` `bg-surface-2` `text-ink` `text-muted` `border-line` `border-line-strong` `bg-accent` `text-on-accent` `text-accent-fg` `bg-accent-soft` `text-success|warning|danger|info` `bg-*-soft` `text-on-danger|warning|success|info`(의미 색 블록 위 글자) `bg-chart-1..8`. hex·rgb·Tailwind 기본 팔레트(`bg-blue-500`) 금지. 서비스 색은 `se.identity.json`이 정한다 — 코드에서 고르지 않는다.
2. **폼 컨트롤·표·다이얼로그는 `@se/ui`.** raw `<button> <input> <select> <textarea> <table>` 금지.
3. **기반 라이브러리 직접 import 금지.** `@radix-ui/*` `cmdk` `sonner` `recharts` `@tanstack/react-table` → 항상 `@se/ui`·`@se/charts`를 거친다.
4. **한 화면에 `variant="primary"` Button은 하나.** 주 액션이 둘이면 둘 다 아니다. 린터는 파일 단위로만 보므로 여러 파일이 한 라우트를 이룰 땐 직접 확인한다. `variant="danger"` 는 파괴적 액션(삭제·종결·강제 중단)에만 — "등록 버튼을 빨갛게" 처럼 색 요청이 의미와 어긋나면 그대로 하지 말고 되묻는다(강조가 목적이면 primary 가 이미 이 서비스의 색이다). 주 액션을 danger 로 바꾸면 화면에서 primary 가 사라진다.
5. **모든 목록은 3상태.** `DataTable`에 `loading`(스켈레톤)·`error`(원인+다시 시도)·`empty`(다음 행동 버튼). 빈 상태는 "없음"이 아니라 "다음에 무엇을 할지".

## 패턴 선택표 — 화면이 …이면
골격(쉘 배치 + 페이지 구조)을 먼저 고른다. 쉘 배치는 `se.identity.json` 의 `shell`(서비스에 하나: `sidebar` · `topnav` · `panes`), 페이지 골격은 화면마다. 형제 서비스와 같은 골격만 고르면 색만 다른 형제가 된다.

| 화면 | 골격 | 패턴 | 원본 (복사해서 변형) | 골격 문서 |
|---|---|---|---|---|
| 목록 + 필터 + 상세 | 원장 | **ListDetailPage** | `references/examples/reference-app/JobsPage.tsx` (드로어 상세, 서버 페이지네이션, 일괄 액션) + `JobDetailSheet.tsx` · `references/examples/release-desk/ReleasesPage.tsx` (페이지 상세) | `references/patterns/list-detail.md` |
| 지표·차트·상태 요약 | **관측 벽** (제목 없이 12칸 타일) | **DashboardPage** | `references/examples/reference-app/OverviewPage.tsx` | `references/patterns/dashboard.md` |
| 단일 객체 + 탭 | 원장(상세) | **DetailPage** | `references/examples/dataset-explorer/DatasetPage.tsx` · `references/examples/release-desk/ReleasePage.tsx` (워크플로 액션) | `references/patterns/detail.md` |
| 여러 단계 입력 | 폼 | **FormWizardPage** | `references/examples/release-desk/NewReleasePage.tsx` (+ `DecisionDialog.tsx` 폼 모달) | `references/patterns/form-wizard.md` |
| 설정·토글 | 폼 | **SettingsPage** | `references/examples/release-desk/SettingsPage.tsx` | `references/patterns/settings.md` |
| 입구·포털 — 서비스·도구·문서를 고르는 화면 | **허브** | **HubPage** | `references/examples/se-home/HomePage.tsx` (상단 네비 쉘 · 큰 검색 · 카드 카탈로그 · 최근 항목) + `se-home/Shell.tsx` (`layout="topnav"` 쉘 원본) | `references/patterns/hub.md` |
| 상태가 순서 있는 단계이고 흐름·막힘이 정보 | **보드** | **BoardPage** | `references/examples/release-desk/ReleasesBoard.tsx` (열=단계 · 카드 · 끌기 규칙) + `ReleasesPage.tsx` (표 ↔ 보드 전환 `?view=board`, 레일 → 열 스크롤) | `references/patterns/board.md` |
| 읽는 화면 — 런북·가이드·포스트모템·데이터 사전 | **문서** | **DocPage** | `references/examples/dataset-explorer/DomainPage.tsx` (트리 · `Prose` 본문 · 목차 · 사전 표) + `mocks-domains.ts` (구조화된 블록) | `references/patterns/doc.md` |
| 하나씩 처리하는 큐 — 받은 편지함·승인 대기·인시던트 | **트리아지** | **TriagePage** | `references/examples/release-desk/ApprovalsPage.tsx` (SplitPane 3단 · j/k · 결정 뒤 다음) | `references/patterns/triage.md` |
| 로그·트레이스·빌드 출력 — 수천 줄에서 빨간 줄 찾기 | **콘솔** | **ConsolePage** | `references/examples/reference-app/JobConsolePage.tsx` (패싯 · 줄 필터 · LogViewer 라이브 테일 · 컨텍스트) | `references/patterns/console.md` |
| "언제"가 질문 — 배포 창·온콜·배치 스케줄·프리즈 | **일정** | **SchedulePage** | `references/examples/release-desk/CalendarPage.tsx` (월 격자 · 프리즈 빗금 · 고른 날 목록) | `references/patterns/schedule.md` |
| 검색이 전부인 목록 | 원장 | ListDetail + `SearchHero` | `references/examples/dataset-explorer/DatasetsPage.tsx` | — |

골격이 위 표에 없으면(캔버스·대화) 툴킷의 다음 버전에서 원본이 생긴다 — 그 전엔 `AppShell layout` 과 있는 컴포넌트로 페이지 안에 만들고 보고한다. 있는 원장 원본을 억지로 쓰지 않는다.

원본 파일 상단의 `디자인 플랜` 주석까지 읽는다 — 왜 그렇게 놓았는지가 거기 있다. 쉘·목·훅의 원본은 `references/examples/reference-app/{Shell.tsx,mocks-handlers.ts,api-jobs.ts}`. (동봉본은 툴킷의 `examples/`에서 자동 복사된다 — 어느 폴더에서 열어도 있다)

## 절차
1. `se-design`으로 디자인 플랜 작성 (목적·첫 시선·주 액션·계층·밀도·시그니처)
2. 위 표에서 패턴을 고르고 원본을 연다
3. 원본을 복사해 데이터·컬럼·액션만 바꾼다. 고른 골격의 원본 구조(원장이면 제목 → 시그니처/요약 → 1차 분류 탭 → 2차 필터 → 표 → 상세)는 유지
4. 3상태를 채운다. `?__state=empty|error|slow`로 강제해 본다
5. `pnpm lint`와 `pnpm typecheck` 통과
6. 스크린샷 1회로 확인 (1440·1024 폭, 라이트·다크)

## 쉘과 시그니처
- 모든 페이지는 `AppShell` 안. 배치는 `layout={parseIdentity(identity).shell}`(`@se/tokens`, JSON 을 그대로 넘기면 string 이라 타입이 안 맞는다) — `sidebar`(좌측 네비, 기본) · `topnav`(상단 네비, 사이드바 없음) · `panes`(아이콘 레일 + 전폭, `NavItem label=` 필수). 로크업(마크+이름)·검색(⌘K)·테마 토글의 자리는 배치가 정하므로 건드리지 않는다. `PageHeader`·`PageBody`는 원장·폼 골격의 것 — 관측 벽(`TileGrid`·`Tile`, 툴바 + `sr-only` h1)·트리아지처럼 제목 없는 골격은 안 쓴다
- 시그니처는 `se.identity.json`의 `signature`가 정한다. 페이지 맨 위 한 자리: `StatusStrip`(모니터링 — 지금 괜찮은가) · `SearchHero`(조회 — 무엇을 찾나) · `StageRail`(워크플로 — 어디까지 왔나) · `TimelineRibbon`(활동·이력 — 최근 무슨 일이) · `MetricMarquee`(비용·사용량·품질 — 얼마인가). `StatusStrip`은 목록 페이지에서 `variant="compact"`(한 줄), 개요 페이지에서 full. 나머지는 변형 없이 그대로. 다섯을 한눈에: `references/examples/reference-app/SignaturesPage.tsx`
- 커맨드 팔레트: `AppShell`의 `command` prop에 그룹만 넘긴다 (이동·항목 점프·액션). 새 페이지를 만들면 여기에도 등록한다

## 자주 쓰는 조합
- **숫자 셀**: `meta: { align: 'right' }` + `font-mono text-xs` + `tnum`
- **ID·경로·버전**: `font-mono text-[13px]`
- **상태**: `StatusBadge`(작업) · `Badge tone=`(그 외). 의미 색은 액센트가 아니다
- **사람**: `Avatar` + 이름, 승인 상태는 아바타 스택(`references/examples/release-desk/bits.tsx`)
- **시간·숫자**: `@se/ui`의 `formatRelative` + `title={formatAbsolute}`, `formatDuration`, `formatCompact`, `formatBytes`
- **행 액션**: `DataTable rowActions` — 호버 시 아이콘 1–3개, 위험 동작은 `ConfirmDialog`(이름 재입력)
- **서버 모드 정렬**: `sorting.onChange`에서 `set({ sort, dir, page: '' })` **한 번에**. 필터·탭이 바뀌면 선택(`selection`)도 비운다
- **폼**: `Form`/`FormField`/`FormItem`/`FormLabel`/`FormControl`/`FormMessage` + zod. 섹션은 `FormSection`(좌 설명·우 필드)
- **차트**: `ChartCard` + `BarChart|LineChart|MeterList`. 성공/실패/취소는 의미 색, 계열은 `chart-1..8` 순서 고정, 2개 이상이면 `legend`. `MeterList` 항목의 `tone` 도 같은 값(`chart-N` = 그 카테고리의 배지·차트 색과 일치). 목표·임계는 `LineChart referenceLines`

## 레퍼런스
- `references/INDEX.md` — 컴포넌트 목록과 개수 (자동 생성)
- `references/components/<name>.md` — props·기본값·설명 (자동 생성, 코드와 항상 일치)
- `references/tokens.md` — 토큰 클래스 전체와 밀도·테마 전환
- `references/patterns/*.md` — 패턴 골격
- `references/examples/**` — 복사해서 변형할 원본 페이지 (자동 동봉)
