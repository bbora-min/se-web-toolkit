# Tabs

`import { Tabs } from '@se/ui'` — 컴포넌트 · `packages/ui/src/components/tabs.tsx`

밑줄 탭. 목록의 1차 분류(상태·유형)에 쓴다. 필터바는 그 아래 2차.
카운트는 보조 정보라 muted, 선택된 탭만 ink.

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `items` **필수** | `TabItem[]` |  |  |
| `onChange` **필수** | `(value: string) => void` |  |  |
| `value` **필수** | `string` |  |  |
| `aria-label` | `string` |  |  |
| `className` | `string` |  |  |
