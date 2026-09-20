import { useQuery } from '@tanstack/react-query'
import { api } from './client'
import type { Home } from './types'

/** 홈 한 화면의 재료 전부 — 서비스·최근·이벤트·온콜·공지. 30초마다 갱신 */
export function useHome() {
  return useQuery({
    queryKey: ['home'],
    queryFn: () => api<Home>('/home'),
    refetchInterval: 30_000,
  })
}
