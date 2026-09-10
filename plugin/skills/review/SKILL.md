---
name: review
description: 화면을 스크린샷으로 찍고 se-design-critic(디자인)·se-reviewer(코드)로 검토해 수정 목록을 만들고 반영한다. "/se:review [라우트…]"
argument-hint: "[라우트 …] 생략하면 e2e/screens.spec.ts 목록"
---

# /se:review — 시각·코드 리뷰 루프

"틀리지 않음"(린트)과 "잘 만듦"(디자인)은 다르다. 이 명령은 후자를 본다.

## 절차
1. dev 서버가 떠 있는지 확인(없으면 `pnpm dev` 백그라운드). 워크스페이스 패키지 export가 바뀐 직후라면 재시작
2. 스크린샷: `pnpm e2e`(`e2e/screens.spec.ts`의 목록 × light-1440·dark-1440·light-1024) 또는 `$ARGUMENTS`의 라우트를 Playwright로. 산출물 경로를 모은다
3. **`se-design-critic` 에이전트**에 스크린샷 경로·페이지 소스·`se.identity.json`을 넘긴다 → 채점표(80점)·결함·판단 목록
4. **`se-reviewer` 에이전트**에 변경 파일을 넘긴다 → 규칙·동작 지적
5. 두 목록을 합쳐 심각도 순으로 정리해 사용자에게 보여준다 (결함은 바로 고치겠다고, 판단은 선택하게)
6. 결함을 고친다 → `pnpm typecheck && pnpm lint` → 스크린샷 1회 재촬영 → 점수 변화 보고
7. `docs/design-review.md`에 날짜·점수·반영 내역을 덧붙인다

## 판단 기준
- 70/80 미만이면 "출시 가능"이라 하지 않는다
- 비평가의 "판단" 항목을 전부 반영하지 않는다 — 사용자가 고른 것만
- 같은 결함이 두 번 나오면 `se-design` 스킬 7절(실제로 겪은 결함)에 추가하자고 제안한다
