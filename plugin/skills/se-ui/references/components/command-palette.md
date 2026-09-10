# CommandPalette

`import { CommandPalette } from '@se/ui'` — 컴포넌트 · `packages/ui/src/components/command-palette.tsx`

커맨드 팔레트 — ⌘K. 페이지 이동·항목 점프·액션을 한 입력창에서.
내부 도구에서 "잘 만들었다"는 인상의 절반은 여기서 나온다.

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `groups` **필수** | `CommandGroup[]` |  |  |
| `onOpenChange` **필수** | `(open: boolean) => void` |  |  |
| `open` **필수** | `boolean` |  |  |
| `emptyText` | `string` | `결과가 없습니다` |  |
| `onQueryChange` | `((q: string) => void)` |  | 검색어가 바뀔 때 (서버 검색 연동용) |
| `placeholder` | `string` | `명령 또는 검색…` |  |
