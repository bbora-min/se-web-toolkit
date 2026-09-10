import * as React from 'react'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../lib/cn'
import { Button } from './button'
import { Skeleton } from './skeleton'
import { EmptyState, ErrorState } from './states'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table'

export type { ColumnDef }

export interface DataTableProps<T> {
  columns: ColumnDef<T, unknown>[]
  data: T[]
  /** 로딩 — 스켈레톤 행을 그린다 (레이아웃 유지) */
  loading?: boolean
  /** 에러 — 원인과 재시도를 보여준다 */
  error?: { title: string; description?: string; onRetry?: () => void } | null
  /** 0건 — 다음 행동을 보여준다 */
  empty?: { title: string; description?: string; action?: React.ReactNode }
  onRowClick?: (row: T) => void
  /** 선택된 행 판별 (상세 드로어와 연동) */
  isRowSelected?: (row: T) => boolean
  /** 행 호버/포커스 시 오른쪽 끝에 나타나는 빠른 액션 (아이콘 버튼 1–3개) */
  rowActions?: (row: T) => React.ReactNode
  getRowId?: (row: T) => string
  pageSize?: number
  initialSorting?: SortingState
  /** card: 테두리 카드 안에 / plain: 행 구분선만 (페이지 배경이 surface일 때) */
  variant?: 'card' | 'plain'
  className?: string
}

/**
 * 내부 도구용 데이터 표. 정렬·페이지네이션·3상태(로딩/빈/에러)를 내장한다.
 * 서버 페이지네이션은 P2에서 추가.
 */
export function DataTable<T>({
  columns,
  data,
  loading,
  error,
  empty,
  onRowClick,
  isRowSelected,
  getRowId,
  rowActions,
  pageSize = 25,
  initialSorting = [],
  variant = 'plain',
  className,
}: DataTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting)
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  })

  const colCount = columns.length + (rowActions ? 1 : 0)
  const { pageIndex } = table.getState().pagination
  const total = data.length

  return (
    <div
      className={cn(
        'flex flex-col',
        variant === 'card' && 'rounded-lg border border-line bg-surface shadow-xs',
        variant === 'plain' && 'border-t border-line',
        className,
      )}
    >
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="hover:bg-transparent">
              {hg.headers.map((h) => {
                const canSort = h.column.getCanSort()
                const dir = h.column.getIsSorted()
                const align = (h.column.columnDef.meta as { align?: 'right' } | undefined)?.align
                return (
                  <TableHead key={h.id} data-align={align} style={{ width: h.getSize() !== 150 ? h.getSize() : undefined }}>
                    {h.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        onClick={h.column.getToggleSortingHandler()}
                        className={cn(
                          'inline-flex items-center gap-1 rounded-sm hover:text-ink transition-colors',
                          dir && 'text-ink',
                          align === 'right' && 'flex-row-reverse',
                        )}
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
            Array.from({ length: Math.min(pageSize, 8) }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-3.5" style={{ width: `${55 + ((i * 7 + j * 13) % 35)}%` }} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : error ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={colCount} className="p-0">
                <ErrorState
                  title={error.title}
                  description={error.description}
                  action={error.onRetry ? <Button onClick={error.onRetry}>다시 시도</Button> : undefined}
                />
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
                data-state={isRowSelected?.(row.original) ? 'selected' : undefined}
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
                    <TableCell key={cell.id} data-align={align}>
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
      {!loading && !error && total > 0 ? (
        <div className="flex h-12 items-center justify-between px-4 text-sm text-muted tnum">
          <span>
            <span className="text-ink">{total.toLocaleString()}</span>건 중 {pageIndex * pageSize + 1}–
            {Math.min((pageIndex + 1) * pageSize, total)}
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              <ChevronLeft /> 이전
            </Button>
            <Button size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              다음 <ChevronRight />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
