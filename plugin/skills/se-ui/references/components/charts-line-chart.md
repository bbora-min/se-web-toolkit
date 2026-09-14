# LineChart

`import { LineChart } from '@se/charts'` — 차트 · `packages/charts/src/line-chart.tsx`

선 2px, 점 없음(호버 시만), 크로스헤어 툴팁

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `data` **필수** | `T[]` |  |  |
| `series` **필수** | `Series[]` |  |  |
| `xKey` **필수** | `string` |  |  |
| `height` | `number` | `220` |  |
| `referenceLines` | `{ y: number; label?: string; color?: SeriesColor; }[] \| undefined` |  | 목표선·임계선 — y 값에 점선 하나. 라벨은 우측 끝에 작게 |
| `tooltipLabel` | `((v: unknown) => ReactNode)` |  |  |
| `tooltipValue` | `((v: number, key: string) => ReactNode)` |  |  |
| `xFormat` | `((v: unknown) => string)` |  |  |
| `xInterval` | `number` |  |  |
| `yFormat` | `((v: number) => string)` |  |  |
