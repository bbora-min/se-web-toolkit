# StatCard

`import { StatCard } from '@se/ui'` — 컴포넌트 · `packages/ui/src/components/stat-card.tsx`

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `label` **필수** | `string` |  |  |
| `value` **필수** | `ReactNode` |  |  |
| `className` | `string` |  |  |
| `delta` | `{ value: number; period: string; upIsGood?: boolean \| null; format?: ((v: number) => st…` |  | upIsGood: true=오르면 좋음, false=내리면 좋음, null=방향에 가치 없음(중립) |
| `tone` | `enum` | `default` | 값 자체가 경고 상태일 때 |
| `trend` | `number[]` |  |  |
| `trendFormat` | `((v: number) => string)` |  |  |
