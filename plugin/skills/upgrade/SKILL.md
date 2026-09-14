---
name: upgrade
description: "이 앱의 SE 디자인 시스템(@se/* + 규칙)을 최신 태그로 올린다 — CHANGELOG 의 '앱에서 할 일' → 의존성 갱신 → typecheck·lint → 전/후 스크린샷 diff → 달라진 화면만 리뷰 → PR. '/se:upgrade [버전]'"
argument-hint: "[v0.6.0] 생략하면 최신 태그"
---

# /se:upgrade — 디자인 시스템 업데이트 받기

툴킷이 merge 돼도 앱은 아무것도 안 바뀐다 — 앱은 태그(`github:bbora-min/se-web-toolkit#v0.5.0&path:packages/ui`)에 고정돼 있다. 이 명령이 "받는" 절차다. 사람은 마지막 PR 만 본다.

## 절차
1. **현재 ↔ 목표**: 현재 = `package.json` 의 `@se/ui` 참조에서 `#v…` (없고 `#path:` 만 있으면 "main 추적 중" — 이번에 태그로 고정한다). 목표 = `$ARGUMENTS` 또는 최신 태그:
   `git ls-remote --refs --tags --sort=-v:refname https://github.com/bbora-min/se-web-toolkit "v*" | head -1`
2. **할 일 읽기**: 툴킷 CHANGELOG 에서 현재 초과 ~ 목표 이하 항목의 세 칸을 읽는다:
   `curl -s https://raw.githubusercontent.com/bbora-min/se-web-toolkit/<목표태그>/CHANGELOG.md`
   "앱에서 할 일" 을 목록으로 사용자에게 먼저 보여 준다. major 가 끼어 있으면 여기서 멈추고 확인받는다
3. **기준선 촬영**: `.gitignore` 에 `docs/upgrade/` 가 없으면 추가한다(스크린샷은 커밋하지 않는다). 갱신 전에 `pnpm e2e`(템플릿 앱은 화면마다 light-1440·dark-1440·light-1024 를 찍는다) → `test-results/` 를 `docs/upgrade/before/` 로 복사. e2e 가 없으면 `/se:review` 가 쓰는 방식으로 라우트마다 찍는다
4. **갱신**: `package.json` 의 `@se/ui|tokens|charts|eslint-plugin` 참조를 `github:bbora-min/se-web-toolkit#<목표태그>&path:packages/<pkg>` 로 바꾸고 `pnpm install`. (`pnpm update` 는 태그를 넘어가지 않는다 — 참조 자체를 바꿔야 한다)
5. **기계 검사**: `pnpm typecheck && pnpm lint`. major 의 "앱에서 할 일" 은 여기서 오류로 드러난다 — 하나씩 고치고, 못 고치는 건 `// TODO(se-upgrade)`
6. **전/후 비교**: 다시 `pnpm e2e` → `docs/upgrade/after/`. 같은 이름의 PNG 를 픽셀 비교(간단히는 `cmp`, 있으면 pngdiff)해 **달라진 화면 목록**을 만든다. CHANGELOG "화면 변화" 에 없는 화면이 달라졌으면 회귀 후보로 표시
7. **리뷰**: 달라진 화면만 `/se:review <라우트…>` 로 재채점. 점수가 떨어진 화면은 원인을 CHANGELOG 항목과 대조한다
8. **PR**: 제목 `chore: SE 디자인 시스템 v현재 → v목표`, 본문에 CHANGELOG 의 세 칸 + 달라진 화면의 전/후 이미지 + 점수 변화. `docs/upgrade/` 는 3단계에서 .gitignore 에 넣었으므로 커밋되지 않는다

## 규칙
- 한 번에 한 태그씩 올리지 않아도 된다 — 다만 major 를 건너뛸 땐 각 major 의 "앱에서 할 일" 을 전부 적용한다
- 갱신 후 lint 가 새 규칙으로 실패하면 규칙을 끄지 말고 코드를 고친다. 정말 예외면 `eslint-disable-next-line` 에 이유를 적는다
- 스크린샷이 달라졌는데 CHANGELOG 에 없는 항목이면 툴킷 이슈로 알린다 (툴킷의 CHANGELOG 누락)
- 플러그인(스킬·훅)은 별개 — `claude plugin update se@se-web-toolkit` 을 안내한다. 같은 버전으로 맞추면 규칙과 컴포넌트가 일치한다
