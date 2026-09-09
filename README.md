# SE Web Toolkit

내부 엔지니어링 도구를 위한 디자인 시스템 + Claude Code 플러그인.
설계 문서: [docs/DESIGN.md](docs/DESIGN.md) · [PDF](docs/DESIGN.pdf)

## 구성

| 경로 | 내용 | 상태 |
|---|---|---|
| `packages/tokens` | `@se/tokens` — 브랜드 코어(고정) + `createTheme(identity)`, Vite 플러그인, Tailwind v4 매핑 | P1 ✓ |
| `packages/ui` | `@se/ui` — shadcn/Radix 관례의 React 컴포넌트, AppShell, 시그니처 | P1 진행 중 (첫 화면 분량) |
| `examples/reference-app` | 레퍼런스 앱 **Job Monitor** — 모든 패턴의 원본이자 품질 기준 | 잡 목록(ListDetail) ✓ |
| `identities/` | 서비스 아이덴티티 레지스트리 (hue·시그니처 충돌 검사) | ✓ |
| `plugin/` | Claude Code 플러그인 (`se-ui`, `se-design`, `/se:*`) | 예정 |
| `templates/` | `create-se-app` 템플릿 | 예정 |

## 시작

```bash
# Node 22 (.nvmrc) + pnpm 9
pnpm install            # @se/tokens 는 prepare 단계에서 dist 빌드
pnpm dev                # 레퍼런스 앱 http://localhost:5173
pnpm test               # 토큰 대비 검증 등
pnpm check-identity     # 레지스트리 hue/시그니처 검사
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

## 코드 규칙 (P2에서 ESLint로 강제 예정)

- 색은 토큰 클래스만: `bg-canvas text-ink border-line bg-accent text-on-accent …`. hex·Tailwind 기본 팔레트 금지.
- 폼 컨트롤·표·다이얼로그는 `@se/ui`. raw `<button>` `<input>` `<table>` 금지.
- 모든 페이지는 로딩 / 빈 / 에러 상태를 가진다.
- 한 화면에 `variant="primary"` 버튼은 하나.
