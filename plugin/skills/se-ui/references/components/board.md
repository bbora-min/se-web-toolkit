# Board · BoardColumn · BoardCard

`import { Board, BoardColumn, BoardCard } from '@se/ui'` — 패턴 · `packages/ui/src/patterns/board.tsx`

## Board

가로 스크롤 보드. 자식은 `BoardColumn`

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `canMove` | `((cardId: string, toColumnId: string) => boolean)` |  | 이 카드를 이 열에 놓을 수 있는가. 없으면 전부 허용 |
| `onMove` | `((cardId: string, toColumnId: string) => void)` |  | 카드를 열에 놓았을 때. 없으면 끌 수 없다 |
| `ref` | `Ref<HTMLDivElement>` |  | 스크롤 컨테이너 — 시그니처에서 열로 스크롤할 때 `querySelector('[data-column=…]')` |

## BoardColumn

열 하나. 끄는 카드를 받을 수 있으면 놓을 자리가 액센트로, 받을 수 없으면 흐려진다

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `id` **필수** | `string` |  |  |
| `title` **필수** | `string` |  |  |
| `actions` | `ReactNode` |  | 헤더 우측 액션 |
| `blocked` | `number` |  | 막힌 카드 수 — 있으면 warning 으로 |
| `count` | `number` |  | 카드 수 — 헤더 우측 |
| `highlighted` | `boolean` |  | 시그니처(단계 레일)에서 이 열을 가리켰을 때 등 — 잠시 강조 |
| `width` | `number` | `288` | 열 폭(px). 기본 288 |

## BoardCard

카드 한 장. 내용은 자식으로 — 첫 줄 식별자(mono) · 제목 · 하단 메타 순서를 권한다

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `id` **필수** | `string` |  |  |
| `draggable` | `boolean` | `true` | 끌 수 없는 카드(완료 등) |
| `onOpen` | `(() => void)` |  | 카드 전체를 눌렀을 때(상세로). 끌기와 구분된다 |
