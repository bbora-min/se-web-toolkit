# Canvas

`import { Canvas } from '@se/canvas'` — 캔버스 · `packages/canvas/src/canvas.tsx`

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `edges` **필수** | `CanvasEdge[]` |  |  |
| `nodes` **필수** | `CanvasNode[]` |  |  |
| `className` | `string` |  |  |
| `direction` | `enum` |  | 층 방향 — 왼쪽→오른쪽(기본) 또는 위→아래 |
| `minimap` | `boolean` |  | 미니맵 — 노드가 20개 넘으면 켠다 |
| `onSelect` | `((id: string \| null) => void)` |  |  |
| `overlay` | `ReactNode` |  | 우상단 떠 있는 요소(범례·필터) |
| `selectedId` | `string \| null` |  |  |
