---
name: new
description: 새 SE 내부 도구 프로젝트를 만든다 — 어느 폴더에서든. create-se-app(pnpm dlx) 템플릿 생성 → 아이덴티티 인터뷰 → 설치 → 첫 실행. "/se:new <id>"
argument-hint: "<kebab-id> [--name '표시 이름']"
---

# /se:new — 새 서비스

`$ARGUMENTS`의 id로 **현재 폴더 아래**에 프로젝트를 만든다. id가 없으면 먼저 묻는다 (kebab-case, 예: `todo-web`).
사용자가 이미 프로젝트 폴더 안에 있고 그 폴더가 비어 있으면 `--dir .`로 그 자리에 만든다. 기존 코드가 있는 폴더면 `/se:adopt`다.

## 절차
1. **아이덴티티 먼저** — 인터뷰 5문항(서비스가 하는 일 / 주 사용자와 사용 순간 / 분위기 3단어 / 닮으면 안 되는 형제 / 가장 중요한 화면). 답으로 시그니처·톤·밀도·hue 후보 2–3안을 한 줄씩 보여주고 고르게 한다
   - 시그니처: 모니터링 → `status-strip`, 조회·탐색 → `search-hero`, 승인·단계 → `stage-rail` (구현된 셋. `timeline-ribbon`·`metric-marquee`는 예약 — CLI가 거부)
   - 톤: 운영 도구 → `terse`, 탐색 도구 → `friendly`, 승인·규정 → `procedural`
   - hue: 의미 색(30·70·155·260°)과 18° 이상. 형제(팀의 다른 서비스)를 사용자가 말해주면 그 hue와 30° 이상. 모르면 CLI가 가장 먼 값을 고른다
2. **생성** — 어디서든 한 줄:
   ```
   pnpm dlx "github:bbora-min/se-web-toolkit#path:packages/create-se-app" <id> --name "…" --hue … --signature … --tone … --density … --subtitle "…" [--dir .]
   ```
   (툴킷 모노레포 안이라면 `node packages/create-se-app/bin/create-se-app.mjs …` — `examples/<id>`에 생기고 레지스트리에 등록된다.)
   `@se/*`는 git에서 설치된다(`github:bbora-min/se-web-toolkit#path:packages/*`) — 첫 설치 1–2분. pnpm이 없으면 `corepack enable pnpm`
3. `cd <dir>` → `pnpm install` → `pnpm typecheck && pnpm lint` → `pnpm dev`. 사용자에게 URL을 준다. 이 프로젝트에서 새 Claude 세션을 열면 SessionStart 훅이 아이덴티티를 알려준다
4. `docs/spec.md`가 비어 있음을 알리고 `/se:spec`으로 이어간다. 첫 화면(`/items`)은 출발점일 뿐이라 실제 도메인으로 바꿔야 한다고 말한다

## 하지 않는 것
- 템플릿을 손으로 복사하지 않는다 (CLI가 이름·포트·아이덴티티 편집과 검증을 한다)
- hue를 감으로 고르지 않는다 — 규칙 위반이면 CLI가 거부한다
- Node 22 미만이면 진행하지 않는다 — `nvm use 22` 또는 툴킷의 `scripts/setup.sh`
