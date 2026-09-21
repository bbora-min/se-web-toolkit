# ChartLegend · ChartCard

`import { ChartLegend, ChartCard } from '@se/charts'` — 차트 · `packages/charts/src/chart-card.tsx`

## ChartLegend

범례 — 시리즈 색 점 + 라벨. ChartCard 가 쓰고, 대시보드의 `Tile legend=` 에도 그대로 넘긴다

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `series` **필수** | `Series[]` |  |  |
| `className` | `string` |  |  |

## ChartCard

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `title` **필수** | `string` |  |  |
| `actions` | `ReactNode` |  |  |
| `className` | `string` |  |  |
| `description` | `string` |  | 무엇을 어떻게 읽는지 한 줄 |
| `legend` | `Series[]` |  | 2개 이상 시리즈면 항상 범례 |
