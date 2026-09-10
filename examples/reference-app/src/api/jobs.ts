import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import type { ClusterSummary, Job, JobState, Overview } from './types'

export interface JobFilters {
  q?: string
  state?: JobState | ''
  pipeline?: string
  page?: number
  pageSize?: number
  sort?: string
  dir?: 'asc' | 'desc'
}
export interface JobList {
  items: Job[]
  total: number
  /** 상태별 건수 (상태 필터 제외 기준). '' 키는 전체 */
  counts: Record<string, number>
  pipelines: string[]
}

export const jobKeys = {
  all: ['jobs'] as const,
  list: (f: JobFilters) => ['jobs', 'list', f] as const,
  summary: ['jobs', 'summary'] as const,
}

export function useJobs(filters: JobFilters) {
  return useQuery({
    queryKey: jobKeys.list(filters),
    queryFn: () => {
      const p = new URLSearchParams()
      if (filters.q) p.set('q', filters.q)
      if (filters.state) p.set('state', filters.state)
      if (filters.pipeline) p.set('pipeline', filters.pipeline)
      if (filters.page) p.set('page', String(filters.page))
      if (filters.pageSize) p.set('pageSize', String(filters.pageSize))
      if (filters.sort) p.set('sort', filters.sort)
      if (filters.dir) p.set('dir', filters.dir)
      const qs = p.toString()
      return api<JobList>(`/jobs${qs ? `?${qs}` : ''}`)
    },
    refetchInterval: 15_000,
    placeholderData: (prev) => prev,
  })
}

export function useJobLogs(id: string | undefined, live: boolean) {
  return useQuery({
    queryKey: ['jobs', 'logs', id],
    queryFn: () => api<{ lines: string[]; live: boolean }>(`/jobs/${id}/logs`),
    enabled: Boolean(id),
    refetchInterval: live ? 2_000 : false,
  })
}

export function useBulkJobs() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (d: { ids: string[]; action: 'retry' | 'cancel' }) => api<{ affected: number }>('/jobs/bulk', { method: 'POST', body: JSON.stringify(d) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: jobKeys.all }),
  })
}

export function useClusterSummary() {
  return useQuery({
    queryKey: jobKeys.summary,
    queryFn: () => api<ClusterSummary>('/summary'),
    refetchInterval: 15_000,
  })
}

export function useRetryJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api<Job>(`/jobs/${id}/retry`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: jobKeys.all }),
  })
}

export function useCancelJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api<Job>(`/jobs/${id}/cancel`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: jobKeys.all }),
  })
}

export function useOverview(range: '24h' | '7d') {
  return useQuery({
    queryKey: ['overview', range],
    queryFn: () => api<Overview>(`/overview?range=${range}`),
    refetchInterval: 30_000,
    placeholderData: (prev) => prev,
  })
}
