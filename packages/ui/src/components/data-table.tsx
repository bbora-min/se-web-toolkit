import * as React from 'react'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '../lib/cn'
import { Button } from './button'
import { Checkbox } from './checkbox'
import { Skeleton } from './skeleton'
import { EmptyState, ErrorState } from './states'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table'

export type { ColumnDef, SortingState, RowSelectionState }

export interface ServerPagination {
  pageIndex: number
  pageSize: number
  /** 서버가 알려준 전체 건수 */
  total: number
  onChange: (next: { pageIndex: number; pageSize: number }) => void
}

export interface DataTableProps<T> {
  columns: ColumnDef<T, unknown>[]
  data: T[]
  /** 로딩 — 스켈레톤 행을 그린다 (레이아웃 유지). 서버 모드에서 페이지 전환 중엔 이전 데이터를 흐리게 */
  loading?: boolean
  /** 페이지 전환 등 갱신 중 — 데이터는 있지만 새 요청이 진행 중 */
  fetching?: boolean
  error?: { title: string; description?: string; onRetry?: () => void } | null
  empty?: { title: string; description?: string; action?: React.ReactNode }
  onRowClick?: (row: T) => void
  isRowSelected?: (row: T) => boolean
  rowActions?: (row: T) => React.ReactNode
  getRowId?: (row: T) => string
  /** 클라이언트 모드 페이지 크기 */
  pageSize?: number
  initialSorting?: SortingState
  /**
   * 서버 모드. 주면 정렬·페이지네이션을 서버가 담당한다 — `sorting`과 함께 쓴다.
   * 1만 건 넘는 목록은 반드시 이 모드.
   */
  pagination?: ServerPagination
  /** 컨트롤드 정렬 (서버 모드) */
  sorting?: { state: SortingState; onChange: (s: SortingState) => void }
  /** 행 선택 — 체크박스 열이 생기고 선택 시 하단에 일괄 액션 바가 뜬다 */
  selectable?: boolean
  selection?: RowSelectionState
  onSelectionChange?: (s: RowSelectionState) => void
  /** 선택된 행에 대한 일괄 액션. (선택 행 배열, 선택 해제 함수) */
  bulkActions?: (rows: T[], clear: () => void) => React.ReactNode
  variant?: 'card' | 'plain'
  className?: string
}

/**
 * 내부 도구용 데이터 표. 정렬·페이지네이션·3상태·행 액션·행 선택·일괄 액션.
 * 기본은 클라이언트 모드, `pagination`을 주면 서버 모드.
 */
export function DataTable<T>({
  columns,
  data,
  loading,
  fetching,
  error,
  empty,
  onRowClick,
  isRowSelected,
  rowActions,
  getRowId,
  pageSize = 25,
  initialSorting = [],
  pagination,
  sorting: sortingCtl,
  selectable,
  selection,
  onSelectionChange,
  bulkActions,
  variant = 'plain',
  className,
}: DataTableProps<T>) {
  const [innerSorting, setInnerSorting] = React.useState<SortingState>(initialSorting)
  const [innerSelection, setInnerSelection] = React.useState<RowSelectionState>({})
  const sorting = sortingCtl?.state ?? innerSorting
  const rowSelection = selection ?? innerSelection
  const setRowSelection = onSelectionChange ?? setInnerSelection
  const server = Boolean(pagination)

  const allColumns = React.useMemo<ColumnDef<T, unknown>[]>(() => {
    if (!selectable) return columns
    const sel: ColumnDef<T, unknown> = {
      id: '__select',
      size: 36,
      enableSorting: false,
      header: ({ table }) => (
        <Checkbox
          aria-label="현재 페이지 전체 선택"
          checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? 'indeterminate' : false}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(v === true)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox aria-label="행 선택" checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(v === true)} onClick={(e) => e.stopPropagation()} />
      ),
    }
    return [sel, ...columns]
  }, [columns, selectable])

  const table = useReactTable({
    data,
    columns: allColumns,
    state: { sorting, rowSelection, ...(pagination ? { pagination: { pageIndex: pagination.pageIndex, pageSize: pagination.pageSize } } : {}) },
    onSortingChange: (u) => {
      const next = typeof u === 'function' ? u(sorting) : u
      if (sortingCtl) sortingCtl.onChange(next)
      else setInnerSorting(next)
      if (pagination && pagination.pageIndex !== 0) pagination.onChange({ pageIndex: 0, pageSize: pagination.pageSize })
    },
    onRowSelectionChange: (u) => setRowSelection(typeof u === 'function' ? u(rowSelection) : u),
    enableRowSelection: !!selectable,
    getRowId,
    manualPagination: server,
    manualSorting: server,
    pageCount: pagination ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize)) : undefined,
    getCoreRowModel: getCoreRowModel(),
    ...(server ? {} : { getSortedRowModel: getSortedRowModel(), getPaginationRowModel: getPaginationRowModel() }),
    initialState: { pagination: { pageSize } },
  })

  const colCount = allColumns.length + (rowActions ? 1 : 0)
  const pageIndex = pagination ? pagination.pageIndex : table.getState().pagination.pageIndex
  const size = pagination ? pagination.pageSize : pageSize
  const total = pagination ? pagination.total : data.length
  const pageCount = pagination ? Math.max(1, Math.ceil(total / size)) : table.getPageCount()
  const canPrev = pageIndex > 0
  const canNext = pageIndex < pageCount - 1
  const goto = (i: number) => (pagination ? pagination.onChange({ pageIndex: i, pageSize: size }) : table.setPageIndex(i))

  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original)
  const selectedCount = Object.values(rowSelection).filter(Boolean).length
  const clearSelection = () => setRowSelection({})

  return (
    <div className={cn('relative flex flex-col', variant === 'card' && 'rounded-lg border border-line bg-surface shadow-xs', variant === 'plain' && 'border-t border-line', className)}>
      <div className={cn('transition-opacity duration-150', fetching && !loading && 'opacity-60')}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map((h) => {
                  const canSort = h.column.getCanSort()
                  const dir = h.column.getIsSorted()
                  const align = (h.column.columnDef.meta as { align?: 'right' } | undefined)?.align
                  return (
                    <TableHead key={h.id} data-align={align} style={{ width: h.getSize() !== 150 ? h.getSize() : undefined }} className={cn(h.column.id === '__select' && 'pr-0')}>
                      {h.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={h.column.getToggleSortingHandler()}
                          className={cn('inline-flex items-center gap-1 rounded-sm transition-colors hover:text-ink', dir && 'text-ink', align === 'right' && 'flex-row-reverse')}
                        >
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          {dir === 'asc' ? <ArrowUp className="size-3" /> : dir === 'desc' ? <ArrowDown className="size-3" /> : <ArrowUpDown className="size-3 opacity-40" />}
                        </button>
                      ) : (
                        flexRender(h.column.columnDef.header, h.getContext())
                      )}
                    </TableHead>
                  )
                })}
                {rowActions ? <TableHead aria-label="액션" className="w-0" /> : null}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: Math.min(size, 8) }).map((_, i) => (
                <TableRow key={i}>
                  {allColumns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-3.5" style={{ width: `${55 + ((i * 7 + j * 13) % 35)}%` }} />
                    </TableCell>
                  ))}
                  {rowActions ? <TableCell /> : null}
                </TableRow>
              ))
            ) : error ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={colCount} className="p-0">
                  <ErrorState title={error.title} description={error.description} action={error.onRetry ? <Button onClick={error.onRetry}>다시 시도</Button> : undefined} />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={colCount} className="p-0">
                  <EmptyState title={empty?.title ?? '표시할 항목이 없습니다'} description={empty?.description} action={empty?.action} />
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row: Row<T>) => (
                <TableRow
                  key={row.id}
                  className="group"
                  data-clickable={!!onRowClick}
                  data-state={row.getIsSelected() || isRowSelected?.(row.original) ? 'selected' : undefined}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={
                    onRowClick
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            onRowClick(row.original)
                          }
                        }
                      : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => {
                    const align = (cell.column.columnDef.meta as { align?: 'right' } | undefined)?.align
                    return (
                      <TableCell key={cell.id} data-align={align} className={cn(cell.column.id === '__select' && 'pr-0')}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
                  {rowActions ? (
                    <TableCell className="w-0 pl-0" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 [tr[data-state=selected]_&]:opacity-100">
                        {rowActions(row.original)}
                      </div>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && !error && total > 0 ? (
        <div className="flex h-12 items-center justify-between px-4 text-sm text-muted tnum">
          <span>
            <span className="text-ink">{total.toLocaleString()}</span>건 중 {(pageIndex * size + 1).toLocaleString()}–{Math.min((pageIndex + 1) * size, total).toLocaleString()}
            {selectedCount ? <span className="ml-3 text-accent-fg">{selectedCount}건 선택</span> : null}
          </span>
          <div className="flex items-center gap-2">
            {pagination ? (
              <select
                aria-label="페이지 크기"
                value={size}
                onChange={(e) => pagination.onChange({ pageIndex: 0, pageSize: Number(e.target.value) })}
                className="h-7 rounded-md border border-line bg-surface px-1.5 text-xs text-muted"
              >
                {[25, 50, 100].map((n) => <option key={n} value={n}>{n}개씩</option>)}
              </select>
            ) : null}
            <span className="px-1 text-xs">{pageIndex + 1} / {pageCount}</span>
            <Button size="sm" onClick={() => goto(pageIndex - 1)} disabled={!canPrev}><ChevronLeft /> 이전</Button>
            <Button size="sm" onClick={() => goto(pageIndex + 1)} disabled={!canNext}>다음 <ChevronRight /></Button>
          </div>
        </div>
      ) : null}

      {selectable && bulkActions && selectedCount > 0 ? (
        <div className="pointer-events-none sticky bottom-4 z-20 flex justify-center px-4 pb-2">
          <div className="pointer-events-auto flex items-center gap-2 rounded-lg border border-line bg-ink px-2 py-1.5 text-canvas shadow-overlay motion-safe:animate-[se-rise_180ms_cubic-bezier(.2,0,0,1)] [&_button]:text-canvas [&_button:hover]:bg-canvas/15">
            <span className="px-2 text-sm font-medium tnum">{selectedCount}건 선택</span>
            <span className="h-4 w-px bg-canvas/25" />
            {bulkActions(selectedRows, clearSelection)}
            <span className="h-4 w-px bg-canvas/25" />
            <Button variant="ghost" size="icon-sm" aria-label="선택 해제" onClick={clearSelection}><X /></Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
