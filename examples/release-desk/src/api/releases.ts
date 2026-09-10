import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import type { Release, ReleaseDraft, StageId } from './types'

export interface ReleaseFilters {
  q?: string
  stage?: StageId | ''
  service?: string
  from?: string
  to?: string
  mine?: boolean
}
export interface ReleaseList {
  items: Release[]
  stages: Array<{ id: StageId; label: string; count: number; blocked: number }>
  freeze: { from: string; to: string; reason: string } | null
}

export function useReleases(f: ReleaseFilters) {
  return useQuery({
    queryKey: ['releases', f],
    queryFn: () => {
      const p = new URLSearchParams()
      if (f.q) p.set('q', f.q)
      if (f.stage) p.set('stage', f.stage)
      if (f.service) p.set('service', f.service)
      if (f.from) p.set('from', f.from)
      if (f.to) p.set('to', f.to)
      if (f.mine) p.set('mine', '1')
      const qs = p.toString()
      return api<ReleaseList>(`/releases${qs ? `?${qs}` : ''}`)
    },
    placeholderData: (prev) => prev,
  })
}
export function useRelease(id: string | undefined) {
  return useQuery({ queryKey: ['releases', 'detail', id], queryFn: () => api<Release>(`/releases/${id}`), enabled: Boolean(id) })
}
function useInvalidate() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: ['releases'] })
}
export function useCreateRelease() {
  const inv = useInvalidate()
  return useMutation({ mutationFn: (d: ReleaseDraft) => api<Release>('/releases', { method: 'POST', body: JSON.stringify(d) }), onSuccess: inv })
}
export function useDecide(id: string) {
  const inv = useInvalidate()
  return useMutation({
    mutationFn: (d: { decision: 'approved' | 'rejected'; comment?: string }) => api<Release>(`/releases/${id}/decision`, { method: 'POST', body: JSON.stringify(d) }),
    onSuccess: inv,
  })
}
export function useAdvance(id: string) {
  const inv = useInvalidate()
  return useMutation({ mutationFn: () => api<Release>(`/releases/${id}/advance`, { method: 'POST' }), onSuccess: inv })
}
export function useChecklist(id: string) {
  const inv = useInvalidate()
  return useMutation({ mutationFn: (d: { itemId: string; done: boolean }) => api<Release>(`/releases/${id}/checklist`, { method: 'POST', body: JSON.stringify(d) }), onSuccess: inv })
}
