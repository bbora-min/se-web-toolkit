# MeterList

`import { MeterList } from '@se/charts'` — 차트 · `packages/charts/src/meter-list.tsx`

미터 목록 — 순위·비율 비교. 막대 차트보다 라벨을 읽기 쉽다.
채움은 심각도(accent → warning → danger), 트랙은 같은 계열의 옅은 단계.
항목 `tone` 에 `chart-1..8` 을 주면 카테고리 색 — 같은 카테고리의 배지·차트와 맞춘다.

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `items` **필수** | `MeterItem[]` |  |  |
| `className` | `string` |  |  |
