# Combobox

`import { Combobox } from '@se/ui'` — 컴포넌트 · `packages/ui/src/components/combobox.tsx`

검색되는 셀렉트. 항목이 8개를 넘으면 Select 대신 이걸 쓴다

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `onChange` **필수** | `((v: string \| null) => void) \| ((v: string[]) => void)` |  |  |
| `options` **필수** | `ComboboxOption[]` |  |  |
| `value` **필수** | `string \| string[] \| null` |  |  |
| `aria-describedby` | `string` |  |  |
| `aria-invalid` | `boolean` |  |  |
| `className` | `string` |  |  |
| `disabled` | `boolean` |  |  |
| `emptyText` | `string` |  |  |
| `id` | `string` |  |  |
| `multiple` | `boolean` |  |  |
| `placeholder` | `string` |  |  |
| `searchPlaceholder` | `string` |  |  |
