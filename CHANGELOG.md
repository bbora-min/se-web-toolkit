# CHANGELOG

툴킷(패키지 `@se/*` + 플러그인)은 **한 버전**으로 움직인다. 항목마다 세 칸: **바뀐 것** / **화면 변화**(코드는 그대로인데 보이는 게 달라지는 것) / **앱에서 할 일**(코드를 고쳐야 하는 것). 앱 담당자는 세 번째 칸만 읽어도 된다.
버전 의미: patch = 화면 변화 없음 · minor = 추가 또는 화면 변화, 코드 수정 불필요 · major = 앱 코드를 고쳐야 함. 깨지는 변경은 한 minor 동안 옛 방식을 남기고 경고한다.

## 0.12.0 — 2026-09-20

**바뀐 것**
- **관측 벽(observability wall) 골격** — Job Monitor 개요(`examples/reference-app/OverviewPage.tsx`)를 제목 있는 카드 4장에서 **제목 없는 12칸 타일 벽**으로: 툴바(기간 · 자동 갱신 · 목록 링크) → 상태 스트립 → [시간별 완료 8 | 파이프라인 성공률 4] → [큐 대기 6(목표선) | 실패 원인 3 | 노드 3] → 최근 실패 12. 바탕은 canvas, 전폭(쉘이 `/overview` 에서만 1440), 임계 초과는 타일 점(`tone`)
- `@se/ui` **`TileGrid` · `Tile`**(span · spanNarrow · title · note · legend · actions · tone). `@se/charts` **`ChartLegend`** 내보냄(ChartCard 가 쓰던 범례 — `Tile legend=` 에 그대로)
- Job Monitor 목·타입에 `failureCauses`(에러 첫 단어로 묶은 실패 원인 상위 5)
- 스킬: `se-ui` 선택표의 대시보드 행이 관측 벽, `references/patterns/dashboard.md` 를 벽 골격으로 다시 씀(카드형이 나은 경우 포함). Storybook `패턴/TileGrid`

**화면 변화**
- Job Monitor `/overview` 전체(기준 스크린샷 갱신). 잡 목록 등 다른 화면·다른 앱은 그대로. `ChartCard` 렌더는 동일(범례가 컴포넌트로 분리됐을 뿐)

**앱에서 할 일**
- 없음 — `/se:upgrade` 만. 대시보드를 벽으로 바꾸려면 `OverviewPage.tsx` 원본을 복사하고 `Shell.tsx` 에 `maxWidth={pathname.startsWith('/overview') ? 1440 : 1120}`

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
