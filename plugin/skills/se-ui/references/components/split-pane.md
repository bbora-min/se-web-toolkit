# SplitPane

`import { SplitPane } from '@se/ui'` — 패턴 · `packages/ui/src/patterns/split-pane.tsx`

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `collapseRightNarrow` | `boolean` | `true` | 1280 미만에서 오른쪽 칸을 숨긴다(기본 true) — 가운데가 먼저다 |
| `left` | `ReactNode` |  | 왼쪽 칸(목록·패싯). 없으면 2단 |
| `leftWidth` | `number` | `320` |  |
| `minCenter` | `number` | `360` | 가운데 칸의 최소 폭 — 손잡이가 이보다 좁게 만들지 않는다 |
| `minLeft` | `number` | `220` |  |
| `minRight` | `number` | `200` |  |
| `right` | `ReactNode` |  | 오른쪽 칸(속성·미리보기). 없으면 2단 |
| `rightWidth` | `number` | `280` |  |
| `storageKey` | `string` |  | 폭을 기억할 키(localStorage). 없으면 기억하지 않는다 |
