# FilterBar · SearchInput

`import { FilterBar, SearchInput } from '@se/ui'` — 컴포넌트 · `packages/ui/src/components/filter-bar.tsx`

## FilterBar

필터바 — 표 바로 위 한 줄. 왼쪽은 필터, 오른쪽(`end`)은 요약·액션.
필터가 4개를 넘으면 "더 보기"로 접는다(P2).

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `end` | `ReactNode` |  |  |

## SearchInput

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `leading` | `ReactNode` |  | 왼쪽 아이콘 (검색 등) |
| `mono` | `boolean` |  | ID·해시·경로 입력이면 mono |
