# LineChart

`import { LineChart } from '@se/charts'` — 차트 · `packages/charts/src/line-chart.tsx`

선 2px, 점 없음(호버 시만), 크로스헤어 툴팁

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `data` **필수** | `T[]` |  |  |
| `series` **필수** | `Series[]` |  |  |
| `xKey` **필수** | `string` |  |  |
| `height` | `number` | `220` |  |
| `tooltipLabel` | `((v: unknown) => ReactNode)` |  |  |
| `tooltipValue` | `((v: number, key: string) => ReactNode)` |  |  |
| `xFormat` | `((v: unknown) => string)` |  |  |
| `xInterval` | `number` |  |  |
| `yFormat` | `((v: number) => string)` |  |  |
