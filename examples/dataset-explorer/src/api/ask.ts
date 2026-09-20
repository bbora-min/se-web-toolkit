import { useQuery } from '@tanstack/react-query'
import { api } from './client'
import type { AskMessage, AskThread, AskThreadSummary } from './types'

/** 최근 스레드 — 왼쪽 목록 */
export function useThreads() {
  return useQuery({ queryKey: ['ask', 'threads'], queryFn: () => api<{ items: AskThreadSummary[] }>('/ask/threads') })
}

/** 스레드 하나(과거 대화) */
export function useThread(id: string | undefined) {
  return useQuery({ queryKey: ['ask', 'threads', id], queryFn: () => api<AskThread>(`/ask/threads/${id}`), enabled: Boolean(id) })
}

/** 질문 하나 → 답 하나. 실제 백엔드는 SSE·chunk 로 스트리밍 — 그때 이 함수가 `fetch` 스트림을 이어 붙인다 */
export function ask(body: { threadId?: string; text: string }) {
  return api<{ threadId: string; message: AskMessage }>('/ask', { method: 'POST', body: JSON.stringify(body) })
}
