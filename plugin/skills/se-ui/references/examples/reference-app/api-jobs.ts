// 원본: examples/reference-app/src/api/jobs.ts (자동 복사 — 수정하지 말 것, pnpm gen:skill-docs)
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import type { ActivityKind, ActivityList, ClusterNode, ClusterSummary, Job, JobState, Overview, Pipeline } from './types'

export interface JobFilters {
  q?: string
  state?: JobState | ''
  pipeline?: string
  /** 노드 이름 — 노드 화면에서 넘어올 때 */
  node?: string
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

export function useJobs(filters: JobFilters, opts: { enabled?: boolean; refetchInterval?: number | false } = {}) {
  return useQuery({
    enabled: opts.enabled ?? true,
    queryKey: jobKeys.list(filters),
    queryFn: () => {
      const p = new URLSearchParams()
      if (filters.q) p.set('q', filters.q)
      if (filters.state) p.set('state', filters.state)
      if (filters.pipeline) p.set('pipeline', filters.pipeline)
      if (filters.node) p.set('node', filters.node)
      if (filters.page) p.set('page', String(filters.page))
      if (filters.pageSize) p.set('pageSize', String(filters.pageSize))
      if (filters.sort) p.set('sort', filters.sort)
      if (filters.dir) p.set('dir', filters.dir)
      const qs = p.toString()
      return api<JobList>(`/jobs${qs ? `?${qs}` : ''}`)
    },
    refetchInterval: opts.refetchInterval ?? 15_000,
    placeholderData: (prev) => prev,
  })
}

/** 파이프라인 목록(이름·마지막 실행) */
export function usePipelines() {
  return useQuery({ queryKey: ['pipelines'], queryFn: () => api<{ items: Array<{ name: string; lastState: JobState }> }>('/pipelines'), staleTime: 30_000 })
}
/** 파이프라인 하나 — 태스크 DAG. 마지막 실행이 실행 중이면 5초마다 */
export function usePipeline(name: string | undefined) {
  return useQuery({
    queryKey: ['pipelines', name],
    queryFn: () => api<Pipeline>(`/pipelines/${name}`),
    enabled: Boolean(name),
    refetchInterval: (q) => (q.state.data?.lastRun.state === 'running' ? 5_000 : false),
  })
}

/** 잡 하나 — 콘솔 화면. 실행 중이면 5초마다 */
export function useJob(id: string | undefined) {
  return useQuery({
    queryKey: ['jobs', 'one', id],
    queryFn: () => api<Job>(`/jobs/${id}`),
    enabled: Boolean(id),
    refetchInterval: (q) => (q.state.data?.state === 'running' ? 5_000 : false),
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
    onSuccess: () => { void qc.invalidateQueries({ queryKey: jobKeys.all }); void qc.invalidateQueries({ queryKey: ['pipelines'] }) },
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
    onSuccess: () => { void qc.invalidateQueries({ queryKey: jobKeys.all }); void qc.invalidateQueries({ queryKey: ['pipelines'] }) },
  })
}

export function useCancelJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api<Job>(`/jobs/${id}/cancel`, { method: 'POST' }),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: jobKeys.all }); void qc.invalidateQueries({ queryKey: ['pipelines'] }) },
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

/** 노드 목록 — 15초마다 갱신 */
export function useNodes() {
  return useQuery({ queryKey: ['nodes'], queryFn: () => api<{ items: ClusterNode[] }>('/nodes'), refetchInterval: 15_000 })
}

/** 활동 — 잡·노드·스케줄에서 일어난 일. `kind` 로 종류 필터 */
export function useActivity(kind: ActivityKind | '') {
  return useQuery({ queryKey: ['activity', kind], queryFn: () => api<ActivityList>(`/activity${kind ? `?kind=${kind}` : ''}`), placeholderData: (prev) => prev, refetchInterval: 30_000 })
}
