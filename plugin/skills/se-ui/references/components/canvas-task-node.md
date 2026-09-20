# TaskNode

`import { TaskNode } from '@se/canvas'` — 캔버스 · `packages/canvas/src/task-node.tsx`

태스크 노드 — 카드 한 장. 이름(mono) · 상태 배지 · 메타 한 줄. 상태가 테두리 색이 된다(Airflow 관례).
선택은 액센트 링. 핸들은 좌(입력)·우(출력).

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `data` **필수** | `Record<string, unknown> & TaskNodeData` |  | Arbitrary data passed to a node. |
| `id` **필수** | `string` |  | Unique id of a node. |
| `isConnectable` **필수** | `boolean` |  | Whether a node is connectable or not. |
| `positionAbsoluteX` **필수** | `number` |  | Position absolute x value. |
| `positionAbsoluteY` **필수** | `number` |  | Position absolute y value. |
| `deletable` | `boolean` |  |  |
| `draggable` | `boolean` |  | Whether or not the node is able to be dragged. |
| `dragging` | `boolean` |  | Whether or not the node is currently being dragged. |
| `dragHandle` | `string` |  | A class name that can be applied to elements inside the node that allows those elements to act as drag handles, letting the user drag the node by clicking and dragging on those elements. |
| `height` | `number` |  |  |
| `parentId` | `string` |  | Parent node id, used for creating sub-flows. |
| `selectable` | `boolean` |  |  |
| `selected` | `boolean` |  |  |
| `sourcePosition` | `enum` |  | Only relevant for default, source, target nodeType. Controls source position. @example 'right', 'left', 'top', 'bottom' |
| `targetPosition` | `enum` |  | Only relevant for default, source, target nodeType. Controls target position. @example 'right', 'left', 'top', 'bottom' |
| `type` | `string` |  | Type of node defined in nodeTypes |
| `width` | `number` |  |  |
| `zIndex` | `number` |  |  |
