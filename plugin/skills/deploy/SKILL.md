---
name: deploy
description: 배포 준비 — Dockerfile·nginx(SPA fallback·/api 프록시)·CI 점검, 환경 변수 체크리스트, 프로덕션 빌드 확인. "/se:deploy"
---

# /se:deploy — 배포 준비

템플릿에 `Dockerfile`·`nginx.conf`·`.github/workflows/ci.yml`이 있다. 없으면 템플릿 것을 가져온다.

## 절차
1. `pnpm build` — 통과해야 시작. `dist/` 크기와 가장 큰 청크를 보고한다(500KB 넘으면 코드 스플릿 제안)
2. `nginx.conf`의 `proxy_pass` 대상을 실제 백엔드 주소로 — 사용자에게 묻는다. SPA fallback(`try_files … /index.html`)이 있는지 확인
3. 환경 변수 체크리스트: `VITE_API_BASE`(빌드 시점에 박힌다 — 런타임 주입이 필요하면 `window.__ENV__` 방식 제안), 인증 헤더, 프록시 뒤 `X-Forwarded-*`
4. CI: `.nvmrc`의 Node로 `typecheck → lint → build`. 배포 잡은 팀 인프라에 따라(사용자에게 묻는다) — 컨테이너 레지스트리 푸시 또는 정적 호스팅
5. `docker build -t <id> .` 한 번 (Docker가 있으면). 없으면 Dockerfile을 읽고 검토만
6. 보고: 빌드 결과, 바꿔야 할 값 목록, 배포 명령

## 판단 기준
- MSW는 프로덕션 빌드에 들어가지 않는다(`import.meta.env.DEV` 가드) — 확인
- `/__identity` 라우트도 DEV 전용 — 확인
