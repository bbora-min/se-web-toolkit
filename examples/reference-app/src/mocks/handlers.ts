import { delay, http, HttpResponse } from 'msw'
import type { ClusterSummary, Job } from '../api/types'
import { makeJobs } from './data'

let jobs: Job[] = makeJobs()

/** 결정적 시계열 — 현재값으로 끝나는 24포인트 */
function series(end: number, spread: number, seed: number): number[] {
  let x = seed
  const out: number[] = []
  let v = end
  for (let i = 0; i < 23; i++) {
    x = (x * 1103515245 + 12345) % 2147483648
    v = Math.max(0, v + ((x / 2147483648) - 0.5) * spread)
    out.unshift(Math.round(v * 10) / 10)
  }
  out.push(end)
  return out
}

function summary(): ClusterSummary {
  const count = (s: string) => jobs.filter((j) => j.state === s).length
  const running = count('running')
  const pending = count('pending')
  const failed = count('failed')
  const finished = count('succeeded') + failed
  const rate = finished ? Math.round((count('succeeded') / finished) * 1000) / 10 : 100
  const health = failed > 6 ? 'degraded' : 'ok'
  return {
    health,
    headline: health === 'ok' ? '클러스터 정상' : '일부 잡 실패 증가',
    running: { value: running, delta: running - 9, series: series(running, 4, 11) },
    pending: { value: pending, delta: pending - 12, series: series(pending, 5, 23) },
    failed24h: { value: failed, delta: failed - 2, series: series(failed, 2, 37) },
    successRate: { value: rate, delta: Math.round((rate - 94.1) * 10) / 10, series: series(rate, 3, 53) },
    nodesOnline: 5,
    nodesTotal: 5,
    updatedAt: new Date().toISOString(),
  }
}

/** ?__state=empty|error|slow 로 화면 상태를 강제한다 (개발·스크린샷 리뷰용) */
async function devState(url: URL) {
  const s = url.searchParams.get('__state')
  if (s === 'slow') await delay(60_000)
  else await delay(250)
  if (s === 'error') return HttpResponse.json({ message: '스케줄러 API(scheduler-01)에 연결할 수 없습니다' }, { status: 502 })
  if (s === 'empty') return HttpResponse.json({ items: [], pipelines: [] })
  return null
}

export const handlers = [
  http.get('/api/jobs', async ({ request }) => {
    const url = new URL(request.url)
    const forced = await devState(url)
    if (forced) return forced
    const q = url.searchParams.get('q')?.toLowerCase()
    const state = url.searchParams.get('state')
    const pipeline = url.searchParams.get('pipeline')
    const items = jobs.filter(
      (j) =>
        (!q || j.name.toLowerCase().includes(q) || j.owner.includes(q) || j.id.includes(q)) &&
        (!state || j.state === state) &&
        (!pipeline || j.pipeline === pipeline),
    )
    return HttpResponse.json({ items, pipelines: [...new Set(jobs.map((j) => j.pipeline))].sort() })
  }),
  http.get('/api/summary', async ({ request }) => {
    const forced = await devState(new URL(request.url))
    if (forced && forced.status !== 200) return forced
    return HttpResponse.json(summary())
  }),
  http.post('/api/jobs/:id/retry', async ({ params }) => {
    await delay(400)
    const j = jobs.find((x) => x.id === params.id)
    if (!j) return HttpResponse.json({ message: '잡을 찾을 수 없습니다' }, { status: 404 })
    j.state = 'pending'
    j.attempts += 1
    j.error = undefined
    j.durationSec = null
    j.node = '—'
    j.startedAt = new Date().toISOString()
    jobs = [...jobs]
    return HttpResponse.json(j)
  }),
  http.post('/api/jobs/:id/cancel', async ({ params }) => {
    await delay(400)
    const j = jobs.find((x) => x.id === params.id)
    if (!j) return HttpResponse.json({ message: '잡을 찾을 수 없습니다' }, { status: 404 })
    j.state = 'cancelled'
    jobs = [...jobs]
    return HttpResponse.json(j)
  }),
]
