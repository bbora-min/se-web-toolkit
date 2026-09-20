# TimelineRibbon

`import { TimelineRibbon } from '@se/ui'` — 시그니처 · `packages/ui/src/signatures/timeline-ribbon.tsx`

시그니처 · 타임라인 리본 — 활동·이력 서비스의 얼굴.
"최근 무슨 일이 있었고 지금 어디쯤인가"를 시간축 한 줄로. 배포·장애·알림이 줄(lane)마다 놓이고 구간은 막대, 순간은 점.
액센트는 "지금" 선과 이 서비스의 일(tone=accent)에만. 의미 색은 상태에만.

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `events` **필수** | `RibbonEvent[]` |  |  |
| `from` **필수** | `string` |  | 보이는 범위 (ISO). 24시간·7일이 보통 |
| `to` **필수** | `string` |  |  |
| `className` | `string` |  |  |
| `detail` | `ReactNode` |  |  |
| `headline` | `ReactNode` |  | 왼쪽 제목 — "지난 24시간 · 배포 6 · 장애 1" |
| `lanes` | `string[]` |  | 줄 순서. 없으면 events 에 나온 순서 |
| `laneWidth` | `number` | `56` | 줄 이름 칸의 폭(px). 기본 56(0.10.x 의 3.5rem=49px 보다 7px 넓다) — 서비스 이름처럼 긴 줄 이름이면 96–120 |
| `now` | `string` |  | "지금" 선. 범위 안에 있을 때만 그린다. 기본: 현재 시각 |
| `onSelect` | `((id: string) => void)` |  |  |
| `selected` | `string \| null` |  |  |
