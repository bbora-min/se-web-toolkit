/**
 * API 클라이언트 팩토리 — 백엔드는 팀마다 다르니 접점은 이 한 곳.
 *   export const api = createApiClient()           // VITE_API_BASE 또는 /api (MSW 목)
 *   const list = await api<JobList>('/jobs?page=0')
 * 개발 중 URL의 `?__state=empty|error|slow` 를 요청에 실어 화면 3상태를 강제할 수 있다.
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export interface ApiClientOptions {
  /** 기본: import.meta.env.VITE_API_BASE 또는 '/api' */
  base?: string
  /** 요청마다 붙일 헤더(인증 등). 함수면 매 호출 시 계산 */
  headers?: Record<string, string> | (() => Record<string, string>)
  /** 개발 전용 상태 강제 파라미터 전달 여부 (기본: DEV에서만) */
  devState?: boolean
}

export function createApiClient(opts: ApiClientOptions = {}) {
  const env = (import.meta as unknown as { env?: Record<string, string | boolean | undefined> }).env ?? {}
  const base = opts.base ?? (typeof env.VITE_API_BASE === 'string' && env.VITE_API_BASE ? env.VITE_API_BASE : '/api')
  const devState = opts.devState ?? Boolean(env.DEV)
  return async function api<T>(path: string, init?: RequestInit): Promise<T> {
    const url = new URL(base + path, location.origin)
    if (devState) {
      const s = new URLSearchParams(location.search).get('__state')
      if (s) url.searchParams.set('__state', s)
    }
    const extra = typeof opts.headers === 'function' ? opts.headers() : (opts.headers ?? {})
    const res = await fetch(url, { ...init, headers: { 'content-type': 'application/json', ...extra, ...(init?.headers as Record<string, string> | undefined) } })
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
}
