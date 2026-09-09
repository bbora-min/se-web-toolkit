import { delay, http, HttpResponse } from 'msw'
import { makeDatasets } from './data'

const datasets = makeDatasets()

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
  http.get('/api/datasets/:id', async ({ params, request }) => {
    const forced = await devState(new URL(request.url))
    if (forced && forced.status !== 200) return forced
    const d = datasets.find((x) => x.id === params.id)
    if (!d) return HttpResponse.json({ message: '데이터셋을 찾을 수 없습니다' }, { status: 404 })
    return HttpResponse.json(d)
  }),
]
