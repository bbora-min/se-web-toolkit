import { delay, http, HttpResponse } from 'msw'
import { makeDatasets } from './data'
import { domainDoc, domainSummaries } from './domains'
import { answer, seedThreads, summary } from './ask'
import type { AskThread } from '../api/types'

const datasets = makeDatasets()
let threads: AskThread[] = seedThreads(datasets)

async function devState(url: URL) {
  const s = url.searchParams.get('__state')
  if (s === 'slow') await delay(60_000)
  else await delay(200)
  if (s === 'error') return HttpResponse.json({ message: '카탈로그 인덱스(catalog-01)에 연결할 수 없습니다' }, { status: 502 })
  if (s === 'empty') return HttpResponse.json({ items: [], total: 0, domains: [] })
  return null
}

export const handlers = [
  http.get('/api/datasets', async ({ request }) => {
    const url = new URL(request.url)
    const forced = await devState(url)
    if (forced) return forced
    const q = url.searchParams.get('q')?.toLowerCase()
    const domain = url.searchParams.get('domain')
    const quick = url.searchParams.get('quick')
    const items = datasets.filter(
      (d) =>
        (!q || d.name.includes(q) || d.owner.includes(q) || d.columns.some((c) => c.name.includes(q)) || d.tags.some((t) => t.includes(q))) &&
        (!domain || d.domain === domain) &&
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
