# Canvas · TaskNode · LayoutNode

`import { Canvas, TaskNode, LayoutNode } from '@se/canvas'` — 캔버스 · `packages/canvas/src/index.ts`

## Canvas

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

## TaskNode

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

## LayoutNode

DAG 자동 배치 — dagre 없이. 노드를 "가장 긴 상류 경로" 기준으로 층(level)에 놓고, 층 안에서는 입력 순서대로 세로로.
파이프라인·의존 그래프처럼 노드가 수십 개인 내부 도구엔 이것으로 충분하다. 수백 개면 dagre·elk 를 붙인다.

_props 없음 (HTML 속성 그대로)_
