import { useQuery } from '@tanstack/react-query'
import { api } from './client'
import type { DomainDoc, DomainSummary } from './types'

/** 도메인 목록 — 트리의 첫 단 */
export function useDomains() {
  return useQuery({ queryKey: ['domains'], queryFn: () => api<{ items: DomainSummary[] }>('/domains'), staleTime: 60_000 })
}

/** 도메인 가이드 한 편 — 절·블록과 사전에 쓸 데이터셋(컬럼 포함) */
export function useDomain(id: string | undefined) {
  return useQuery({ queryKey: ['domains', id], queryFn: () => api<DomainDoc>(`/domains/${id}`), enabled: Boolean(id) })
}
