---
name: audit
description: 프로젝트가 디자인 시스템을 얼마나 따르는지 리포트 — 린트 위반, 하드코딩 색·컨트롤, 3상태 누락, 아이덴티티 검증, 패키지 버전, 화면별 점수. "/se:audit"
---

# /se:audit — 준수율 리포트

숫자로 말한다. `docs/audit.md`를 만든다(있으면 갱신해 추이가 보이게).

## 절차
1. **환경**: `node -v`(22.x인가), `@se/ui`·`@se/tokens` 버전, `se.identity.json` 유효성(`createTheme`으로 파싱), 레지스트리 등록 여부
2. **규칙**: `npx eslint . -f json`으로 규칙별 위반 수. `se/no-raw-color`·`no-raw-control`·`import-from-ui` 위반이 0이 아니면 파일 목록
3. **인벤토리**: `src/pages/**` 화면 수, 각 화면의 패턴(주석의 "패턴" 단어로), `DataTable` 3상태 유무, 시그니처 사용 여부, `e2e/screens.spec.ts` 등록 여부
4. **디자인 점수**: `docs/design-review.md`의 최근 점수. 없으면 "미평가" — `/se:review`를 권한다
5. 리포트: 표 3개(환경·규칙·화면) + 한 줄 요약("규칙 위반 0 · 화면 4개 중 3상태 없는 것 1 · 디자인 74/80") + 다음 행동 3개

## 도입 진행률 (기존 프로젝트일 때)
`@se/ui` import 비율 = `@se/ui`에서 import하는 파일 / 전체 tsx 파일. 옛 UI 라이브러리(`@mui`, `antd`, `styled-components`) import가 남은 파일 목록. `/se:adopt` 단계 표시
