---
name: adopt
description: 기존 React 프로젝트에 디자인 시스템을 점진 도입한다 — 감사 → 아이덴티티 → 기반 → 쉘 → 페이지 → 강제. 각 단계가 PR 하나, 어디서 멈춰도 동작. "/se:adopt [0-5]"
argument-hint: "[0-5] 생략하면 현재 단계를 판단"
---

# /se:adopt — 점진 도입 (strangler)

`$ARGUMENTS`의 단계만 수행한다. 생략하면 프로젝트 상태를 보고 다음 단계를 제안하고 확인받는다. **한 번에 한 단계.**

| 단계 | 할 일 | 산출물 |
|---|---|---|
| **0 감사** | 스택·Node·패키지 매니저 버전, UI 라이브러리, 색/컴포넌트 인벤토리(`grep`으로 hex·라이브러리 import 수), 페이지 목록, 주요 화면 스크린샷 | `docs/adopt-report.md` |
| **1 아이덴티티** | 현재 서비스의 개성(주 색·톤)을 **보존**하며 `/se:identity`. 형제와 충돌할 때만 조정 | `se.identity.json` |
| **2 기반** | Node < 20.19면 **먼저 Node 업그레이드 PR**(`.nvmrc`·`engines`·CI·Dockerfile). 그다음 `@se/tokens`·`@se/ui`·`@se/eslint-plugin` 설치, Vite에 `seTokens()`, CSS에 `@import '@se/tokens/tailwind.css'`·`@se/ui/styles.css`, `ThemeProvider`. 기존 CSS와 공존 — 시각 변화 0 | 기반 PR |
| **3 쉘** | 기존 네비·헤더를 `AppShell`로 교체, 시그니처 적용. 페이지 내부는 그대로 | 쉘 PR |
| **4 페이지** | 트래픽 많은 페이지부터 하나씩 `se-migrator` 에이전트로 치환. 전/후 스크린샷 비교 | 페이지별 PR |
| **5 강제** | `eslint.config.js`에 `se.configs.recommended`, `--max-warnings=0`, 옛 UI 라이브러리 제거, Node 22 통일 | 완료 PR |

## 규칙
- 단계마다 `pnpm typecheck && pnpm lint`(있으면)와 스크린샷으로 "깨진 게 없음"을 확인하고 나서 PR 설명을 쓴다
- 2단계에서 기존 CSS와 충돌하면 토큰 CSS를 `@layer se`로 감싸 우선순위를 낮춘다
- 4단계에서 못 옮기는 것은 `// TODO(se-adopt)`로 남기고 보고한다 — 억지로 맞추지 않는다
- 진행률은 `/se:audit`의 "도입 진행률"로 본다
