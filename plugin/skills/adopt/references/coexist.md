# 2단계 "시각 변화 0" 공존 레시피 — Tailwind v3 + 레거시 CSS 프로젝트

ai_voc(React 18 · Vite 5 · Tailwind 3.4 · M3 커스텀 토큰 47개 · styles.css 607줄)에 실제로 적용해 8개 화면 픽셀 diff 가 노이즈 바닥과 같았던 순서. 4단계에서 전부 지운다 — 모두 `TODO(se-adopt)` 를 단다.

## 0. 설치 전
- **패키지 매니저**: `@se/*` 는 git 서브디렉터리 의존성(`github:…#path:`)이라 **pnpm 만** 된다. npm 프로젝트는 `pnpm import`(lockfile 변환) 후 `pnpm install`. 감사 리포트에 "npm → pnpm 전환" 을 2단계 항목으로 적는다
- **React 18 은 그대로 둔다**(peer `^18.2 || ^19`). Vite 5 도 된다. 19 업그레이드는 별도 PR 로, 필요할 때만
- **tsconfig**: `@se/ui` 는 TS 소스로 배포되어 앱의 tsconfig 로 검사된다. 툴킷은 `noUnusedLocals/Parameters` 를 켜고 검증하므로 그 둘은 켜도 된다. 그 밖의 비표준 옵션(`exactOptionalPropertyTypes` 등)이 있으면 먼저 꺼 보고 원인을 좁힌다
- **Tailwind 3 → 4**: `npx @tailwindcss/upgrade` 코드모드 → `tailwind.config.js` 가 `@theme` 로, postcss 제거, `@tailwindcss/vite` 추가. 클래스 등가 치환(`shadow-sm→shadow-xs` 등)은 코드모드가 한다

## 1. 앱 CSS 진입 파일 (순서가 중요)
```css
@import 'tailwindcss';
@import '@se/tokens/tailwind.css';      /* --color-*: initial 로 기본 팔레트를 지운다 */
@import 'tailwindcss/theme.css' layer(theme); /* TODO(se-adopt) 기본 팔레트 복원 — 옛 bg-blue-600 이 살아야 한다 */
@import '@se/ui/styles.css';
@source '../node_modules/@se/ui/src';
@source '../node_modules/@se/charts/src';

/* TODO(se-adopt) theme.css 는 @theme default 라 SE 가 먼저 정의한 키(--text-sm 13px, --shadow-sm …)는 되돌리지 못한다.
   v3 값과 v3 hex 팔레트(v4 는 oklch 라 green-500 등이 미세하게 다름)를 명시 */
@theme {
  --text-sm: 0.875rem; --text-sm--line-height: 1.25rem;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --color-green-500: #22c55e; /* … 실제로 쓰는 것만 */
}

/* TODO(se-adopt) @se/ui/styles.css 의 html { font-size:14px; line-height:1.6; font-feature-settings; background } 상쇄 */
@layer base {
  html { font-size: 16px; line-height: 1.5; font-feature-settings: normal; background: white; color: inherit }
  code, pre, .font-mono { font-family: ui-monospace, monospace }
}

/* TODO(se-adopt) 레거시 CSS 는 통째로 utilities 레이어에 — v4 는 유틸리티가 레이어 안이라
   레이어 밖 a{color} button{} 이 text-blue-600 을 이겨 버린다. v3 와 같은 우선순위로 복원 */
@layer utilities {
  /* …기존 styles.css 내용… */
}
```
주의: CSS 주석 안에 `--text-*/--shadow-*` 처럼 `*/` 가 들어가면 주석이 조기 종료돼 뒤 블록이 통째로 깨진다.

## 2. 다크 모드
`virtual:se-theme.css` 는 시스템 다크 사용자에게 `color-scheme: dark` 를 준다. 도입 기간엔 라이트 고정:
```css
/* TODO(se-adopt) 3단계 테마 토글 도입 시 제거 */
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { color-scheme: light } }
```

## 3. 이름 충돌
기존 커스텀 토큰이 SE 토큰과 이름이 겹치면(M3 의 `--color-surface`, `--color-primary`…) 본문 배경·글자가 SE 값으로 바뀌지 않거나 반대로 테마를 안 따른다. 겹치는 키는 2단계에서 `--legacy-surface` 처럼 개명하거나 3단계에서 제거한다. `body { color }` 같은 전역 글자색도 3단계에서 지운다 — SE 잉크 토큰이 결정해야 다크에서 읽힌다.

## 4. 검증 — 픽셀 diff
이전 커밋을 `git worktree add ../before <sha>` 로 다른 포트에 띄우고 같은 스크립트로 두 번 찍어 픽셀 차이를 센다. "before vs before" 를 한 번 더 찍어 **노이즈 바닥**(애니메이션·펄스 점·차트 시작각)을 알아 두고, after 차이가 그 바닥과 같은 좌표·크기면 통과. 요소별 computed style 비교 스크립트가 있으면 원인 추적이 빠르다.

## 5. 모노 구조(frontend/ 하위)
플러그인 훅은 리포 루트와 한 단계 아래 폴더의 package.json 에서 `@se/ui` 를 찾는다. 더 깊으면 `cd frontend && claude` 로 연다.
