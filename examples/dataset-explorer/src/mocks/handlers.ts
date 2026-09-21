import { delay, http, HttpResponse } from 'msw'
import { makeDatasets } from './data'
import { domainDoc, domainSummaries } from './domains'
import { answer, seedThreads, summary } from './ask'
import type { AskThread, OwnerSummary, TagSummary } from '../api/types'

const datasets = makeDatasets()
let threads: AskThread[] = seedThreads(datasets)

async function devState(url: URL) {
  const s = url.searchParams.get('__state')
  if (s === 'slow') await delay(60_000)
  else await delay(200)
  if (s === 'error') return HttpResponse.json({ message: '카탈로그 인덱스(catalog-01)에 연결할 수 없습니다' }, { status: 502 })
  if (s === 'empty') return HttpResponse.json({ items: [], total: 0, domains: [], counts: {} })
  return null
}

/** 태그의 뜻 — 카탈로그 규약. 화면은 이 문장을 그대로 보여 준다 */
const TAG_DESC: Record<string, string> = {
  core: '조직의 핵심 지표가 이 테이블에서 나온다. 스키마 변경은 공지 필수',
  pii: '개인정보 컬럼 포함. 외부 리포트엔 해시 값만, 조인 키로만 쓴다',
  'tier-1': 'SLA 위반 시 온콜 호출. 갱신 지연이 곧 장애',
  deprecated: '대체 테이블이 있다. 새 쿼리에서 쓰지 않는다',
  experimental: '스키마가 예고 없이 바뀔 수 있다. 대시보드에 붙이지 않는다',
  certified: '데이터 거버넌스 검토를 통과했다. 리포트의 기준 소스',
  gdpr: 'GDPR 삭제 요청 대상. 보존 기간 규칙을 따른다',
}
function owners(): OwnerSummary[] {
  const by = new Map<string, OwnerSummary>()
  for (const d of datasets) {
    const o = by.get(d.owner) ?? { name: d.owner, team: d.team, datasets: 0, stale: 0, pii: 0, certified: 0, queries30d: Array.from({ length: 30 }, () => 0), domains: [] }
    o.datasets++
    if (d.freshness !== 'fresh') o.stale++
    if (d.tags.includes('pii')) o.pii++
    if (d.tags.includes('certified')) o.certified++
    d.queries30d.forEach((q, i) => (o.queries30d[i] = (o.queries30d[i] ?? 0) + q))
    if (!o.domains.includes(d.domain)) o.domains.push(d.domain)
    by.set(d.owner, o)
  }
  return [...by.values()].sort((a, b) => a.team.localeCompare(b.team) || b.datasets - a.datasets)
}
function tags(): TagSummary[] {
  const by = new Map<string, TagSummary>()
  for (const d of datasets)
    for (const t of d.tags) {
      const s = by.get(t) ?? { name: t, description: TAG_DESC[t] ?? '', count: 0, stale: 0, domains: [] }
      s.count++
      if (d.freshness !== 'fresh') s.stale++
      if (!s.domains.includes(d.domain)) s.domains.push(d.domain)
      by.set(t, s)
    }
  return [...by.values()].sort((a, b) => b.count - a.count)
}

export const handlers = [
  http.get('/api/datasets', async ({ request }) => {
    const url = new URL(request.url)
    const forced = await devState(url)
    if (forced) return forced
    const q = url.searchParams.get('q')?.toLowerCase()
    const domain = url.searchParams.get('domain')
    const quick = url.searchParams.get('quick')
    const owner = url.searchParams.get('owner')
    const tag = url.searchParams.get('tag')
    const items = datasets.filter(
      (d) =>
        (!q || d.name.includes(q) || d.owner.includes(q) || d.columns.some((c) => c.name.includes(q)) || d.tags.some((t) => t.includes(q))) &&
        (!domain || d.domain === domain) &&
        (!owner || d.owner === owner) &&
        (!tag || d.tags.includes(tag)) &&
        (!quick ||
          (quick === 'mine' && d.owner === 'bora') ||
          (quick === 'stale' && d.freshness !== 'fresh') ||
          (quick === 'pii' && d.tags.includes('pii')) ||
          (quick === 'certified' && d.tags.includes('certified'))),
    )
    return HttpResponse.json({
      items: items.map(({ columns, ...rest }) => ({ ...rest, columnCount: columns.length })),
      total: datasets.length,
      domains: [...new Set(datasets.map((d) => d.domain))],
      counts: {
        mine: datasets.filter((d) => d.owner === 'bora').length,
        stale: datasets.filter((d) => d.freshness !== 'fresh').length,
        pii: datasets.filter((d) => d.tags.includes('pii')).length,
        certified: datasets.filter((d) => d.tags.includes('certified')).length,
      },
    })
  }),
  http.get('/api/owners', async ({ request }) => {
    const forced = await devState(new URL(request.url))
    if (forced) return forced.status === 200 ? HttpResponse.json({ items: [] }) : forced
    return HttpResponse.json({ items: owners() })
  }),
  http.get('/api/tags', async ({ request }) => {
    const forced = await devState(new URL(request.url))
    if (forced) return forced.status === 200 ? HttpResponse.json({ items: [] }) : forced
    return HttpResponse.json({ items: tags() })
  }),
  http.get('/api/ask/threads', async ({ request }) => {
    const forced = await devState(new URL(request.url))
    if (forced && forced.status !== 200) return forced
    return HttpResponse.json({ items: [...threads].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map(summary) })
  }),
  http.get('/api/ask/threads/:id', async ({ params, request }) => {
    const forced = await devState(new URL(request.url))
    if (forced && forced.status !== 200) return forced
    const t = threads.find((x) => x.id === params.id)
    return t ? HttpResponse.json(t) : HttpResponse.json({ message: '대화를 찾을 수 없어요' }, { status: 404 })
  }),
  /** 질문 → 답. 실제 백엔드는 SSE 로 흘려 준다 — 목은 한 번에 */
  http.post('/api/ask', async ({ request }) => {
    const url = new URL(request.url)
    await delay(700)
    if (url.searchParams.get('__state') === 'error') return HttpResponse.json({ message: '어시스턴트(assistant-01)가 응답하지 않아요' }, { status: 502 })
    const { threadId, text } = (await request.json()) as { threadId?: string; text: string }
    const now = new Date().toISOString()
    let t = threadId ? threads.find((x) => x.id === threadId) : undefined
    if (!t) {
      t = { id: `t${Date.now().toString(36)}`, title: text.slice(0, 40), updatedAt: now, messages: [] }
      threads = [t, ...threads]
    }
    const a = answer(text, datasets)
    const message = { id: `${t.id}-${t.messages.length + 1}`, role: 'assistant' as const, text: a.text, citations: a.citations, at: now }
    t.messages.push({ id: `${t.id}-u${t.messages.length}`, role: 'user', text, at: now }, message)
    t.updatedAt = now
    return HttpResponse.json({ threadId: t.id, message })
  }),
  http.get('/api/domains', async ({ request }) => {
    const forced = await devState(new URL(request.url))
    if (forced && forced.status !== 200) return forced
    return HttpResponse.json({ items: domainSummaries(datasets) })
  }),
  http.get('/api/domains/:id', async ({ params, request }) => {
    const url = new URL(request.url)
    const forced = await devState(url)
    if (forced && forced.status !== 200) return forced
    const doc = domainDoc(String(params.id), datasets)
    if (!doc) return HttpResponse.json({ message: '그런 도메인이 없어요' }, { status: 404 })
    if (url.searchParams.get('__state') === 'empty') return HttpResponse.json({ ...doc, sections: [] })
    return HttpResponse.json(doc)
  }),
  http.get('/api/datasets/:id', async ({ params, request }) => {
    const forced = await devState(new URL(request.url))
    if (forced && forced.status !== 200) return forced
    const d = datasets.find((x) => x.id === params.id)
    if (!d) return HttpResponse.json({ message: '데이터셋을 찾을 수 없습니다' }, { status: 404 })
    return HttpResponse.json(d)
  }),
]
