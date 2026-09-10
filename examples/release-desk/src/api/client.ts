/**
 * API 클라이언트. 백엔드는 비표준이므로 여기서만 접점을 가진다.
 * 개발 중엔 MSW가 같은 경로를 목으로 응답한다.
 *
 * 화면 상태를 강제로 보려면 URL에 `?__state=empty|error|slow` 를 붙인다 (개발 전용).
 */
const BASE = import.meta.env.VITE_API_BASE ?? '/api'

function devState(): string | null {
  if (!import.meta.env.DEV) return null
  return new URLSearchParams(location.search).get('__state')
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const url = new URL(BASE + path, location.origin)
  const s = devState()
  if (s) url.searchParams.set('__state', s)
  const res = await fetch(url, { headers: { 'content-type': 'application/json' }, ...init })
  if (!res.ok) {
    let msg = res.statusText
    try {
      msg = ((await res.json()) as { message?: string }).message ?? msg
    } catch {
      /* 본문 없음 */
    }
    throw new ApiError(res.status, msg)
  }
  return res.json() as Promise<T>
}
