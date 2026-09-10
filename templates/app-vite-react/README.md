# SE App

SE Web Toolkit으로 만든 내부 도구. 아이덴티티: `se.identity.json` (`status-strip` · hue 205°).

```bash
pnpm install
pnpm dev          # http://localhost:5170  (백엔드 없이 MSW 목으로 동작)
pnpm typecheck && pnpm lint
pnpm e2e          # 스크린샷 (e2e/screens.spec.ts 의 화면 목록)
```

- `/items` — 출발점 화면(ListDetail). `/se:spec` → `/se:page` 로 실제 화면을 만든다
- `/__identity` — 아이덴티티 시트
- `?__state=empty|error|slow` — 3상태 강제
- 실제 백엔드: `.env`에 `VITE_API_BASE=https://…` 설정하면 목이 꺼진다
