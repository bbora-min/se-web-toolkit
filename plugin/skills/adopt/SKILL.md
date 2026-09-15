---
name: adopt
description: "기존 React 프로젝트(예: 내 todo-web)에 SE 디자인 시스템을 점진 도입한다 — 감사 → 아이덴티티 → 기반 → 쉘 → 페이지 → 강제. 각 단계가 PR 하나, 어디서 멈춰도 동작. '/se:adopt [0-5]'"
argument-hint: "[0-5] 생략하면 현재 단계를 판단"
---

# /se:adopt — 점진 도입 (strangler)

현재 폴더의 프로젝트에 적용한다. `$ARGUMENTS`의 단계만 수행한다. 생략하면 상태를 보고 다음 단계를 제안하고 확인받는다. **한 번에 한 단계, 단계마다 커밋/PR.**

전제: React 18+ · Vite 5+(또는 Next) · **pnpm**(`@se/*` 는 git 서브디렉터리 의존성이라 npm 은 설치가 실패한다 — npm 프로젝트는 2단계에서 `pnpm import` 로 전환). Node 20.19 미만이면 2단계 전에 Node 업그레이드 PR을 먼저.

| 단계 | 할 일 | 산출물 |
|---|---|---|
| **0 감사** | 스택·Node·**패키지 매니저**(npm 이면 2단계 전환 항목으로)·Tailwind 버전(3 이면 v4 코드모드 계획), UI 라이브러리(`@mui` `antd` `chakra` `styled-components` …), 색 인벤토리(`grep -rnE '#[0-9a-f]{3,8}\b\|bg-(red\|blue\|…)-'`), raw `<button>`·`<table>` 수, 페이지/라우트 목록, 주요 화면 스크린샷 | `docs/adopt-report.md` |
| **1 아이덴티티** | 현재 서비스의 개성(주 색·톤)을 **보존**하며 `/se:identity` → `se.identity.json` 생성. 기존 주 색의 hue가 규칙에 걸리면 가장 가까운 통과 hue로 | `se.identity.json` |
| **2 기반** | 최신 태그 확인: `T=$(git ls-remote --refs --tags --sort=-v:refname https://github.com/bbora-min/se-web-toolkit "v*" \| head -1 \| sed 's#.*/##')`. 설치(태그 고정 — 이후 갱신은 `/se:upgrade`): `pnpm add "github:bbora-min/se-web-toolkit#$T&path:packages/tokens" "github:bbora-min/se-web-toolkit#$T&path:packages/ui" "github:bbora-min/se-web-toolkit#$T&path:packages/charts"` + `pnpm add -D "github:bbora-min/se-web-toolkit#$T&path:packages/eslint-plugin" tailwindcss @tailwindcss/vite`. Vite에 `seTokens()`·`tailwindcss()`, 진입점에 `import 'virtual:se-theme.css'`, 앱 CSS에 `@import 'tailwindcss'; @import '@se/tokens/tailwind.css'; @import '@se/ui/styles.css'; @source '../node_modules/@se/ui/src'; @source '../node_modules/@se/charts/src';`, 루트에 `ThemeProvider`·`TooltipProvider`·`Toaster`. 기존 CSS·Tailwind 3 과의 공존은 [references/coexist.md](references/coexist.md) 의 순서대로(기본 팔레트 복원 → v3 값 명시 → html 상쇄 → 레거시 CSS 를 utilities 레이어로 → 라이트 고정). **시각 변화 0** — 이전 커밋을 worktree 로 띄워 픽셀 diff, 노이즈 바닥과 같아야 한다 | 기반 PR |
| **3 쉘** | 기존 네비·헤더를 `AppShell`로 교체(로크업·⌘K 팔레트·테마 토글 — 내부 도구면 `credit={false}`), 시그니처 적용, 페이지는 `PageBody`/`PageHeader`로 감싼다. 페이지 내부는 그대로. 겹치는 토큰 이름(`--color-surface` 등)·전역 `body { color }` 는 여기서 제거. 이 단계에서 `/se:review` 를 한 번 돌려 쉘 수준 지적만 반영하고 페이지 지적은 4단계 체크리스트로 | 쉘 PR |
| **4 페이지** | 먼저 codemod: `pnpm dlx "github:bbora-min/se-web-toolkit#<태그>&path:packages/codemods" all src/pages/<페이지> --dry` 로 미리 본 뒤 `--dry` 없이(MUI·antd·raw 컨트롤·팔레트 색을 80 % 자동, 못 정한 건 `TODO(se-adopt)`). 그다음 트래픽 많은 페이지부터 하나씩 `se-migrator` 에이전트로 남은 것 치환(DataTable·Dialog·Form·TODO 해소). 전/후 스크린샷 비교. 못 옮기는 건 `// TODO(se-adopt)`. 마지막 커밋에서 2단계 공존 블록·레거시 CSS·미사용 컴포넌트를 지워 CSS 진입 파일을 템플릿과 같은 5줄로. 툴킷이 못 하는 것(컴포넌트 prop 부재 등)은 리포트 "툴킷에 제안할 것" 에 모은다 | 페이지별 PR |
| **5 강제** | `eslint.config.js`에 `{ files: ['src/**/*.{ts,tsx}'], ...se.configs.recommended }`, `lint` 스크립트 `--max-warnings=0`, 옛 UI 라이브러리 제거, `.nvmrc`(22)·`engines`. 이 단계부터 PostToolUse 훅이 저장마다 규칙을 검사한다 | 완료 PR |

## 규칙
- 단계마다 `pnpm typecheck && pnpm lint`(있으면)와 스크린샷으로 "깨진 게 없음"을 확인하고 PR 설명을 쓴다
- Tailwind가 없던 프로젝트: 2단계에서 Tailwind v4를 넣되 기존 CSS는 그대로 둔다(토큰 클래스만 추가로 쓸 수 있게). 기존 클래스 이름과 충돌하면 `@se/tokens/tailwind.css`가 기본 팔레트를 지우므로 옛 `bg-blue-500`류는 4단계에서 토큰으로 바꾼다
- Next.js: `seTokens()` 대신 빌드 스크립트로 `createTheme`→CSS 파일 생성 후 import (P3에서 next 플러그인 예정). 감사 리포트에 표시
- 진행률은 `/se:audit`의 "도입 진행률"(`@se/ui` import 파일 비율)로 본다
