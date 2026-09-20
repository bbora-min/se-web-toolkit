# ChartCard · ChartLegend · BarChart · LineChart · MeterList

`import { ChartCard, ChartLegend, BarChart, LineChart, MeterList } from '@se/charts'` — 차트 · `packages/charts/src/index.ts`

## ChartCard

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `title` **필수** | `string` |  |  |
| `actions` | `ReactNode` |  |  |
| `className` | `string` |  |  |
| `description` | `string` |  | 무엇을 어떻게 읽는지 한 줄 |
| `legend` | `Series[]` |  | 2개 이상 시리즈면 항상 범례 |

## ChartLegend

범례 — 시리즈 색 점 + 라벨. ChartCard 가 쓰고, 관측 벽의 `Tile legend=` 에도 그대로 넘긴다

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `series` **필수** | `Series[]` |  |  |
| `className` | `string` |  |  |

## BarChart

막대. 얇게, 위쪽 모서리만 둥글게, 막대 사이 표면 간격.
축선 없음, 가로 격자만 점선. 시리즈가 2개 이상이면 ChartCard에 legend를 넘긴다.

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `data` **필수** | `T[]` |  |  |
| `series` **필수** | `Series[]` |  |  |
| `xKey` **필수** | `string` |  |  |
| `barSize` | `number` |  | 막대 폭 고정(px). 값이 0–3건인 도구에서 기본(최대 28)이 너무 가늘 때 |
| `height` | `number` | `220` |  |
| `stacked` | `boolean` |  |  |
| `tooltipLabel` | `((v: unknown) => ReactNode)` |  |  |
| `tooltipValue` | `((v: number, key: string) => ReactNode)` |  |  |
| `xFormat` | `((v: unknown) => string)` |  |  |
| `xInterval` | `number` |  | x축 눈금 간격 (예: 24포인트에 4면 6개만) |
| `yFormat` | `((v: number) => string)` |  |  |

## LineChart

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

## MeterList

미터 목록 — 순위·비율 비교. 막대 차트보다 라벨을 읽기 쉽다.
채움은 심각도(accent → warning → danger), 트랙은 같은 계열의 옅은 단계.
항목 `tone` 에 `chart-1..8` 을 주면 카테고리 색 — 같은 카테고리의 배지·차트와 맞춘다.

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `items` **필수** | `MeterItem[]` |  |  |
| `className` | `string` |  |  |
