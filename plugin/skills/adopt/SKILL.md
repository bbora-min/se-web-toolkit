---
name: adopt
description: "기존 React 프로젝트(예: 내 todo-web)에 SE 디자인 시스템을 점진 도입한다 — 감사 → 아이덴티티 → 기반 → 쉘 → 페이지 → 강제. 각 단계가 PR 하나, 어디서 멈춰도 동작. '/se:adopt [0-5]'"
argument-hint: "[0-5] 생략하면 현재 단계를 판단"
---

# /se:adopt — 점진 도입 (strangler)

현재 폴더의 프로젝트에 적용한다. `$ARGUMENTS`의 단계만 수행한다. 생략하면 상태를 보고 다음 단계를 제안하고 확인받는다. **한 번에 한 단계, 단계마다 커밋/PR.**

전제: React 18+ · Vite(또는 Next). Node 20.19 미만이면 2단계 전에 Node 업그레이드 PR을 먼저.

| 단계 | 할 일 | 산출물 |
|---|---|---|
| **0 감사** | 스택·Node·패키지 매니저 버전, UI 라이브러리(`@mui` `antd` `chakra` `styled-components` …), 색 인벤토리(`grep -rnE '#[0-9a-f]{3,8}\b\|bg-(red\|blue\|…)-'`), raw `<button>`·`<table>` 수, 페이지/라우트 목록, 주요 화면 스크린샷 | `docs/adopt-report.md` |
| **1 아이덴티티** | 현재 서비스의 개성(주 색·톤)을 **보존**하며 `/se:identity` → `se.identity.json` 생성. 기존 주 색의 hue가 규칙에 걸리면 가장 가까운 통과 hue로 | `se.identity.json` |
| **2 기반** | 설치: `pnpm add github:bbora-min/se-web-toolkit#path:packages/tokens github:bbora-min/se-web-toolkit#path:packages/ui github:bbora-min/se-web-toolkit#path:packages/charts` + `pnpm add -D github:bbora-min/se-web-toolkit#path:packages/eslint-plugin tailwindcss @tailwindcss/vite`. Vite에 `seTokens()`·`tailwindcss()`, 진입점에 `import 'virtual:se-theme.css'`, 앱 CSS에 `@import 'tailwindcss'; @import '@se/tokens/tailwind.css'; @import '@se/ui/styles.css'; @source '../node_modules/@se/ui/src';`, 루트에 `ThemeProvider`·`TooltipProvider`·`Toaster`. 기존 CSS와 충돌하면 토큰 CSS를 `@layer se`로. **시각 변화 0** — 전/후 스크린샷이 같아야 한다 | 기반 PR |
| **3 쉘** | 기존 네비·헤더를 `AppShell`로 교체(로크업·⌘K 팔레트·테마 토글), 시그니처 적용, 페이지는 `PageBody`/`PageHeader`로 감싼다. 페이지 내부는 그대로 | 쉘 PR |
| **4 페이지** | 트래픽 많은 페이지부터 하나씩 `se-migrator` 에이전트로 치환(Button·Input·DataTable·Dialog·토큰 색). 전/후 스크린샷 비교. 못 옮기는 건 `// TODO(se-adopt)` | 페이지별 PR |
| **5 강제** | `eslint.config.js`에 `{ files: ['src/**/*.{ts,tsx}'], ...se.configs.recommended }`, `lint` 스크립트 `--max-warnings=0`, 옛 UI 라이브러리 제거, `.nvmrc`(22)·`engines`. 이 단계부터 PostToolUse 훅이 저장마다 규칙을 검사한다 | 완료 PR |

## 규칙
- 단계마다 `pnpm typecheck && pnpm lint`(있으면)와 스크린샷으로 "깨진 게 없음"을 확인하고 PR 설명을 쓴다
- Tailwind가 없던 프로젝트: 2단계에서 Tailwind v4를 넣되 기존 CSS는 그대로 둔다(토큰 클래스만 추가로 쓸 수 있게). 기존 클래스 이름과 충돌하면 `@se/tokens/tailwind.css`가 기본 팔레트를 지우므로 옛 `bg-blue-500`류는 4단계에서 토큰으로 바꾼다
- Next.js: `seTokens()` 대신 빌드 스크립트로 `createTheme`→CSS 파일 생성 후 import (P3에서 next 플러그인 예정). 감사 리포트에 표시
- 진행률은 `/se:audit`의 "도입 진행률"(`@se/ui` import 파일 비율)로 본다
