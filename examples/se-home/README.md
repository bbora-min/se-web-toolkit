# SE Home

SE Web Toolkit으로 만든 내부 도구. 아이덴티티: `se.identity.json` (`timeline-ribbon` · hue 350°).

```bash
pnpm install
pnpm dev          # http://localhost:5177  (백엔드 없이 MSW 목으로 동작)
pnpm typecheck && pnpm lint
pnpm e2e:visual          # 스크린샷 (e2e/visual.spec.ts 의 화면 목록)
```

- `/` — 홈(허브 골격): 인사·상태 한 줄 → 검색(⌘K) → 가족의 24시간 리본 → 서비스 카드 → 최근 본 것 · 오늘
- `/services` — 서비스 표(목록 골격): 아이덴티티와 상태를 나란히
- `/__identity` — 아이덴티티 시트
- `?__state=empty|error|slow` — 3상태 강제
- 실제 백엔드: `.env`에 `VITE_API_BASE=https://…` 설정하면 목이 꺼진다
