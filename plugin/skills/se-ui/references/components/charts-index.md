# ChartCard · BarChart · LineChart · MeterList · SeriesColor

`import { ChartCard, BarChart, LineChart, MeterList, SeriesColor } from '@se/charts'` — 차트 · `packages/charts/src/index.ts`

## ChartCard

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `title` **필수** | `string` |  |  |
| `actions` | `ReactNode` |  |  |
| `className` | `string` |  |  |
| `description` | `string` |  | 무엇을 어떻게 읽는지 한 줄 |
| `legend` | `Series[]` |  | 2개 이상 시리즈면 항상 범례 |

## BarChart

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

## LineChart

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

## MeterList

미터 목록 — 순위·비율 비교. 막대 차트보다 라벨을 읽기 쉽다.
채움은 심각도(accent → warning → danger), 트랙은 같은 계열의 옅은 단계.

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `items` **필수** | `MeterItem[]` |  |  |
| `className` | `string` |  |  |

## SeriesColor

차트 색은 전부 CSS 변수 — 라이트/다크·아이덴티티를 자동으로 따른다.
의미 색(success/warning/danger/info)은 "상태"를 그릴 때만, 카테고리는 chart-1..8을 순서대로.

_props 없음 (HTML 속성 그대로)_
