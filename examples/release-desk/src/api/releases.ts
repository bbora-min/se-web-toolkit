import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import type { CalendarMonth, Release, ReleaseDraft, StageId } from './types'

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
/** 배포 캘린더 한 달("YYYY-MM") */
export function useCalendar(month: string) {
  return useQuery({ queryKey: ['calendar', month], queryFn: () => api<CalendarMonth>(`/calendar?month=${month}`), placeholderData: (prev) => prev })
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
/** 보드에서 — 어느 카드든 다음 단계로. 규칙(승인 단계·체크리스트)은 화면이 먼저 본다 */
export function useAdvanceRelease() {
  const inv = useInvalidate()
  return useMutation({ mutationFn: (id: string) => api<Release>(`/releases/${id}/advance`, { method: 'POST' }), onSuccess: inv })
}
export function useChecklist(id: string) {
  const inv = useInvalidate()
  return useMutation({ mutationFn: (d: { itemId: string; done: boolean }) => api<Release>(`/releases/${id}/checklist`, { method: 'POST', body: JSON.stringify(d) }), onSuccess: inv })
}
