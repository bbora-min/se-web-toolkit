# DateRangePicker

`import { DateRangePicker } from '@se/ui'` — 컴포넌트 · `packages/ui/src/components/date-range-picker.tsx`

기간 선택 — 프리셋 열 + 한 달 달력. 시작일 클릭 → 종료일 클릭.
모니터링·조회의 "언제"를 정하는 기본 부품.

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `onChange` **필수** | `(r: DateRange \| null) => void` |  |  |
| `value` **필수** | `DateRange \| null` |  |  |
| `className` | `string` |  |  |
| `id` | `string` |  |  |
| `max` | `string` |  |  |
| `min` | `string` |  | 과거만 / 미래만 제한 |
| `placeholder` | `string` | `기간` |  |
| `presets` | `{ id: string; label: string; range: () => DateRange; }[]` | `[   { id: 'today', label: '오늘', range: () => ({ from: today(), to: today() }) },   { id: '7d', label: '최근 7일', range: () => ({ from: fmt(addDays(new Date(), -6)), to: today() }) },   { id: '30d', label: '최근 30일', range: () => ({ from: fmt(addDays(new Date(), -29)), to: today() }) },   { id: 'month', label: '이번 달', range: () => { const n = new Date(); return { from: fmt(new Date(n.getFullYear(), n.getMonth(), 1)), to: fmt(new Date(n.getFullYear(), n.getMonth() + 1, 0)) } } },   { id: 'next14', label: '앞으로 2주', range: () => ({ from: today(), to: fmt(addDays(new Date(), 13)) }) }, ]` |  |
