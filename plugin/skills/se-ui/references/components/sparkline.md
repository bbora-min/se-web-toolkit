# Sparkline

`import { Sparkline } from '@se/ui'` — 컴포넌트 · `packages/ui/src/components/sparkline.tsx`

스파크라인. 선 2px, 회색(de-emphasis) + 마지막 구간 액센트, 끝점 강조.
축·격자 없음 — 방향만 읽는 그림이다. 호버하면 값을 보여준다.

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `data` **필수** | `number[]` |  |  |
| `className` | `string` |  |  |
| `emphasizeLast` | `boolean` | `true` | 마지막 구간을 액센트로 강조 (현재 기간) |
| `format` | `((v: number) => string)` |  | 값 포맷 (호버 라벨) |
| `height` | `number` | `28` |  |
| `width` | `number` | `96` |  |
