# DataTable

`import { DataTable } from '@se/ui'` — 컴포넌트 · `packages/ui/src/components/data-table.tsx`

내부 도구용 데이터 표. 정렬·페이지네이션·3상태·행 액션·행 선택·일괄 액션.
기본은 클라이언트 모드, `pagination`을 주면 서버 모드.

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `columns` **필수** | `ColumnDef<T, unknown>[]` |  |  |
| `data` **필수** | `T[]` |  |  |
| `bulkActions` | `((rows: T[], clear: () => void) => ReactNode)` |  | 선택된 행에 대한 일괄 액션. (선택 행 배열, 선택 해제 함수) |
| `className` | `string` |  |  |
| `empty` | `{ title: string; description?: string; action?: ReactNode; }` |  |  |
| `error` | `{ title: string; description?: string; onRetry?: (() => void); } \| null \| undefined` |  |  |
| `fetching` | `boolean` |  | 페이지 전환 등 갱신 중 — 데이터는 있지만 새 요청이 진행 중 |
| `getRowId` | `((row: T) => string)` |  |  |
| `initialSorting` | `SortingState` | `[]` |  |
| `isRowSelected` | `((row: T) => boolean)` |  |  |
| `loading` | `boolean` |  | 로딩 — 스켈레톤 행을 그린다 (레이아웃 유지). 서버 모드에서 페이지 전환 중엔 이전 데이터를 흐리게 |
| `onRowClick` | `((row: T) => void)` |  |  |
| `onSelectionChange` | `((s: RowSelectionState) => void)` |  |  |
| `pageSize` | `number` | `25` | 클라이언트 모드 페이지 크기 |
| `pagination` | `ServerPagination` |  | 서버 모드. 주면 정렬·페이지네이션을 서버가 담당한다 — `sorting`과 함께 쓴다. 1만 건 넘는 목록은 반드시 이 모드. |
| `rowActions` | `((row: T) => ReactNode)` |  |  |
| `selectable` | `boolean` |  | 행 선택 — 체크박스 열이 생기고 선택 시 하단에 일괄 액션 바가 뜬다 |
| `selection` | `RowSelectionState` |  |  |
| `sorting` | `{ state: SortingState; onChange: (s: SortingState) => void; }` |  | 컨트롤드 정렬 (서버 모드) |
| `variant` | `enum` | `plain` |  |
