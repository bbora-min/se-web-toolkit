# CHANGELOG

툴킷(패키지 `@se/*` + 플러그인)은 **한 버전**으로 움직인다. 항목마다 세 칸: **바뀐 것** / **화면 변화**(코드는 그대로인데 보이는 게 달라지는 것) / **앱에서 할 일**(코드를 고쳐야 하는 것). 앱 담당자는 세 번째 칸만 읽어도 된다.
버전 의미: patch = 화면 변화 없음 · minor = 추가 또는 화면 변화, 코드 수정 불필요 · major = 앱 코드를 고쳐야 함. 깨지는 변경은 한 minor 동안 옛 방식을 남기고 경고한다.

## 0.5.0 — 2026-09-14

**바뀐 것**
- 운영 규칙 도입: 버전 한 값(루트 package.json 기준, `pnpm release:bump`), CHANGELOG, merge 시 태그 `v<버전>` 자동, CI `check:release`
- `create-se-app` 이 만드는 앱은 `@se/*` 를 자기 버전 태그(`github:…#v0.5.0&path:…`)에 고정한다 — 툴킷이 바뀌어도 앱은 `/se:upgrade` 전까지 그대로
- `/se:upgrade` 스킬: CHANGELOG 의 "앱에서 할 일" → 의존성 갱신 → typecheck·lint → 전/후 스크린샷 diff → 달라진 화면만 `/se:review`
- `/se:audit` 가 앱 버전과 최신 태그를 비교해 밀린 변경을 보여준다
- 0.4.x 에서 들어온 것(참고): DataTable 비율 폭·`text-on-*` 토큰·경고색 `#9A6700`·`hasForcedState`(0.3.0), React 18·Vite 5 peer·MeterList chart 톤·LineChart 목표선·StatusStrip compact 보더·AppShell `credit`·adopt 공존 레시피·레지스트리 동봉(0.4.0), danger 규칙(0.4.1)

**화면 변화**
- 없음 (0.5.0 자체는 규칙·도구만)

**앱에서 할 일**
- 없음. 기존 앱(main 을 가리키는 `#path:` 의존성)은 다음 `/se:upgrade` 때 태그 고정으로 바뀐다

## 0.1.0 — 2026-09-10

최초 릴리스. `@se/tokens`(createTheme·OKLCH·대비 규칙) · `@se/ui` 50 컴포넌트 · `@se/charts` · `@se/eslint-plugin` 5 규칙 · 레퍼런스 앱 3 · 템플릿 · 플러그인(스킬 11·에이전트 3·훅 2).
