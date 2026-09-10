---
name: new
description: 새 SE 내부 도구 프로젝트를 만든다 — create-se-app 템플릿 생성 → 아이덴티티 인터뷰 → 설치 → 첫 실행. "/se:new <id>"
argument-hint: <kebab-id> [--name "표시 이름"]
---

# /se:new — 새 서비스

`$ARGUMENTS`의 id로 프로젝트를 만든다. id가 없으면 먼저 묻는다 (kebab-case, 예: `incident-desk`).

## 절차
1. **아이덴티티 먼저** — `/se:identity`의 인터뷰 5문항을 여기서 한다 (서비스가 하는 일 / 주 사용자와 사용 순간 / 분위기 3단어 / 닮으면 안 되는 형제 / 가장 중요한 화면). 답으로 시그니처·톤·밀도·hue 후보 2–3안을 만들어 한 줄씩 보여주고 고르게 한다.
   - 시그니처: 모니터링 → `status-strip`, 조회·탐색 → `search-hero`, 승인·단계 → `stage-rail` (지금 구현된 셋. `timeline-ribbon`·`metric-marquee`는 예약만 — CLI가 거부한다)
   - 톤: 운영 도구 → `terse`, 탐색 도구 → `friendly`, 승인·규정 → `procedural`
   - hue: 의미 색(30·70·155·260°)과 18°, 형제와 30° 이상. 툴킷 모노레포 안이면 `identities/registry.json`을 읽어 피한다. 모르면 CLI가 고른다
2. 생성: `node packages/create-se-app/bin/create-se-app.mjs <id> --name … --hue … --signature … --tone … --density … --subtitle …` (툴킷 모노레포의 `examples/<id>`에 만들어진다. `@se/*`가 npm에 배포되기 전까지는 모노레포 밖 생성은 설치가 안 된다). 출력의 경로·포트를 기억한다
3. 모노레포 루트에서 `pnpm install`(워크스페이스 링크) → `pnpm --filter <id> typecheck && pnpm --filter <id> lint` → `pnpm --filter <id> dev`. 브라우저 확인은 사용자에게 URL을 준다
4. `docs/spec.md`가 비어 있음을 알리고 `/se:spec`으로 이어간다. 첫 화면(`/items`)은 출발점일 뿐이라 실제 도메인으로 바꿔야 한다고 말한다

## 하지 않는 것
- 템플릿을 손으로 복사하지 않는다 (CLI가 플레이스홀더·레지스트리·검증을 한다)
- hue를 감으로 고르지 않는다 — 규칙 위반이면 CLI가 거부한다
