# SE App

SE Web Toolkit(`@se/ui`·`@se/tokens`·`@se/charts`)으로 만든 내부 도구. 아이덴티티는 `se.identity.json`.

- 화면을 만들거나 고칠 때: `se-design` 스킬로 디자인 플랜을 먼저 쓰고 `se-ui` 스킬의 패턴 원본을 복사해 변형한다.
- 새 화면: `/se:page <이름>`. 요구사항이 문장뿐이면 먼저 `/se:spec`.
- 색은 토큰 클래스만, 폼 컨트롤·표는 `@se/ui`만. `pnpm lint`가 막는다.
- 백엔드가 없어도 된다 — MSW 목(`src/mocks/`)이 `/api`를 응답한다. `?__state=empty|error|slow`로 3상태 확인.
- 검증: `pnpm typecheck && pnpm lint`, 화면은 스크린샷(`pnpm e2e`)으로.
