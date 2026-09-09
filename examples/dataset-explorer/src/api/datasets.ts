import { useQuery } from '@tanstack/react-query'
import { api } from './client'
import type { Dataset } from './types'

export type DatasetRow = Omit<Dataset, 'columns'> & { columnCount: number }
export type Quick = 'mine' | 'stale' | 'pii' | 'certified' | ''

export interface DatasetFilters {
  q?: string
  domain?: string
  quick?: Quick
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
