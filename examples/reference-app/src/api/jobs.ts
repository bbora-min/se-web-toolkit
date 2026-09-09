import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import type { ClusterSummary, Job, JobState } from './types'

export interface JobFilters {
  q?: string
  state?: JobState | ''
  pipeline?: string
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
      const qs = p.toString()
      return api<{ items: Job[]; pipelines: string[] }>(`/jobs${qs ? `?${qs}` : ''}`)
    },
    refetchInterval: 15_000,
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
