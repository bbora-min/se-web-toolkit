# BarChart

`import { BarChart } from '@se/charts'` — 차트 · `packages/charts/src/bar-chart.tsx`

막대. 얇게, 위쪽 모서리만 둥글게, 막대 사이 표면 간격.
축선 없음, 가로 격자만 점선. 시리즈가 2개 이상이면 ChartCard에 legend를 넘긴다.

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `data` **필수** | `T[]` |  |  |
| `series` **필수** | `Series[]` |  |  |
| `xKey` **필수** | `string` |  |  |
| `height` | `number` | `220` |  |
| `stacked` | `boolean` |  |  |
| `tooltipLabel` | `((v: unknown) => ReactNode)` |  |  |
| `tooltipValue` | `((v: number, key: string) => ReactNode)` |  |  |
| `xFormat` | `((v: unknown) => string)` |  |  |
| `xInterval` | `number` |  | x축 눈금 간격 (예: 24포인트에 4면 6개만) |
| `yFormat` | `((v: number) => string)` |  |  |
