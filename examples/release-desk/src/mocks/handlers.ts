import { delay, http, HttpResponse } from 'msw'
import { CHECKLIST_TEMPLATE, PEOPLE, STAGES, type Release, type ReleaseDraft, type StageId } from '../api/types'
import { makeReleases } from './data'

let releases = makeReleases()
const me = 'bora'

async function devState(url: URL) {
  const s = url.searchParams.get('__state')
  if (s === 'slow') await delay(60_000)
  else await delay(220)
  if (s === 'error') return HttpResponse.json({ message: '릴리스 서비스(release-api)에 연결할 수 없습니다' }, { status: 502 })
  if (s === 'empty') return HttpResponse.json({ items: [], stages: STAGES.map((st) => ({ ...st, count: 0, blocked: 0 })), freeze: null })
  return null
}

function stageCounts() {
  return STAGES.map((st) => ({
    ...st,
    count: releases.filter((r) => r.stage === st.id).length,
    blocked: releases.filter((r) => r.stage === st.id && r.blocked).length,
  }))
}
/** 이번 주 금요일 18시 ~ 월요일 09시 배포 프리즈 */
function freeze() {
  const now = new Date()
  const day = now.getDay()
  const fri = new Date(now)
  fri.setDate(now.getDate() + ((5 - day + 7) % 7))
  fri.setHours(18, 0, 0, 0)
  const mon = new Date(fri.getTime() + 63 * 3600_000)
  return { from: fri.toISOString(), to: mon.toISOString(), reason: '주말 온콜 최소화' }
}
const find = (id: string | readonly string[]) => releases.find((r) => r.id === id)

export const handlers = [
  http.get('/api/releases', async ({ request }) => {
    const url = new URL(request.url)
    const forced = await devState(url)
    if (forced) return forced
    const q = url.searchParams.get('q')?.toLowerCase()
    const stage = url.searchParams.get('stage')
    const service = url.searchParams.get('service')
    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')
    const mine = url.searchParams.get('mine')
    const items = releases.filter(
      (r) =>
        (!q || r.version.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.owner.includes(q) || r.service.includes(q)) &&
        (!stage || r.stage === stage) &&
        (!service || r.service === service) &&
        (!from || r.windowFrom.slice(0, 10) >= from) &&
        (!to || r.windowFrom.slice(0, 10) <= to) &&
        (!mine || r.approvers.some((a) => a.name === me && a.decision === 'pending')),
    )
    return HttpResponse.json({ items, stages: stageCounts(), freeze: freeze() })
  }),
  http.get('/api/releases/:id', async ({ params, request }) => {
    const forced = await devState(new URL(request.url))
    if (forced && forced.status !== 200) return forced
    const r = find(params.id!)
    return r ? HttpResponse.json(r) : HttpResponse.json({ message: '릴리스를 찾을 수 없습니다' }, { status: 404 })
  }),
  http.post('/api/releases', async ({ request }) => {
    await delay(500)
    const d = (await request.json()) as ReleaseDraft
    const now = new Date().toISOString()
    const owner = PEOPLE.find((p) => p.name === me)!
    const r: Release = {
      id: `rel_${Date.now().toString(36)}`,
      version: d.version,
      service: d.service,
      title: d.title,
      type: d.type,
      risk: d.risk,
      stage: 'review',
      owner: owner.name,
      team: owner.team,
      approvers: d.approvers.map((n) => ({ ...PEOPLE.find((p) => p.name === n)!, decision: 'pending' as const })),
      windowFrom: `${d.windowFrom}T10:00:00.000Z`,
      windowTo: `${d.windowTo}T18:00:00.000Z`,
      createdAt: now,
      changes: d.changes.split('\n').map((s) => s.trim()).filter(Boolean),
      checklist: CHECKLIST_TEMPLATE.map((c) => ({ ...c, done: d.checklist.includes(c.id) })),
      rollback: d.rollback,
      timeline: [
        { at: now, who: me, what: `${d.version} 초안 작성`, kind: 'create' },
        { at: now, who: me, what: '코드 검토 단계로 이동', kind: 'stage' },
      ],
      notifySlack: d.notifySlack,
    }
    releases = [r, ...releases]
    return HttpResponse.json(r, { status: 201 })
  }),
  http.post('/api/releases/:id/decision', async ({ params, request }) => {
    await delay(400)
    const r = find(params.id!)
    if (!r) return HttpResponse.json({ message: '릴리스를 찾을 수 없습니다' }, { status: 404 })
    const { decision, comment } = (await request.json()) as { decision: 'approved' | 'rejected'; comment?: string }
    const a = r.approvers.find((x) => x.name === me) ?? r.approvers[0]!
    a.decision = decision
    a.comment = comment
    a.at = new Date().toISOString()
    r.timeline.push({ at: a.at, who: me, what: decision === 'approved' ? '승인' : `반려 — ${comment ?? ''}`, kind: decision === 'approved' ? 'approve' : 'reject' })
    if (decision === 'rejected') {
      r.stage = 'review'
      r.blocked = '반려됨 — 수정 후 다시 제출'
    } else if (r.approvers.every((x) => x.decision === 'approved')) {
      r.stage = 'deploy'
      r.blocked = undefined
      r.timeline.push({ at: new Date().toISOString(), who: 'system', what: '전원 승인 — 배포 단계로 이동', kind: 'stage' })
    }
    releases = [...releases]
    return HttpResponse.json(r)
  }),
  http.post('/api/releases/:id/advance', async ({ params }) => {
    await delay(400)
    const r = find(params.id!)
    if (!r) return HttpResponse.json({ message: '릴리스를 찾을 수 없습니다' }, { status: 404 })
    const order: StageId[] = ['draft', 'review', 'staging', 'approval', 'deploy', 'done']
    const next = order[Math.min(order.indexOf(r.stage) + 1, order.length - 1)]!
    r.stage = next
    r.blocked = undefined
    r.timeline.push({ at: new Date().toISOString(), who: me, what: `${STAGES.find((s) => s.id === next)!.label} 단계로 이동`, kind: next === 'done' ? 'deploy' : 'stage' })
    releases = [...releases]
    return HttpResponse.json(r)
  }),
  http.post('/api/releases/:id/checklist', async ({ params, request }) => {
    await delay(150)
    const r = find(params.id!)
    if (!r) return HttpResponse.json({ message: '릴리스를 찾을 수 없습니다' }, { status: 404 })
    const { itemId, done } = (await request.json()) as { itemId: string; done: boolean }
    const c = r.checklist.find((x) => x.id === itemId)
    if (c) c.done = done
    releases = [...releases]
    return HttpResponse.json(r)
  }),
]
