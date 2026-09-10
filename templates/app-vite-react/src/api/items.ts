import { useQuery } from '@tanstack/react-query'
import { api } from './client'
import type { Item, ItemState } from './types'

export interface ItemFilters {
  q?: string
  state?: ItemState | ''
  page?: number
  pageSize?: number
}
export interface ItemList {
  items: Item[]
  total: number
  counts: Record<string, number>
}

export function useItems(f: ItemFilters) {
  return useQuery({
    queryKey: ['items', f],
    queryFn: () => {
      const p = new URLSearchParams()
      if (f.q) p.set('q', f.q)
      if (f.state) p.set('state', f.state)
      if (f.page) p.set('page', String(f.page))
      if (f.pageSize) p.set('pageSize', String(f.pageSize))
      const qs = p.toString()
      return api<ItemList>(`/items${qs ? `?${qs}` : ''}`)
    },
    placeholderData: (prev) => prev,
  })
}
