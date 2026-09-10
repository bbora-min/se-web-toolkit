import { delay, http, HttpResponse } from 'msw'
import type { ClusterSummary, Job, Overview } from '../api/types'
import { makeJobs, makeLogs } from './data'

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

function overview(range: '24h' | '7d'): Overview {
  const n = range === '24h' ? 24 : 7 * 24
  const now = Date.now()
  const hourly = Array.from({ length: n }, (_, i) => {
    const t = new Date(now - (n - 1 - i) * 3600_000)
    t.setMinutes(0, 0, 0)
    const h = t.getHours()
    const busy = h >= 1 && h <= 6 ? 1.8 : h >= 9 && h <= 18 ? 1.2 : 0.6
    let x = (i * 2654435761 + 97) % 2147483648
    const r = () => ((x = (x * 1103515245 + 12345) % 2147483648) / 2147483648)
    const succeeded = Math.round(6 * busy + r() * 8)
    const failed = r() < 0.35 ? Math.round(r() * 3) : 0
    const cancelled = r() < 0.15 ? 1 : 0
    return { hour: t.toISOString(), succeeded, failed, cancelled }
  })
  const pipelines = [...new Set(jobs.map((j) => j.pipeline))].map((name, i) => {
    const runs = 20 + ((i * 37) % 60)
    const rate = [99.2, 97.5, 91.4, 100, 88.9, 95.8][i % 6]!
    return { name, runs, successRate: rate, p50Sec: [420, 1300, 260, 3900, 2100, 720][i % 6]! }
  })
  const nodes = [
    { name: 'wk-01', status: 'online' as const, cpu: 62, mem: 71, running: 2 },
    { name: 'wk-02', status: 'online' as const, cpu: 48, mem: 55, running: 2 },
    { name: 'wk-03', status: 'degraded' as const, cpu: 93, mem: 88, running: 1 },
    { name: 'wk-04', status: 'online' as const, cpu: 21, mem: 40, running: 1 },
    { name: 'gpu-01', status: 'online' as const, cpu: 77, mem: 83, running: 1 },
  ]
  const queueWait = hourly.map((b, i) => {
    const base = 20 + (i % 6) * 6
    const spike = i === Math.floor(n * 0.7) ? 90 : 0
    return { t: b.hour, p50: base + spike * 0.3, p95: base * 2.6 + spike }
  })
  return {
    range,
    hourly,
    pipelines: pipelines.sort((a, b) => a.successRate - b.successRate),
    recentFailures: jobs.filter((j) => j.state === 'failed').slice(0, 5),
    nodes,
    queueWait,
  }
}

export const handlers = [
  http.get('/api/overview', async ({ request }) => {
    const url = new URL(request.url)
    const forced = await devState(url)
    if (forced && forced.status !== 200) return forced
    return HttpResponse.json(overview(url.searchParams.get('range') === '7d' ? '7d' : '24h'))
  }),
  http.get('/api/jobs', async ({ request }) => {
    const url = new URL(request.url)
    const forced = await devState(url)
    if (forced) return forced
    const q = url.searchParams.get('q')?.toLowerCase()
    const state = url.searchParams.get('state')
    const pipeline = url.searchParams.get('pipeline')
    const sort = url.searchParams.get('sort') ?? 'startedAt'
    const dir = url.searchParams.get('dir') === 'asc' ? 1 : -1
    const page = Number(url.searchParams.get('page') ?? 0)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 25)
    const base = jobs.filter(
      (j) =>
        (!q || j.name.toLowerCase().includes(q) || j.owner.includes(q) || j.id.includes(q)) &&
        (!pipeline || j.pipeline === pipeline),
    )
    // 탭 카운트는 상태 필터를 뺀 기준
    const counts: Record<string, number> = { '': base.length }
    for (const j of base) counts[j.state] = (counts[j.state] ?? 0) + 1
    const filtered = state ? base.filter((j) => j.state === state) : base
    const sorted = [...filtered].sort((a, b) => {
      const av = a[sort as keyof Job] ?? '', bv = b[sort as keyof Job] ?? ''
      return (av < bv ? -1 : av > bv ? 1 : 0) * dir
    })
    return HttpResponse.json({
      items: sorted.slice(page * pageSize, (page + 1) * pageSize),
      total: filtered.length,
      counts,
      pipelines: [...new Set(jobs.map((j) => j.pipeline))].sort(),
    })
  }),
  http.get('/api/jobs/:id/logs', async ({ params }) => {
    await delay(150)
    const j = jobs.find((x) => x.id === params.id)
    if (!j) return HttpResponse.json({ message: '잡을 찾을 수 없습니다' }, { status: 404 })
    return HttpResponse.json({ lines: makeLogs(j), live: j.state === 'running' })
  }),
  http.post('/api/jobs/bulk', async ({ request }) => {
    await delay(500)
    const { ids, action } = (await request.json()) as { ids: string[]; action: 'retry' | 'cancel' }
    let n = 0
    for (const j of jobs) {
      if (!ids.includes(j.id)) continue
      if (action === 'retry' && (j.state === 'failed' || j.state === 'cancelled')) { j.state = 'pending'; j.attempts += 1; j.error = undefined; j.durationSec = null; j.node = '—'; n++ }
      if (action === 'cancel' && (j.state === 'running' || j.state === 'pending')) { j.state = 'cancelled'; n++ }
    }
    jobs = [...jobs]
    return HttpResponse.json({ affected: n })
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
