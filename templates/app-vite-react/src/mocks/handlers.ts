import { delay, http, HttpResponse } from 'msw'
import type { Item, ItemState } from '../api/types'

const STATES: ItemState[] = ['active', 'active', 'active', 'paused', 'error']
const OWNERS = ['bora', 'jihoon', 'minseo', 'seoyeon']
const items: Item[] = Array.from({ length: 87 }, (_, i) => ({
  id: `item_${(1000 + i).toString(36)}`,
  name: `item-${String(i + 1).padStart(3, '0')}`,
  state: STATES[i % STATES.length]!,
  owner: OWNERS[i % OWNERS.length]!,
  updatedAt: new Date(Date.now() - i * 3_600_000 * 1.7).toISOString(),
  count: Math.round(1000 + Math.sin(i) * 800),
}))

async function devState(url: URL) {
  const s = url.searchParams.get('__state')
  if (s === 'slow') await delay(60_000)
  else await delay(200)
  if (s === 'error') return HttpResponse.json({ message: '백엔드(api-01)에 연결할 수 없습니다' }, { status: 502 })
  if (s === 'empty') return HttpResponse.json({ items: [], total: 0, counts: { '': 0 } })
  return null
}

export const handlers = [
  http.get('/api/items', async ({ request }) => {
    const url = new URL(request.url)
    const forced = await devState(url)
    if (forced) return forced
    const q = url.searchParams.get('q')?.toLowerCase()
    const state = url.searchParams.get('state')
    const page = Number(url.searchParams.get('page') ?? 0)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 25)
    const base = items.filter((it) => !q || it.name.includes(q) || it.owner.includes(q))
    const counts: Record<string, number> = { '': base.length }
    for (const it of base) counts[it.state] = (counts[it.state] ?? 0) + 1
    const filtered = state ? base.filter((it) => it.state === state) : base
    return HttpResponse.json({ items: filtered.slice(page * pageSize, (page + 1) * pageSize), total: filtered.length, counts })
  }),
]
