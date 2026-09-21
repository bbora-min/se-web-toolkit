import { useQuery } from '@tanstack/react-query'
import { api } from './client'
import type { Dataset, OwnerSummary, TagSummary } from './types'

export type DatasetRow = Omit<Dataset, 'columns'> & { columnCount: number }
export type Quick = 'mine' | 'stale' | 'pii' | 'certified' | ''

export interface DatasetFilters {
  q?: string
  domain?: string
  quick?: Quick
  /** 소유자·태그 화면에서 넘어올 때 */
  owner?: string
  tag?: string
}

export interface DatasetList {
  items: DatasetRow[]
  total: number
  domains: string[]
  counts: Record<Exclude<Quick, ''>, number>
}

export function useDatasets(f: DatasetFilters) {
  return useQuery({
    queryKey: ['datasets', f],
    queryFn: () => {
      const p = new URLSearchParams()
      if (f.q) p.set('q', f.q)
      if (f.domain) p.set('domain', f.domain)
      if (f.quick) p.set('quick', f.quick)
      if (f.owner) p.set('owner', f.owner)
      if (f.tag) p.set('tag', f.tag)
      const qs = p.toString()
      return api<DatasetList>(`/datasets${qs ? `?${qs}` : ''}`)
    },
    placeholderData: (prev) => prev,
  })
}

export function useDataset(id: string | undefined) {
  return useQuery({
    queryKey: ['datasets', 'detail', id],
    queryFn: () => api<Dataset>(`/datasets/${id}`),
    enabled: Boolean(id),
  })
}

/** 소유자별 요약 — 팀으로 묶어 보여 준다 */
export function useOwners() {
  return useQuery({ queryKey: ['owners'], queryFn: () => api<{ items: OwnerSummary[] }>('/owners') })
}
/** 태그별 요약 */
export function useTags() {
  return useQuery({ queryKey: ['tags'], queryFn: () => api<{ items: TagSummary[] }>('/tags') })
}
