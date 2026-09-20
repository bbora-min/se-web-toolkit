import { delay, http, HttpResponse } from 'msw'
import type { ClusterSummary, Job, JobState, Overview } from '../api/types'
import { makeJobs, makeLogs } from './data'

let jobs: Job[] = makeJobs()
/** 시연 별칭은 처음 해석한 잡에 고정된다 — 재시도로 상태가 바뀌어도 다른 잡으로 튀지 않는다 */
const aliasPins = new Map<string, string>()
function resolveJob(id: string): Job | undefined {
  if (id === 'demo-failed' || id === 'demo-running') {
    const pinned = aliasPins.get(id)
    const j = (pinned ? jobs.find((x) => x.id === pinned) : undefined) ?? jobs.find((x) => x.state === (id === 'demo-failed' ? 'failed' : 'running'))
    if (j) aliasPins.set(id, j.id)
    return j
  }
  return jobs.find((x) => x.id === id)
}
/** 라이브 데모의 로그는 자라지 않는다 — 스크린샷이 매번 같아야 한다 */
const demoLogs = new Map<string, string[]>()

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
  // 실패 원인 — 에러 문자열의 첫 단어로 묶는다(OOMKilled · Timeout · S3 · Schema …)
  const since = now - n * 3600_000
  const failed = jobs.filter((j) => j.state === 'failed' && Date.parse(j.startedAt) >= since)
  const byCause = new Map<string, number>()
  for (const j of failed) {
    const cause = (j.error ?? '알 수 없음').split(/[\s:(]/)[0] || '알 수 없음'
    byCause.set(cause, (byCause.get(cause) ?? 0) + 1)
  }
  const failureCauses = [...byCause.entries()]
    .map(([cause, count]) => ({ cause, count, share: failed.length ? Math.round((count / failed.length) * 100) : 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
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
    failureCauses,
  }
}

/** 파이프라인 태스크 DAG — 마지막 실행의 상태로 노드 상태를 만든다 */
const TASKS: Record<string, Array<[string, string[]]>> = {
  'etl-daily': [['extract', []], ['validate', ['extract']], ['transform-a', ['validate']], ['transform-b', ['validate']], ['load', ['transform-a', 'transform-b']], ['publish', ['load']]],
  'export-s3': [['read-partitions', []], ['compress', ['read-partitions']], ['upload', ['compress']], ['verify', ['upload']]],
  'report-hourly': [['collect', []], ['aggregate', ['collect']], ['render', ['aggregate']], ['notify', ['render']]],
  backfill: [['plan', []], ['replay-1', ['plan']], ['replay-2', ['plan']], ['replay-3', ['plan']], ['merge', ['replay-1', 'replay-2', 'replay-3']]],
  'model-train': [['features', []], ['split', ['features']], ['train', ['split']], ['evaluate', ['train']], ['register', ['evaluate']]],
  'index-rebuild': [['snapshot', []], ['build-a', ['snapshot']], ['build-b', ['snapshot']], ['swap', ['build-a', 'build-b']]],
}
const SCHEDULE: Record<string, string> = { 'etl-daily': '0 1 * * *', 'export-s3': '30 */2 * * *', 'report-hourly': '5 * * * *', backfill: 'manual', 'model-train': '0 3 * * 1', 'index-rebuild': '0 4 * * *' }
function pipeline(name: string) {
  const spec = TASKS[name]
  if (!spec) return null
  const runs = jobs.filter((j) => j.pipeline === name).sort((a, b) => b.startedAt.localeCompare(a.startedAt))
  const last = runs[0]
  if (!last) return null
  const n = spec.length
  // 실패면 뒤에서 두 번째 태스크가 실패, 실행 중이면 중간 태스크가 실행 중
  const failAt = last.state === 'failed' ? Math.max(1, n - 2) : -1
  const runAt = last.state === 'running' ? Math.floor(n / 2) : -1
  const tasks = spec.map(([id, upstream], i) => {
    let state: JobState = 'succeeded'
    if (last.state === 'pending') state = 'pending'
    else if (last.state === 'cancelled') state = i < Math.floor(n / 2) ? 'succeeded' : 'cancelled'
    else if (failAt >= 0) state = i < failAt ? 'succeeded' : i === failAt ? 'failed' : 'pending'
    else if (runAt >= 0) state = i < runAt ? 'succeeded' : i === runAt ? 'running' : 'pending'
    const done = state === 'succeeded' || state === 'failed' || state === 'running'
    return { id, name: id, state, upstream, durationSec: done ? 40 + ((i * 97 + name.length * 13) % 700) : null, node: done ? last.node : undefined, attempts: state === 'failed' ? last.attempts : 1, error: state === 'failed' ? last.error : undefined }
  })
  return { name, schedule: SCHEDULE[name] ?? 'manual', owner: last.owner, lastRun: { jobId: last.id, state: last.state, startedAt: last.startedAt, durationSec: last.durationSec }, tasks }
}

export const handlers = [
  http.get('/api/pipelines', async ({ request }) => {
    const forced = await devState(new URL(request.url))
    if (forced && forced.status !== 200) return forced
    const items = Object.keys(TASKS).flatMap((name) => { const p = pipeline(name); return p ? [{ name, lastState: p.lastRun.state }] : [] })
    return HttpResponse.json({ items })
  }),
  http.get('/api/pipelines/:name', async ({ params, request }) => {
    const forced = await devState(new URL(request.url))
    if (forced && forced.status !== 200) return forced
    const p = pipeline(String(params.name))
    return p ? HttpResponse.json(p) : HttpResponse.json({ message: '파이프라인을 찾을 수 없습니다' }, { status: 404 })
  }),
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
        (!q || j.name.toLowerCase().includes(q) || j.owner.includes(q) || j.id.includes(q) || (j.error?.toLowerCase().includes(q) ?? false)) &&
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
  /** 잡 하나. `demo-failed`·`demo-running` 은 시연·스크린샷용 별칭 — 시드 데이터의 첫 실패·첫 실행 중 잡 */
  http.get('/api/jobs/:id', async ({ params, request }) => {
    const forced = await devState(new URL(request.url))
    if (forced && forced.status !== 200) return forced
    const j = resolveJob(String(params.id))
    if (!j) return HttpResponse.json({ message: '잡을 찾을 수 없습니다' }, { status: 404 })
    return HttpResponse.json(j)
  }),
  http.get('/api/jobs/:id/logs', async ({ params, request }) => {
    await delay(150)
    const forced = await devState(new URL(request.url))
    if (forced && forced.status !== 200) return forced
    const id = String(params.id)
    const j = resolveJob(id)
    if (!j) return HttpResponse.json({ message: '잡을 찾을 수 없습니다' }, { status: 404 })
    if (id.startsWith('demo-')) {
      if (!demoLogs.has(id)) demoLogs.set(id, makeLogs(j))
      return HttpResponse.json({ lines: demoLogs.get(id), live: j.state === 'running' })
    }
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
