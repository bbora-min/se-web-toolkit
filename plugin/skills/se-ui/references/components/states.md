# EmptyState · ErrorState

`import { EmptyState, ErrorState } from '@se/ui'` — 컴포넌트 · `packages/ui/src/components/states.tsx`

## EmptyState

데이터가 0건일 때. "없음"이 아니라 "다음에 무엇을 할지"를 말한다

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `title` **필수** | `string` |  |  |
| `action` | `ReactNode` |  | 다음 행동 버튼. 빈 상태에는 거의 항상 있어야 한다 |
| `description` | `string` |  | 원인이나 다음 행동을 한 문장으로 |
| `icon` | `ReactNode` |  |  |

## ErrorState

실패했을 때. 원인 + 해결(재시도 버튼)을 함께 보여준다

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `title` **필수** | `string` |  |  |
| `action` | `ReactNode` |  | 다음 행동 버튼. 빈 상태에는 거의 항상 있어야 한다 |
| `description` | `string` |  | 원인이나 다음 행동을 한 문장으로 |
| `icon` | `ReactNode` |  |  |
