# TileGrid · Tile

`import { TileGrid, Tile } from '@se/ui'` — 패턴 · `packages/ui/src/patterns/tile-grid.tsx`

## TileGrid

12칸 격자. 자식은 `Tile`(또는 span 을 스스로 정한 블록)

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `gap` | `number` | `12` | 격자 간격(px). 벽은 촘촘하게 — 기본 12 |

## Tile

벽의 타일 한 장. 본문은 `flex-1 min-h-0` — 차트 높이는 자식이 정한다

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `title` **필수** | `string` |  |  |
| `actions` | `ReactNode` |  | 우측 액션 — 링크 하나가 보통 |
| `legend` | `ReactNode` |  | 우측 범례 — @se /charts 의 `ChartLegend` 를 넘긴다 |
| `note` | `string` |  | 무엇을 어떻게 읽는지 한 줄 — 없어도 된다(벽은 제목이 짧다) |
| `span` | `number` | `12` | 12칸 중 몇 칸. 기본 12 |
| `spanNarrow` | `number` |  | 1024 이하에서의 칸 수. 기본: span ≥ 6 → 12, 아니면 6 |
| `tone` | `enum` | `default` | 값이 임계를 넘었을 때 — 헤더 제목 옆 점 |
