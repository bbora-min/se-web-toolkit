---
name: api
description: 실제 백엔드에 연결한다 — OpenAPI 스펙이나 기존 코드에서 타입 클라이언트·useQuery 훅을 만들고 MSW 목을 실제 응답 형태에 맞춘다. "/se:api <openapi.yaml 경로 또는 API 설명>"
argument-hint: "<openapi.yaml | 엔드포인트 설명>"
---

# /se:api — 백엔드 연결

백엔드는 팀마다 다르다(비표준). 접점은 `src/api/`뿐이고 화면은 훅만 쓴다 — 이 경계를 지킨다.

## 절차
1. 입력을 파악한다: OpenAPI(yaml/json) 경로 → `openapi-typescript`로 `src/api/schema.d.ts` 생성(`npx openapi-typescript <spec> -o src/api/schema.d.ts`). 스펙이 없으면 엔드포인트 설명에서 타입을 손으로 쓴다
2. `src/api/client.ts`는 그대로 쓴다 (`VITE_API_BASE` + `ApiError`). 인증 헤더가 필요하면 여기 한 곳에만 추가
3. 도메인별 훅 파일(`src/api/<domain>.ts`)의 경로·파라미터·응답 타입을 실제 API에 맞춘다. 목록은 `{ items, total, counts }` 형태를 유지하는 어댑터를 둔다 — 화면이 그 형태를 기대한다
4. **MSW 목을 실제 응답 형태로 맞춘다** — 목은 없애지 않는다. 백엔드가 죽어도 UI 개발이 계속되고, `?__state=`가 리뷰에 필요하다
5. `.env.example`에 `VITE_API_BASE` 설명, README에 연결 방법
6. `pnpm typecheck` → 실제 백엔드로 `pnpm dev` 한 번 (사용자에게 `.env` 값을 물어본다) → 목록·상세·액션 각 1회 확인

## 판단 기준
- 응답을 화면 형태로 바꾸는 코드는 훅 안에서 — 컴포넌트에 `data.results.map(...)` 같은 백엔드 어휘가 새지 않게
- 에러 메시지는 서버 것을 그대로 (`ApiError.message`) — 화면의 에러 상태가 "원인"을 보여줄 수 있어야 한다
