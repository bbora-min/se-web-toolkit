# SE Web Toolkit

내부 엔지니어링 도구를 위한 디자인 시스템 + Claude Code 플러그인.
설계 문서: [docs/DESIGN.md](docs/DESIGN.md) · [PDF](docs/DESIGN.pdf)

## 구성

| 경로 | 내용 | 상태 |
|---|---|---|
| `packages/tokens` | `@se/tokens` — 브랜드 코어(고정) + `createTheme(identity)`, Vite 플러그인, Tailwind v4 매핑 | P1 ✓ |
| `packages/ui` | `@se/ui` — shadcn/Radix 관례의 React 컴포넌트 50개, AppShell, 시그니처 5종(`/__signatures` 갤러리) | ✓ |
| `packages/charts` | `@se/charts` — Recharts 래퍼 (ChartCard·Bar·Line·MeterList) | ✓ |
| `packages/eslint-plugin` | `@se/eslint-plugin` — 규칙 5개, recommended/library 설정 | ✓ |
| `packages/upgrade` | `@se/upgrade` — 앱의 `@se/*` 참조를 새 태그로: CHANGELOG '앱에서 할 일' → 참조 교체 → install·typecheck·lint. `/se:upgrade` 와 `upgrade-apps` 워크플로가 쓴다 | ✓ |
| `packages/codemods` | `@se/codemods` — MUI·antd·raw 컨트롤·Tailwind 팔레트 → `@se/ui`·토큰 (jscodeshift, `/se:adopt` 4단계가 먼저 돌림) | ✓ |
| `examples/reference-app` | **Job Monitor** — 모니터링. 개요(Dashboard)·잡 목록(ListDetail, 서버 모드)·로그 뷰어 | ✓ |
| `examples/dataset-explorer` | **Dataset Explorer** — 조회. 검색 히어로·상세(DetailPage) | ✓ |
| `examples/release-desk` | **Release Desk** — 업무 처리. 단계 레일·위자드(FormWizard)·설정(Settings) | ✓ |
| `examples/se-home` | **SE Home** — 입구. **허브 골격**(상단 네비 쉘 · 서비스 카드 · 최근 항목)의 원본, 형제 전부의 포털 | ✓ |
| `identities/` | 서비스 아이덴티티 레지스트리 (hue·시그니처·쉘 배치 충돌 검사) | ✓ |
| `plugin/` | Claude Code 플러그인 — 스킬 12개(자동 2 + 명령 10), 에이전트 3, 훅 2 | ✓ |
| `templates/app-vite-react` + `packages/create-se-app` | 새 서비스 템플릿(워크스페이스에서 컴파일됨)과 CLI — `pnpm dlx`로 어느 폴더에서든 | ✓ |
| `apps/storybook` | **Storybook** — 사람용. 아이덴티티 갤러리(가족 초상화)·시그니처 5종·컴포넌트·차트. 툴바에서 아이덴티티·테마·밀도 전환. `pnpm storybook` (6006). main 은 GitHub Pages 로 배포(저장소 Variables `DEPLOY_STORYBOOK=true` + Pages Source = GitHub Actions) | ✓ |

## 팀에서 쓰기 — 내 프로젝트 폴더에서

```
# 1. 플러그인 (한 번)
claude plugin marketplace add bbora-min/se-web-toolkit && claude plugin install se@se-web-toolkit
#    (또는 Claude Code 안에서 /plugin marketplace add … → /plugin install …)

# 2-a. 새 프로젝트
mkdir todo-web && cd todo-web && claude
/se:new todo-web            # 인터뷰 → pnpm dlx 로 생성 → @se/* 를 git 에서 설치 → 실행

# 2-b. 기존 프로젝트
cd my-existing-app && claude
/se:adopt                   # 감사 → 아이덴티티 → 기반 → 쉘 → 페이지 → 강제, 단계마다 PR
```
`@se/ui` 등은 npm 배포 전까지 git 태그(`github:bbora-min/se-web-toolkit#v0.5.0&path:packages/ui`)로 설치된다. 툴킷 저장소를 클론할 필요는 없다.

### 업데이트 받기 — 툴킷이 바뀌어도 앱은 그대로다
앱은 태그에 고정돼 있어 툴킷 merge 만으로는 아무것도 안 바뀐다. 받고 싶을 때:
```
claude plugin update se@se-web-toolkit   # 스킬·규칙
/se:upgrade                              # @se/* 태그 올림 → typecheck·lint → 전/후 스크린샷 diff → 달라진 화면만 리뷰 → PR
```
무엇이 바뀌었고 앱에서 뭘 해야 하는지는 [CHANGELOG.md](CHANGELOG.md) 의 "앱에서 할 일" 칸에 있다. `/se:audit` 가 앱이 몇 버전 밀렸는지 보여 준다.

### 툴킷을 고쳐서 내보내기
브랜치에서 수정 → 레퍼런스 앱 3개 스크린샷(라이트·다크·1024) → `/code-review` → `pnpm release:bump <x.y.z>` 로 버전을 한 번에 올리고 CHANGELOG 세 칸(바뀐 것 / 화면 변화 / 앱에서 할 일)을 채움 → PR. CI `check:release` 가 코드 변경에 버전·CHANGELOG 가 없으면 실패시키고, `visual` job 이 레퍼런스 앱 화면을 기준 스크린샷과 비교하고(의도한 변화면 Actions › visual-baseline 으로 기준 갱신), `react18` job 이 React 18 로 강제 설치해 typecheck·build·e2e 를 돌린다. merge 되면 `v<버전>` 태그가 자동으로 찍히고, 설정을 켜 두면 태그마다 앱 리포에 업그레이드 PR(`upgrade-apps`: Variables `AUTO_UPGRADE_PRS=true` + Secrets `APPS_TOKEN` + 레지스트리 `repo`)과 npm 배포(`publish`: `NPM_PUBLISH=true` + `NPM_TOKEN`)가 따라온다.

## 툴킷 개발
`./scripts/setup.sh --dev` 가 Node 22 · pnpm · 설치 · 검사 · 플러그인 등록 · 레퍼런스 앱 3개 실행(5173–5175)을 한 번에 한다 (sudo 없음, 멱등). `--full` 은 전체 검사까지. 플러그인 상세는 [plugin/README.md](plugin/README.md), 시험 절차와 결과는 [docs/VALIDATION.md](docs/VALIDATION.md).

```bash
# Node 22 (.nvmrc) + pnpm 9
pnpm install            # @se/tokens 는 prepare 단계에서 dist 빌드
pnpm dev                # Job Monitor 5173 (dataset-explorer 5174 · release-desk 5175 · se-home 5177는 --filter 로)
pnpm lint               # @se/eslint-plugin 규칙 (warning도 실패)
pnpm test               # 토큰 대비 검증 등
pnpm check-identity     # 레지스트리 hue/시그니처 검사
pnpm gen:skill-docs     # 컴포넌트 문서 → 플러그인 스킬 (CI: check:skill-docs)
node packages/create-se-app/bin/create-se-app.mjs <id>   # 모노레포 안에서 새 예제 생성
```

레퍼런스 앱은 MSW 목 서버로 동작하며 백엔드가 필요 없습니다.
화면 상태를 강제로 보려면 `?__state=empty|error|slow` 를 붙입니다. 아이덴티티 시트는 `/__identity`.

## 아이덴티티 (같은 가족, 다른 형제)

각 서비스는 루트에 `se.identity.json` 하나를 둡니다.

```jsonc
{
  "id": "job-monitor",
  "name": "Job Monitor",
  "mark": { "type": "monogram", "text": "JM" },
  "accent": { "hue": 195 },          // 채도·명도는 브랜드 밴드에서 자동
  "neutralBias": "cool",
  "signature": "status-strip",       // status-strip | search-hero | stage-rail | timeline-ribbon | metric-marquee
  "density": "compact",
  "displayFont": "pretendard",
  "chart": "accent-sequential",
  "tone": "terse"
}
```

`createTheme`이 라이트/다크 CSS 변수를 만들고, WCAG 대비 규칙을 통과하지 못하면 빌드가 실패합니다.
새 서비스는 `identities/registry.json`에 등록하고 기존 서비스와 hue 30° 이상 떨어져야 합니다.

## 코드 규칙 (`@se/eslint-plugin`이 강제 — `pnpm lint`)

- 색은 토큰 클래스만: `bg-canvas text-ink border-line bg-accent text-on-accent …`. hex·Tailwind 기본 팔레트 금지.
- 폼 컨트롤·표·다이얼로그는 `@se/ui`. raw `<button>` `<input>` `<table>` 금지.
- 모든 페이지는 로딩 / 빈 / 에러 상태를 가진다.
- 한 화면에 `variant="primary"` 버튼은 하나.
