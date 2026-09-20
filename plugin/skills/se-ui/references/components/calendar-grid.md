# CalendarGrid

`import { CalendarGrid } from '@se/ui'` — 패턴 · `packages/ui/src/patterns/calendar-grid.tsx`

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `events` **필수** | `CalendarEvent[]` |  |  |
| `month` **필수** | `string` |  | "YYYY-MM" |
| `className` | `string` |  |  |
| `maxChips` | `number` | `3` | 한 칸에 보여 줄 칩 수. 넘치면 "+n" |
| `onSelectDay` | `((day: string) => void)` |  |  |
| `onSelectEvent` | `((event: CalendarEvent) => void)` |  |  |
| `selected` | `string \| null` |  | "YYYY-MM-DD" |
| `spans` | `CalendarSpan[]` | `[]` | 프리즈·점검처럼 날을 덮는 구간 — 빗금 |
| `today` | `string` |  | 오늘("YYYY-MM-DD"). 기본: 실제 오늘 |
