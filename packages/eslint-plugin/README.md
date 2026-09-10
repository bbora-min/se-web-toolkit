# @se/eslint-plugin

SE 디자인 시스템 규칙. 설계 문서의 원칙 — **"규칙은 문서가 아니라 린터가 지킨다"**.

```js
// eslint.config.js
import se from '@se/eslint-plugin'
export default [{ files: ['src/**/*.{ts,tsx}'], ...se.configs.recommended }]
```

| 규칙 | 수준 | 내용 |
|---|---|---|
| `se/no-raw-color` | error | hex·rgb·oklch·Tailwind 기본 팔레트·임의값 색 금지 → 토큰 클래스만 |
| `se/no-raw-control` | error | `<button> <input> <select> <textarea> <table>` 직접 사용 금지 → `@se/ui` (`type="hidden"`·`file`은 허용) |
| `se/import-from-ui` | error | `@radix-ui/*`, `cmdk`, `sonner`, `recharts`, `@tanstack/react-table` 직접 import 금지 |
| `se/single-accent` | warn | 한 파일에 `variant="primary"` Button은 하나 |
| `se/page-states` | warn | `DataTable`에 `loading`·`error`·`empty` 세 상태 필수 |

`packages/ui` 안에서는 쓰지 않는다 — raw 컨트롤이 사는 곳이다. 앱 코드(`examples/`, `templates/`, 각 서비스 저장소)에만 적용한다.
Claude Code 플러그인의 PostToolUse 훅이 파일 저장 시 이 규칙을 돌려 위반을 즉시 되돌려준다.
