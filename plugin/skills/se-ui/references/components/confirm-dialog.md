# ConfirmDialog

`import { ConfirmDialog } from '@se/ui'` — 컴포넌트 · `packages/ui/src/components/confirm-dialog.tsx`

확인 다이얼로그. 위험 동작은 항상 이걸 거친다

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `onConfirm` **필수** | `() => void \| Promise<void>` |  |  |
| `onOpenChange` **필수** | `(open: boolean) => void` |  |  |
| `open` **필수** | `boolean` |  |  |
| `title` **필수** | `string` |  |  |
| `cancelLabel` | `string` | `취소` |  |
| `confirmLabel` | `string` | `확인` |  |
| `description` | `ReactNode` |  | 무엇이 일어나는지, 되돌릴 수 있는지 |
| `destructive` | `boolean` |  | 위험 동작이면 빨간 버튼 |
| `typeToConfirm` | `string` |  | 되돌릴 수 없는 동작: 이 문자열을 그대로 입력해야 확인 버튼이 열린다 |
