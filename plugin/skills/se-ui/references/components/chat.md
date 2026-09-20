# Thread · Message · Citation · Composer

`import { Thread, Message, Citation, Composer } from '@se/ui'` — 패턴 · `packages/ui/src/patterns/chat.tsx`

## Thread

대화 스크롤 영역. 자식은 `Message` 들

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `follow` | `boolean` | `true` | 새 내용이 오면 맨 아래로 — 사용자가 위로 올렸으면 그대로 둔다 |

## Message

말 한 덩이. 어시스턴트는 왼쪽 평문(Prose 를 안에 넣어도 된다), 사용자는 오른쪽 말풍선

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `role` **필수** | `enum` |  |  |
| `actions` | `ReactNode` |  | 답 아래 작은 액션(복사·다시 생성·좋아요) |
| `citations` | `CitationItem[]` |  | 답의 출처 — 번호 칩 |
| `className` | `string` |  |  |
| `mark` | `ReactNode` |  | 어시스턴트 마크(모노그램·아이콘). 사용자는 아바타 |
| `meta` | `ReactNode` |  | 상대 시각 등 |
| `streaming` | `boolean` |  | 답이 아직 오는 중 — 마지막 글 끝에 커서(`.se-caret`, 블록 자식이면 그 안) |

## Citation

출처 칩 — 번호 + 이름. 눌러서 원본으로

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `index` **필수** | `number` |  |  |
| `href` | `string` |  |  |
| `onClick` | `((e: MouseEvent<HTMLElement, MouseEvent>) => void)` |  |  |

## Composer

입력 상자 — 한 줄에서 시작해 자란다. Enter 보내기, Shift+Enter 줄바꿈

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `onSubmit` **필수** | `(text: string) => void` |  |  |
| `autoFocus` | `boolean` |  |  |
| `className` | `string` |  |  |
| `disabled` | `boolean` |  |  |
| `hint` | `ReactNode` |  | 아래 힌트. 기본: Enter 보내기 · Shift+Enter 줄바꿈 |
| `maxRows` | `number` | `8` | 자동으로 커지는 최대 줄 수 |
| `onStop` | `(() => void)` |  |  |
| `placeholder` | `string` | `무엇이든 물어보세요` |  |
| `streaming` | `boolean` |  | 답이 오는 중 — 보내기 대신 정지 |
