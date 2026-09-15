# CHANGELOG

툴킷(패키지 `@se/*` + 플러그인)은 **한 버전**으로 움직인다. 항목마다 세 칸: **바뀐 것** / **화면 변화**(코드는 그대로인데 보이는 게 달라지는 것) / **앱에서 할 일**(코드를 고쳐야 하는 것). 앱 담당자는 세 번째 칸만 읽어도 된다.
버전 의미: patch = 화면 변화 없음 · minor = 추가 또는 화면 변화, 코드 수정 불필요 · major = 앱 코드를 고쳐야 함. 깨지는 변경은 한 minor 동안 옛 방식을 남기고 경고한다.

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
