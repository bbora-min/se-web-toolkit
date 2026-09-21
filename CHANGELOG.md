# CHANGELOG

툴킷(패키지 `@se/*` + 플러그인)은 **한 버전**으로 움직인다. 항목마다 세 칸: **바뀐 것** / **화면 변화**(코드는 그대로인데 보이는 게 달라지는 것) / **앱에서 할 일**(코드를 고쳐야 하는 것). 앱 담당자는 세 번째 칸만 읽어도 된다.
버전 의미: patch = 화면 변화 없음 · minor = 추가 또는 화면 변화, 코드 수정 불필요 · major = 앱 코드를 고쳐야 함. 깨지는 변경은 한 minor 동안 옛 방식을 남기고 경고한다.

## 0.21.1 — 2026-09-21

**바뀐 것**
- 골격의 **표시 이름**을 자연스러운 한국어로: 원장 → **목록**, 관측 벽 → **대시보드**, 트리아지 → **처리함**. 사이트·스킬 선택표·패턴 문서·예제 페이지의 디자인 플랜 주석·컴포넌트 주석 전부. 영문 id(`ledger`·`wall`·`triage`)와 파일명(`patterns/ledger.md` 등)은 그대로 — 코드 변경 없음

**화면 변화**
- 툴킷 사이트의 골격 이름만 바뀐다. 예제 앱 화면은 그대로

**앱에서 할 일**
- 없음

## 0.21.0 — 2026-09-21

**바뀐 것**
- 예제 앱의 빈 메뉴 다섯을 채웠다 — 전부 있는 골격(원장·그 변형)으로
  - **Job Monitor 노드 `/nodes`**: 요약 타일 4 + 노드 표(상태 · CPU/MEM 막대 · 실행 중 · 하트비트 · 가동 · CPU 24h 스파크라인). 행 → 잡 목록의 **노드 필터**(`?node=`, 새 파라미터 · 칩으로 해제). 개요의 노드 타일과 같은 원본
  - **Job Monitor 활동 `/activity`**: 잡(실패·재시도·취소·오래 걸린 완료)·노드·스케줄 이벤트를 날짜별로 묶은 피드. 종류 칩(건수), 줄 → 잡 콘솔·노드·잡 목록
  - **Dataset Explorer 소유자 `/owners`**: 팀으로 묶은 사람 카드(데이터셋 · 갱신 지연 · PII · 인증됨 · 30일 조회 스파크라인). 카드 → 데이터셋 목록의 **소유자 필터**(`?owner=`)
  - **Dataset Explorer 태그 `/tags`**: 태그의 뜻(규약)과 건수·지연·도메인 표. 행 → 데이터셋 목록의 **태그 필터**(`?tag=`)
  - **Release Desk 이력 `/history`**: 끝난 릴리스(배포·반려·롤백) 표 + 요약(배포 · 핫픽스 · 반려/롤백 · 리드타임 중앙값) + 필터(서비스 · 달 · 결과). 상세가 남은 것은 행 → 릴리스 상세
- API `useNodes`·`useActivity`·`useOwners`·`useTags`·`useHistory`, 목 `/api/nodes`·`/api/activity`·`/api/owners`·`/api/tags`·`/api/history`. 시각 회귀 `nodes`·`activity`·`owners`·`tags`·`history`

**화면 변화**
- 예제 앱의 메뉴 다섯이 빈 화면 대신 내용을 보여 준다. 잡 목록·데이터셋 목록에 노드/소유자/태그 필터 칩이 생길 수 있다(파라미터가 있을 때만)

**앱에서 할 일**
- 없음

## 0.20.0 — 2026-09-20

**바뀐 것**
- **툴킷 사이트** `apps/site`(5178) — 툴킷이 무엇이고 어떻게 쓰는지, 예제 앱 넷과 골격 열 개를 한곳에서. 홈(세 역할 · 예제 앱 카드 · 최근 바뀐 것) · 골격(원본 화면 딥링크 · 재료 · 세상의 대표) · 시작하기(Claude Code · 직접 · 있는 앱에 · 저장소) · 동작 원리. 그림은 예제 앱의 e2e 기준 스크린샷을 그대로, 버전·최근 변경은 CHANGELOG 에서 빌드 때 읽는다
- **GitHub Pages 한 사이트** — `pnpm build:pages`(`scripts/build-pages.mjs`)가 `/` 사이트 · `/storybook/` · `/apps/<id>/` 예제 앱 넷(브라우저 목 `VITE_MOCK=true`)을 `_site/` 로 조립. 워크플로 `pages`(`storybook` 대체, 저장소 Variables `DEPLOY_PAGES=true` + Pages Source = GitHub Actions)
- `@se/ui` **`restoreDeepLink` · `routerBasename`** — 정적 호스팅에서 SPA 깊은 링크(루트 `404.html` → sessionStorage → 되돌리기)와 `BASE_URL` 하위 경로 배포. 예제 앱 넷·템플릿이 쓴다. `VITE_MOCK=true` 면 배포 빌드에서도 MSW 목이 켜진다
- 레지스트리에 `se-toolkit`(hue 130 · topnav). 시각 회귀 `site` 4장
- `?__state=` 강제 상태가 `VITE_MOCK=true` 목 빌드에서도 동작(`hasForcedState`·`createApiClient`). 그러면서 드러난 것 — Job Monitor 잡 목록·Dataset Explorer 데이터셋의 **빈 상태가 `counts` 없는 응답에 죽던 것**을 고쳤다(탭 숫자는 0)

**화면 변화**
- Job Monitor `/jobs?__state=empty` · Dataset Explorer `/datasets?__state=empty` 가 빈 화면(크래시) 대신 빈 상태를 그린다. 그 외 예제 앱은 그대로. 사이트가 새로 생긴다

**앱에서 할 일**
- 없음. 하위 경로에 배포하는 앱이면 `<BrowserRouter basename={routerBasename(import.meta.env.BASE_URL)}>` 와 `main.tsx` 맨 위 `restoreDeepLink()` 를 템플릿처럼 넣으면 된다

## 0.19.0 — 2026-09-20

**바뀐 것**
- **대화 골격** — Dataset Explorer **질문 `/ask/:threadId?`**: 스레드 목록(새 대화 · 최근) | 대화 컬럼(사용자 말풍선 · 어시스턴트 평문 + 출처 칩 · 스트리밍 커서) + 컴포저(Enter 보내기 · Shift+Enter 줄바꿈 · 정지). 빈 스레드는 시작 질문 칩. 답은 카탈로그 사실(소유·SLA·컬럼·조인)로, 출처는 데이터셋 상세·도메인 가이드 링크. 목은 답을 한 번에 주고 화면이 스트리밍을 흉내 낸다 — 실제 백엔드는 SSE
- `@se/ui` **`Thread` · `Message` · `Composer` · `Citation`**
- API `useThreads`·`useThread`·`ask`(`/api/ask*`). 시각 회귀 `ask`·`ask-thread`. `se-ui` 선택표에 **대화** 행 + `patterns/chat.md`, `AskPage.tsx`·`mocks-ask.ts` 동봉. Storybook `패턴/Chat`
- 이로써 카탈로그의 골격 열 개(원장·허브·관측 벽·보드·문서·트리아지·콘솔·일정·캔버스·대화) 전부에 원본과 패턴 문서가 있다

**화면 변화**
- Dataset Explorer 네비에 "질문"이 생기고 `/ask/*` 화면이 생긴다(기준 스크린샷 추가). 다른 화면·앱은 그대로

**앱에서 할 일**
- 없음 — `/se:upgrade` 만. 런북 봇·VOC 요약이 필요하면 `AskPage.tsx` 를 복사하고 `ask()` 를 SSE 스트림으로 바꾼다

## 0.18.0 — 2026-09-20

**바뀐 것**
- **캔버스 골격** — 새 패키지 **`@se/canvas`**(React Flow 래퍼, 의존성 `@xyflow/react`): `Canvas`(노드·간선·선택, 토큰 크롬, 실행 중 간선은 흐름, 실패 간선은 danger), `TaskNode`(이름 · 상태 배지 · 메타, 상태가 테두리), `dagLayout`(층 배치, dagre 없음). 앱에서 `@xyflow/react` 직접 import 는 린트가 막는다(`import-from-ui`)
- Job Monitor 의 빈 메뉴였던 **파이프라인 `/pipelines/:name?`**: 파이프라인 6개의 태스크 DAG, 마지막 실행 기준 상태색, 오른쪽 인스펙터(선택 태스크의 사실·상류·하류·"콘솔에서 로그 보기"·실패면 "여기서부터 재시도", 선택 없으면 요약). API `usePipelines`·`usePipeline`(`GET /api/pipelines`, `/api/pipelines/:name`). 잡 콘솔이 `?q=` 로 초기 줄 필터를 받는다. 재시도·취소가 파이프라인 쿼리도 갱신한다
- 시각 회귀 `pipeline`. `se-ui` 선택표에 **캔버스** 행 + `patterns/canvas.md`, `PipelinePage.tsx` 동봉. Storybook `패턴/Canvas`. React 18 레인이 `@se/canvas` 도 typecheck

**화면 변화**
- Job Monitor 에 `/pipelines/*` 화면이 생긴다(기준 스크린샷 추가). 다른 화면·앱은 그대로

**앱에서 할 일**
- 없음 — `/se:upgrade` 만. 의존 맵·토폴로지가 필요하면 `@se/canvas` 를 설치하고 `PipelinePage.tsx` 를 복사한다. 앱 `app.css` 에 `@source '…/@se/canvas/src'` 를 추가해야 노드 클래스가 빌드에 들어간다

## 0.17.0 — 2026-09-20

**바뀐 것**
- **일정 골격** — Release Desk 의 빈 메뉴였던 **배포 캘린더 `/calendar`**: 월 격자(일요일 시작, 칩 = 배포 창 · 색 = 단계의 의미 색), 매주 금 18:00 – 월 09:00 프리즈가 빗금 구간으로, 오른쪽에 고른 날의 창 카드(칩·카드를 누르면 릴리스로). 월·날은 URL(`?month=`·`?day=`)
- `@se/ui` **`CalendarGrid`**(events · spans · selected · today · onSelectDay · onSelectEvent), `monthDays`·`ymd`. 빗금은 `.se-cal-span-warning|danger|neutral`
- Release Desk API `useCalendar(month)`(`GET /api/calendar?month=`). 시각 회귀 `calendar`
- 스킬: `se-ui` 선택표에 **일정** 행, `references/patterns/schedule.md`, `CalendarPage.tsx` 동봉. Storybook `패턴/CalendarGrid`

**화면 변화**
- Release Desk 에 `/calendar` 화면이 생긴다(기준 스크린샷 추가). 다른 화면·앱은 그대로

**앱에서 할 일**
- 없음 — `/se:upgrade` 만. 온콜·배치 스케줄이 필요하면 `CalendarPage.tsx` 를 복사하고 `events`·`spans` 만 바꾼다

## 0.16.0 — 2026-09-20

**바뀐 것**
- **콘솔 골격** — Job Monitor **`/jobs/:jobId/logs` 잡 콘솔**: 상단 바(식별자 · 상태 · 노드 · 소요 · 시도 · 재시도/취소) → 패싯(레벨 · 단계 · 시도) | 줄 필터 + `LogViewer` 라이브 테일 | 컨텍스트(실패 원인 → 같은 원인의 잡, 런북, 같은 파이프라인 최근). 드로어의 로그 탭에 "콘솔" 링크. 전폭 1600, 화면 높이 고정
- `@se/ui` **`FacetGroup`** — 값 · 건수 목록(그룹 안 OR, 건수 클릭 = 그 값만). `SplitPane` 의 오른쪽 칸 접힘 기준이 1280 미만으로(1024 는 세 칸이 너무 좁다)
- Job Monitor API `useJob(id)`(`GET /api/jobs/:id`, 실행 중 5초 갱신). 목의 `demo-failed`·`demo-running` 별칭(스크린샷·시연). 시각 회귀 `job-console`·`job-console-live`
- 스킬: `se-ui` 선택표에 **콘솔** 행, `references/patterns/console.md`, `JobConsolePage.tsx` 동봉

**화면 변화**
- Job Monitor 에 `/jobs/:id/logs` 화면이 생기고 잡 드로어 로그 탭 옆에 "콘솔" 버튼(기준 스크린샷 추가). `SplitPane` 오른쪽 칸이 1280 미만에서 접히므로 Release Desk `/approvals` 1024 기준 스크린샷도 갱신. 그 외는 그대로

**앱에서 할 일**
- 없음 — `/se:upgrade` 만. 빌드·트레이스 화면이 필요하면 `JobConsolePage.tsx` 를 복사하고 줄 파싱을 백엔드로 옮긴다

## 0.15.0 — 2026-09-20

**바뀐 것**
- **트리아지(3단) 골격** — Release Desk "내 승인 대기"가 `/releases?mine=1`(표) 에서 **`/approvals/:id?`** 로: 목록 | 본문 | 속성. 선택은 URL, `j`/`k`(↑↓) 이동·`Enter` 상세, 승인(primary, 바로)·반려(사유 다이얼로그), 결정하면 다음 항목으로. 필수 체크리스트가 남으면 승인 비활성 + 이유 한 줄. 화면 높이에 고정, 칸마다 스크롤, 폭 1440
- `@se/ui` **`SplitPane`** — 가로 분할(왼쪽·가운데·오른쪽), 손잡이 끌기·키보드(←→), `storageKey` 로 폭 기억, 1024 이하 오른쪽 접힘. **`ShellFill`** — 쉘 패딩·최대 폭을 무르는 전폭 컨테이너(`fixed` 면 화면 높이) — 관측 벽·트리아지가 쉘 내부 값을 적지 않는다
- Release Desk `lib/workflow` 에 `isMyTurn`·`requiredMissing`·`decisionBlocker` — 상세·보드·트리아지·다이얼로그·쉘 카운트가 같은 규칙. `DecisionDialog onDecided`(취소와 구분)·`defaultDecision`
- 시각 회귀에 `approvals`·`approvals-empty`. 쉘 네비·팔레트·사용자 메뉴의 "내 승인 대기"가 `/approvals` 로
- 스킬: `se-ui` 선택표에 **트리아지** 행, `references/patterns/triage.md`, `ApprovalsPage.tsx` 동봉. Storybook `패턴/SplitPane`

**화면 변화**
- Release Desk 에 `/approvals` 화면이 생기고 네비의 "내 승인 대기"가 그리로 간다(기준 스크린샷 추가). `?mine=1` 표는 남아 있다. 다른 화면·앱은 그대로

**앱에서 할 일**
- 없음 — `/se:upgrade` 만. 받은 편지함·인시던트 큐가 필요하면 `ApprovalsPage.tsx` 를 복사하고 결정 액션만 바꾼다

## 0.14.0 — 2026-09-20

**바뀐 것**
- **문서(document) 골격** — Dataset Explorer 의 빈 메뉴였던 **도메인**이 `/domains/:domain` 도메인 가이드로: 좌측 트리(도메인 → 데이터셋) · 65자 본문(개요 → 적재 규약과 사용 규칙 → 데이터 사전 → 자주 쓰는 쿼리 → 문의) · 우측 목차(스크롤 따라 현재 절). 데이터 사전 표는 데이터셋 상세로 잇는 링크. 내용은 백엔드가 구조화된 블록(p · ul · code · callout · 표)으로 준다(`/api/domains`, `/api/domains/:id`)
- `@se/ui` **`DocLayout` · `DocHeader` · `Prose`(`.se-prose` 타이포) · `Callout` · `TreeNav` · `TableOfContents`**
- 시각 회귀에 `domain`·`domain-error`. 커맨드 팔레트에 "도메인 가이드" 그룹
- 스킬: `se-ui` 선택표에 **문서** 행, `references/patterns/doc.md`, `DomainPage.tsx`·`mocks-domains.ts` 동봉. Storybook `패턴/Doc`
- 골격별 PR 5개 완료 — 허브·관측 벽·보드·문서. 남은 골격(트리아지·콘솔·일정·캔버스·대화)은 다음 릴리스부터

**화면 변화**
- Dataset Explorer 에 `/domains/*` 화면이 생긴다(기준 스크린샷 추가). 기존 화면·다른 앱은 그대로

**앱에서 할 일**
- 없음 — `/se:upgrade` 만. 런북·가이드가 필요하면 `DomainPage.tsx` 를 복사하고 블록 타입에 맞춰 백엔드를 연결(문서 속 표는 정적 `Table` 프리미티브)

## 0.13.0 — 2026-09-20

**바뀐 것**
- **보드(Kanban) 골격** — Release Desk 릴리스 목록에 **표 ↔ 보드 전환**(`?view=board`, 헤더의 세그먼트). 보드는 열 = 단계(초안 제외 5열), 카드 = 릴리스(버전·유형·제목 → 막힘 → 서비스·승인자·위험 → 담당·배포 창). 카드를 **바로 다음 열로 끌면 단계가 진행**되고, 상세 화면의 "다음 단계" 버튼과 **같은 함수**(`lib/workflow.ts` `advanceBlocker` — 담당자만, 승인 단계는 승인자만, 필수 체크리스트 미완 불가)가 `canMove` 로 막는다 — 못 옮기는 열은 흐려지고 놓으면 이유를 toast. 카드 메뉴의 "다음 단계로"가 같은 일(키보드·터치). 보드에서 단계 레일을 누르면 필터가 아니라 그 열로 스크롤·강조
- `@se/ui` **`Board` · `BoardColumn` · `BoardCard`**(HTML5 drag & drop, 의존성 없음. `onMove`·`canMove`, 열 `count`·`blocked`·`highlighted`, 카드 `onOpen`·`draggable`)
- Release Desk API `useAdvanceRelease()`(id 인자). 시각 회귀에 `releases-board` 화면
- 스킬: `se-ui` 선택표에 **보드** 행, `references/patterns/board.md`, `ReleasesBoard.tsx` 동봉. Storybook `패턴/Board`

**화면 변화**
- Release Desk `/releases` 헤더에 [표 | 보드] 세그먼트(기준 스크린샷 갱신). 표 자체와 다른 화면·앱은 그대로

**앱에서 할 일**
- 없음 — `/se:upgrade` 만. 단계가 있는 목록에 보드를 붙이려면 `ReleasesBoard.tsx` 를 복사하고 `canMove` 에 그 워크플로의 규칙을

## 0.12.0 — 2026-09-20

**바뀐 것**
- **관측 벽(observability wall) 골격** — Job Monitor 개요(`examples/reference-app/OverviewPage.tsx`)를 제목 있는 카드 4장에서 **제목 없는 12칸 타일 벽**으로: 툴바(기간 · 자동 갱신 · 목록 링크) → 상태 스트립 → [시간별 완료 8 | 파이프라인 성공률 4] → [큐 대기 6(목표선) | 실패 원인 3 | 노드 3] → 최근 실패 12. 바탕은 canvas, 전폭(쉘이 `/overview` 에서만 1440), 임계 초과는 타일 점(`tone`)
- `@se/ui` **`TileGrid` · `Tile`**(span · spanNarrow · title · note · legend · actions · tone), **`useContentWidth(px)`**(페이지가 떠 있는 동안 쉘 콘텐츠 폭을 바꾼다 — 벽·보드용). `@se/charts` **`ChartLegend`** 내보냄(ChartCard 가 쓰던 범례 — `Tile legend=` 에 그대로)
- Job Monitor 목·타입에 `failureCauses`(에러 첫 단어로 묶은 실패 원인 상위 5, 기간을 따른다). 잡 검색(`q`)이 에러 문자열도 본다 — 실패 원인 타일에서 드릴다운
- 스킬: `se-ui` 선택표의 대시보드 행이 관측 벽, `references/patterns/dashboard.md` 를 벽 골격으로 다시 씀(카드형이 나은 경우 포함). Storybook `패턴/TileGrid`

**화면 변화**
- Job Monitor `/overview` 전체(기준 스크린샷 갱신 — 노드 타일은 CPU·MEM 헤더와 실행 중 잡 수 열). 잡 목록의 검색 플레이스홀더에 "에러" 추가. 그 외 다른 화면·다른 앱은 그대로. `ChartCard` 렌더는 동일(범례가 컴포넌트로 분리됐을 뿐)

**앱에서 할 일**
- 없음 — `/se:upgrade` 만. 대시보드를 벽으로 바꾸려면 `OverviewPage.tsx` 원본을 복사한다(페이지 안의 `useContentWidth(1440)` 이 폭을 넓힌다)

## 0.11.0 — 2026-09-20

**바뀐 것**
- **허브(Hub) 골격** — 4번째 레퍼런스 앱 `examples/se-home` **SE Home**(hue 350° · `topnav` 쉘 · timeline-ribbon · friendly). 형제 전부의 입구: 인사 + 상태 한 줄 → 큰 검색(⌘K 팔레트) + 빠른 진입 칩 → 가족의 24시간 리본(줄 = 서비스) → 서비스 카드 3열(+ 새 서비스) → 최근 본 것 · 오늘(온콜·공지). `/services` 는 같은 데이터를 표(원장)로. 5177 포트, 시각 회귀 5화면
- `@se/ui` **`ServiceMark`** — 형제 서비스의 마크를 hue 로 그린다(허브 카드·팔레트·아이덴티티 시트의 가족 카드가 공유). **`useShellSearch()`** — 페이지 안에서 쉘의 ⌘K 팔레트를 연다(허브의 큰 검색). **`Chip`**(빠른 진입·프리셋 알약, `asChild`·`count`·`active`), **`SectionHeader`**(페이지 안 블록 제목 — h2·설명·액션), `TimelineRibbon laneWidth`(줄 이름 칸 폭 — 서비스 이름처럼 긴 줄), 쉘 검색 버튼 플레이스홀더 말줄임. `@se/tokens` 가 `accentScale` 을 내보내고(ServiceMark 가 라이트·다크 값을 토큰과 같은 공식으로), 레지스트리에 `monogram`(`registryMonogram()`, `create-se-app` 이 적는다)
- 스킬: `se-ui` 선택표에 **허브** 행(`references/examples/se-home/HomePage.tsx` · `Shell.tsx`), `references/patterns/hub.md`. 목·쉘 원본 동봉
- 레지스트리에 `se-home` 등록 — 쉘 배치가 처음으로 갈린다(sidebar 4 · topnav 1)

**화면 변화**
- `/__identity` 가족 카드의 색 칩이 모노그램 마크(`ServiceMark`, 레지스트리 `monogram`)로, 가족에 SE Home 추가 — 레퍼런스 앱 3개 기준 스크린샷 갱신
- `TimelineRibbon` 줄 이름 칸 기본 폭 49 → 56px(`/__signatures` 갤러리 7px 이동), 축·지금 선 들여쓰기를 px 로 고정(루트 14px 에서 1.5px 어긋나던 것)

**앱에서 할 일**
- 없음 — `/se:upgrade` 만. 팀 포털이 필요하면 `examples/se-home` 을 `/se:new --shell topnav --signature timeline-ribbon` 으로 시작해 레지스트리(`/api/home`)를 실제 백엔드에 연결

## 0.10.0 — 2026-09-20

**바뀐 것**
- **골격(archetype) 축** — 세 예제가 "색만 다르고 골격은 하나"(사이드바 · 제목 · 띠 · 필터 · 표)라는 진단(DESIGN §3.2). 쉘 배치를 서비스 슬롯으로 내리고, 페이지 골격(원장·보드·관측 벽·문서·허브·트리아지·콘솔·일정)을 화면의 첫 결정으로 둔다. 골격별 원본은 다음 릴리스부터 하나씩(0.11.0 허브 · 0.12.0 관측 벽 · 0.13.0 보드 · 0.14.0 문서)
- `se.identity.json` 에 **`shell`** 슬롯(`sidebar` 기본 · `topnav` · `panes`). 스키마·`parseIdentity`·`identity.schema.json`. 레지스트리(`identities/registry.json`)에 `shell` 열 — **같은 배치가 셋 이상이면 `check-identity` 가 경고**(`MAX_SAME_SHELL = 2`). `create-se-app --shell`
- `AppShell` **`layout`** prop — `sidebar`(지금 그대로) · `topnav`(상단 한 줄 네비, 사이드바 없음, 활성 항목 액센트 밑줄, 크레딧은 푸터) · `panes`(56px 아이콘 레일 + 전폭 콘텐츠, 패딩·최대 폭 없음, `NavItem label=` 이 툴팁). `NavItem`·`NavSection` 이 배치에 맞춰 모양을 바꾼다(`useShellLayout`). `ThemeToggle compact`(버튼 하나로 순환)
- `IdentitySheet` 에 쉘 배치 표시(히어로 한 줄 · 슬롯 9개 · 가족 카드). Storybook AppShell 스토리에 상단 네비·패널
- 스킬: `se-design` 플랜 첫 줄이 **골격**, 정보 설계 첫 항목 "골격이 첫 결정", 루브릭 개성 항목에 "형제와 골격이 같고 색만 다르면 7점 이하" · `se-ui` 선택표에 골격 열, 절차 3 "고른 골격의 원본 구조 유지", 쉘 절 `layout={identity.shell}` · `identity` 슬롯 9개, 같은 배치 둘까지 · `new --shell` · `se-design-critic` 6번 골격 판단

**화면 변화**
- `/__identity` 시트에 쉘 배치 줄·행이 생긴다(레퍼런스 앱 3개 기준 스크린샷 갱신). 그 외 화면은 그대로 — 기존 앱은 전부 `sidebar` 이고 `layout` 기본값이라 픽셀 변화 없음

**앱에서 할 일**
- 없음 — `/se:upgrade` 만. 배치를 바꾸려면 `se.identity.json` 의 `shell` 과 `Shell.tsx` 의 `<AppShell layout={parseIdentity(identity).shell}>` 을 함께(`panes` 는 `NavItem label=` 추가). 다음 `/se:identity` 가 형제와 겹치지 않는 배치를 제안한다

## 0.9.0 — 2026-09-15

**바뀐 것**
- **`@se/upgrade`** CLI(`se-upgrade [--dir] [--to vX] [--dry] [--json]`): 현재 태그 ↔ 목표 태그 사이 CHANGELOG "앱에서 할 일" 출력 → `@se/*` 참조를 태그로 교체(main 추적도 고정) → install → typecheck → lint. `/se:upgrade` 스킬이 이걸 쓴다
- **자동 업그레이드 PR** `upgrade-apps` 워크플로: 태그마다 레지스트리에 `repo` 가 적힌 앱에 `se-upgrade/<태그>` PR(본문에 할 일·검사 결과). Variables `AUTO_UPGRADE_PRS=true` + Secrets `APPS_TOKEN` 으로 켬
- **npm 배포** `publish` 워크플로: 태그마다 `@se/*` 를 레지스트리에(`NPM_PUBLISH=true` + `NPM_TOKEN`, 사내면 `NPM_REGISTRY`). 패키지에 `publishConfig`·`repository` 추가
- P3 완료 — DESIGN §13·§15 갱신

**화면 변화**
- 없음

**앱에서 할 일**
- 없음. 자동 PR 을 받고 싶으면 툴킷 `identities/registry.json` 의 내 서비스 항목에 `"repo"`(와 하위 폴더면 `"appDir"`)를 적어 달라고 요청

## 0.8.0 — 2026-09-14

**바뀐 것**
- **`@se/codemods`**: jscodeshift 변환 4종 — `mui`(Button variant 매핑·TextField→Input·Chip→Badge·Alert·Dialog 계열 …) · `antd`(Button type/danger/size·Input·TextArea·Tag→Badge·Alert·Switch·Checkbox·`message.*`→`toast.*`) · `raw-controls`(`<button>`→Button, `<input>`→Input/Checkbox, `<textarea>`→Textarea, 정적 `<select>`→Select options, `<table>` 은 TODO) · `tailwind-palette`(`bg-blue-600 text-white`→`bg-info text-on-info`, 남색·보라→accent, 회색→표면/잉크/라인, `-50/-100`→`-soft`). 못 정한 것은 `TODO(se-adopt)` 주석. CLI `se-codemods <all|변환> <경로> [--dry]`, `pnpm dlx "github:…#v0.8.0&path:packages/codemods"`
- `/se:adopt` 4단계와 `se-migrator` 에이전트가 페이지마다 codemod 를 먼저 돌린 뒤 남은 TODO 를 손으로 옮긴다
- CI: 시각 회귀(`visual`, 레퍼런스 앱 화면 48 기준)·React 18 레인(`react18`) job — 0.7.0 이후 추가

**화면 변화**
- 없음

**앱에서 할 일**
- 없음. 도입 중인 프로젝트는 4단계에서 `--dry` 로 먼저 보고 적용

## 0.7.0 — 2026-09-14

**바뀐 것**
- **Storybook**(`apps/storybook`, Storybook 10): 사람용 창. 툴바에서 아이덴티티(레지스트리의 서비스 전부)·테마·밀도를 바꿔 같은 컴포넌트가 서비스마다 어떻게 보이는지 본다. "가족 초상화" 스토리는 모든 서비스를 스코프된 CSS 로 나란히. 시그니처 5종·컨트롤·DataTable(3상태)·상태와 피드백·데이터 표시·AppShell·차트 스토리, autodocs(TSDoc 그대로). `pnpm storybook`, CI 가 빌드하고 main 은 GitHub Pages 로 배포(저장소 Variables 에 `DEPLOY_STORYBOOK=true` + Settings › Pages › Source = GitHub Actions 를 한 번 켜야 함)
- 플러그인·패키지 코드 변경 없음 (버전은 툴킷 한 값 규칙에 따라 함께 올림)

**화면 변화**
- 없음

**앱에서 할 일**
- 없음

## 0.6.0 — 2026-09-14

**바뀐 것**
- 시그니처 2종 추가로 5종 완성: `TimelineRibbon`(활동·이력 — "최근 무슨 일이", 줄별 이벤트·구간·지금 선) · `MetricMarquee`(비용·사용량·품질 — "얼마인가", 주 지표 액센트 블록 + 보조 지표 띠 + 기간 칩). `IMPLEMENTED_SIGNATURES` 에 포함되어 `/se:new --signature` 와 `/se:identity` 가 고를 수 있다
- Job Monitor 에 개발 전용 `/__signatures` 갤러리 — 다섯 시그니처를 같은 목 데이터로 나란히. 스킬 예제로 동봉
- `Sparkline` `inverse`(액센트 블록 위), 좁은 타일에서 비례 축소
- README 온보딩 정리, VALIDATION.md 에 시험 A·B·C 결과 기록

**화면 변화**
- `StatCard` 의 스파크라인이 좁은 타일에서 잘리거나 값과 겹치지 않고 비례로 줄어든다 — 1280 폭의 4열 `StatusStrip` 마지막 타일이 이에 해당

**앱에서 할 일**
- 없음 — `/se:upgrade` 만. 시그니처를 바꾸려면 `se.identity.json` 의 `signature` 와 첫 화면의 컴포넌트를 함께

## 0.5.0 — 2026-09-14

**바뀐 것**
- 운영 규칙 도입: 버전 한 값(루트 package.json 기준, `pnpm release:bump`), CHANGELOG, merge 시 태그 `v<버전>` 자동, CI `check:release`
- `create-se-app` 이 만드는 앱은 `@se/*` 를 자기 버전 태그(`github:…#v0.5.0&path:…`)에 고정한다 — 툴킷이 바뀌어도 앱은 `/se:upgrade` 전까지 그대로
- `/se:upgrade` 스킬: CHANGELOG 의 "앱에서 할 일" → 의존성 갱신 → typecheck·lint → 전/후 스크린샷 diff → 달라진 화면만 `/se:review`
- `/se:audit` 가 앱 버전과 최신 태그를 비교해 밀린 변경을 보여준다
- 0.4.x 에서 들어온 것(참고): DataTable 비율 폭·`text-on-*` 토큰·경고색 `#9A6700`·`hasForcedState`(0.3.0), React 18·Vite 5 peer·MeterList chart 톤·LineChart 목표선·StatusStrip compact 보더·AppShell `credit`·adopt 공존 레시피·레지스트리 동봉(0.4.0), danger 규칙(0.4.1)

**화면 변화**
- 없음 (0.5.0 자체는 규칙·도구만)

**앱에서 할 일**
- 없음. 기존 앱(main 을 가리키는 `#path:` 의존성)은 다음 `/se:upgrade` 때 태그 고정으로 바뀐다

## 0.1.0 — 2026-09-10

최초 릴리스. `@se/tokens`(createTheme·OKLCH·대비 규칙) · `@se/ui` 50 컴포넌트 · `@se/charts` · `@se/eslint-plugin` 5 규칙 · 레퍼런스 앱 3 · 템플릿 · 플러그인(스킬 11·에이전트 3·훅 2).
