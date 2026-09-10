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
1. **색은 토큰 클래스만.** `bg-canvas` `bg-surface` `bg-surface-2` `text-ink` `text-muted` `border-line` `border-line-strong` `bg-accent` `text-on-accent` `text-accent-fg` `bg-accent-soft` `text-success|warning|danger|info` `bg-*-soft` `bg-chart-1..8`. hex·rgb·Tailwind 기본 팔레트(`bg-blue-500`) 금지. 서비스 색은 `se.identity.json`이 정한다 — 코드에서 고르지 않는다.
2. **폼 컨트롤·표·다이얼로그는 `@se/ui`.** raw `<button> <input> <select> <textarea> <table>` 금지.
3. **기반 라이브러리 직접 import 금지.** `@radix-ui/*` `cmdk` `sonner` `recharts` `@tanstack/react-table` → 항상 `@se/ui`·`@se/charts`를 거친다.
4. **한 화면에 `variant="primary"` Button은 하나.** 주 액션이 둘이면 둘 다 아니다. 린터는 파일 단위로만 보므로 여러 파일이 한 라우트를 이룰 땐 직접 확인한다.
5. **모든 목록은 3상태.** `DataTable`에 `loading`(스켈레톤)·`error`(원인+다시 시도)·`empty`(다음 행동 버튼). 빈 상태는 "없음"이 아니라 "다음에 무엇을 할지".

## 패턴 선택표 — 화면이 …이면
| 화면 | 패턴 | 원본 (복사해서 변형) | 골격 |
|---|---|---|---|
| 목록 + 필터 + 상세 | **ListDetailPage** | `examples/reference-app/src/pages/jobs/JobsPage.tsx` (드로어 상세, 서버 페이지네이션, 일괄 액션) · `examples/release-desk/src/pages/releases/ReleasesPage.tsx` (페이지 상세) | `references/patterns/list-detail.md` |
| 지표·차트·상태 요약 | **DashboardPage** | `examples/reference-app/src/pages/overview/OverviewPage.tsx` | `references/patterns/dashboard.md` |
| 단일 객체 + 탭 | **DetailPage** | `examples/dataset-explorer/src/pages/datasets/DatasetPage.tsx` · `examples/release-desk/src/pages/releases/ReleasePage.tsx` (워크플로 액션) | `references/patterns/detail.md` |
| 여러 단계 입력 | **FormWizardPage** | `examples/release-desk/src/pages/releases/NewReleasePage.tsx` | `references/patterns/form-wizard.md` |
| 설정·토글 | **SettingsPage** | `examples/release-desk/src/pages/settings/SettingsPage.tsx` | `references/patterns/settings.md` |
| 검색이 전부인 목록 | ListDetail + `SearchHero` | `examples/dataset-explorer/src/pages/datasets/DatasetsPage.tsx` | — |

원본 파일 상단의 `디자인 플랜` 주석까지 읽는다 — 왜 그렇게 놓았는지가 거기 있다.

## 절차
1. `se-design`으로 디자인 플랜 작성 (목적·첫 시선·주 액션·계층·밀도·시그니처)
2. 위 표에서 패턴을 고르고 원본을 연다
3. 원본을 복사해 데이터·컬럼·액션만 바꾼다. 골격(제목 → 시그니처/요약 → 1차 분류 탭 → 2차 필터 → 표 → 상세)은 유지
4. 3상태를 채운다. `?__state=empty|error|slow`로 강제해 본다
5. `pnpm lint`와 `pnpm typecheck` 통과
6. 스크린샷 1회로 확인 (1440·1024 폭, 라이트·다크)

## 쉘과 시그니처
- 모든 페이지는 `AppShell` 안. 사이드바 로크업(마크+이름)·상단 검색(⌘K)·`PageHeader`·`PageBody`는 건드리지 않는다
- 시그니처는 `se.identity.json`의 `signature`가 정한다. 페이지 맨 위 한 자리: `StatusStrip`(모니터링) · `SearchHero`(조회) · `StageRail`(워크플로). `StatusStrip`은 목록 페이지에서 `variant="compact"`(한 줄), 개요 페이지에서 full. `SearchHero`·`StageRail`은 변형 없이 그대로
- 커맨드 팔레트: `AppShell`의 `command` prop에 그룹만 넘긴다 (이동·항목 점프·액션). 새 페이지를 만들면 여기에도 등록한다

## 자주 쓰는 조합
- **숫자 셀**: `meta: { align: 'right' }` + `font-mono text-xs` + `tnum`
- **ID·경로·버전**: `font-mono text-[13px]`
- **상태**: `StatusBadge`(작업) · `Badge tone=`(그 외). 의미 색은 액센트가 아니다
- **사람**: `Avatar` + 이름, 승인 상태는 아바타 스택(`release-desk/…/bits.tsx`)
- **시간·숫자**: `@se/ui`의 `formatRelative` + `title={formatAbsolute}`, `formatDuration`, `formatCompact`, `formatBytes`
- **행 액션**: `DataTable rowActions` — 호버 시 아이콘 1–3개, 위험 동작은 `ConfirmDialog`(이름 재입력)
- **폼**: `Form`/`FormField`/`FormItem`/`FormLabel`/`FormControl`/`FormMessage` + zod. 섹션은 `FormSection`(좌 설명·우 필드)
- **차트**: `ChartCard` + `BarChart|LineChart|MeterList`. 성공/실패/취소는 의미 색, 계열은 `chart-1..8` 순서 고정, 2개 이상이면 `legend`

## 레퍼런스
- `references/INDEX.md` — 컴포넌트 목록과 개수 (자동 생성)
- `references/components/<name>.md` — props·기본값·설명 (자동 생성, 코드와 항상 일치)
- `references/tokens.md` — 토큰 클래스 전체와 밀도·테마 전환
- `references/patterns/*.md` — 패턴 골격
