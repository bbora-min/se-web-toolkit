---
name: page
description: docs/spec.md의 화면 하나를 코드로 만든다 — 디자인 플랜 → 패턴 원본 복사·변형 → MSW 목 → 3상태 → 라우트·네비·팔레트 등록 → lint/typecheck → 스크린샷 1회. "/se:page <화면 이름>"
argument-hint: "<화면 이름>"
---

# /se:page — 화면 하나

`$ARGUMENTS`에 해당하는 `docs/spec.md` 블록을 읽는다. 없으면 `/se:spec`부터.

## 절차 (순서 고정)
1. **디자인 플랜** — `se-design` 스킬 1절의 10줄을 먼저 쓴다. 파일 상단 주석이 된다
2. **패턴 원본을 연다** — `se-ui` 스킬의 선택표에서 원본 파일(`examples/…`)을 읽는다. 툴킷 모노레포 밖이면 `references/patterns/<pattern>.md`의 골격을 쓴다
3. **데이터 층**: `src/api/types.ts`에 타입, `src/api/<domain>.ts`에 `useQuery` 훅(필터·page·sort는 URL 파라미터 그대로), `src/mocks/handlers.ts`에 목 핸들러(`?__state=empty|error|slow` 지원, 서버 페이지네이션·counts)
4. **화면**: `src/pages/<domain>/<Name>Page.tsx`. 원본을 복사해 컬럼·필터·액션만 바꾼다. 골격(제목 → 시그니처 → 탭 → 필터 → 표 → 상세)은 유지. 시그니처는 `se.identity.json`의 것
5. **등록**: `App.tsx` Route, `Shell.tsx` NAV와 커맨드 팔레트 그룹, `e2e/screens.spec.ts` 화면 목록(기본·empty·error)
6. `pnpm typecheck && pnpm lint` — 통과할 때까지
7. **스크린샷 1회**: `pnpm e2e` 또는 Playwright로 1440·1024, 라이트·다크, empty·error를 찍고 `se-design` 6절 루브릭으로 스스로 채점. 7점 미만 항목은 고치고 다시 찍는다
8. 결과 보고: 라우트, 스크린샷 경로, 3상태 확인 URL, 남은 TODO

## 하지 않는 것
- 새 컴포넌트를 만들지 않는다 — `references/INDEX.md`에 있는지 먼저 본다. 정말 없으면 페이지 안 로컬 컴포넌트로 두고 보고한다(2개 서비스에서 반복되면 승격)
- 색·컨트롤을 직접 쓰지 않는다 — 린터가 막는다
- 3상태 없이 끝내지 않는다
