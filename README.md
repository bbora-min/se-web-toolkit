# SE Web Toolkit

내부 엔지니어링 도구를 위한 디자인 시스템 + Claude Code 플러그인.
설계 문서: [docs/DESIGN.md](docs/DESIGN.md) · [PDF](docs/DESIGN.pdf)

## 구성

| 경로 | 내용 | 상태 |
|---|---|---|
| `packages/tokens` | `@se/tokens` — 브랜드 코어(고정) + `createTheme(identity)`, Vite 플러그인, Tailwind v4 매핑 | P1 ✓ |
| `packages/ui` | `@se/ui` — shadcn/Radix 관례의 React 컴포넌트 50개, AppShell, 시그니처 3종 | ✓ |
| `packages/charts` | `@se/charts` — Recharts 래퍼 (ChartCard·Bar·Line·MeterList) | ✓ |
| `packages/eslint-plugin` | `@se/eslint-plugin` — 규칙 5개, recommended/library 설정 | ✓ |
| `examples/reference-app` | **Job Monitor** — 모니터링. 개요(Dashboard)·잡 목록(ListDetail, 서버 모드)·로그 뷰어 | ✓ |
| `examples/dataset-explorer` | **Dataset Explorer** — 조회. 검색 히어로·상세(DetailPage) | ✓ |
| `examples/release-desk` | **Release Desk** — 업무 처리. 단계 레일·위자드(FormWizard)·설정(Settings) | ✓ |
| `identities/` | 서비스 아이덴티티 레지스트리 (hue·시그니처 충돌 검사) | ✓ |
| `plugin/` | Claude Code 플러그인 — 스킬 11개(자동 2 + 명령 9), 에이전트 3, 훅 2 | ✓ |
| `templates/app-vite-react` + `packages/create-se-app` | 새 서비스 템플릿(워크스페이스에서 컴파일됨)과 CLI — 지금은 모노레포 안 `examples/`에 생성 | ✓ |

## 팀에서 쓰기

```
git clone https://github.com/bbora-min/se-web-toolkit && cd se-web-toolkit
./scripts/setup.sh --dev      # Node 22 · pnpm · 설치 · 검사 · 플러그인 등록 · 레퍼런스 앱 실행 (sudo 없음, 멱등)
claude                        # 새 세션
/se:new incident-desk         # 새 서비스 — 인터뷰 → 생성 → 설치 → 실행
```
스크립트 없이 하려면 Claude Code 안에서 `/plugin marketplace add bbora-min/se-web-toolkit` → `/plugin install se@se-web-toolkit`.
기존 프로젝트는 `/se:adopt`. 플러그인 상세는 [plugin/README.md](plugin/README.md).

## 툴킷 개발
`./scripts/setup.sh --full` 이 환경·설치·전체 검사를 한 번에 한다.

```bash
# Node 22 (.nvmrc) + pnpm 9
pnpm install            # @se/tokens 는 prepare 단계에서 dist 빌드
pnpm dev                # Job Monitor 5173 (dataset-explorer 5174 · release-desk 5175는 --filter 로)
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
