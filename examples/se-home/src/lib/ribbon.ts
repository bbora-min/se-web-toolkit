import type { RibbonEvent, TimelineRibbonProps } from '@se/ui'
import type { Home } from '../api/types'

/** 홈 데이터 → 시그니처(타임라인 리본) props. 홈과 아이덴티티 시트 미리보기가 같은 것을 그린다 */
export function toRibbon(d: Home): Pick<TimelineRibbonProps, 'from' | 'to' | 'now' | 'events' | 'lanes' | 'headline'> {
  const nowMs = Date.parse(d.generatedAt)
  const byId = new Map(d.services.map((s) => [s.id, s.name]))
  const events: RibbonEvent[] = d.events.map((e) => ({ id: e.id, at: e.at, until: e.until, label: e.label, tone: e.tone, lane: byId.get(e.serviceId) ?? e.serviceId }))
  let deploys = 0, incidents = 0
  for (const e of events) {
    if (e.tone === 'success') deploys++
    else if (e.tone === 'danger') incidents++
  }
  return {
    from: new Date(nowMs - 24 * 3_600_000).toISOString(),
    to: new Date(nowMs + 8 * 3_600_000).toISOString(),
    now: d.generatedAt,
    events,
    lanes: d.services.map((s) => s.name),
    headline: `지난 24시간 · 배포 ${deploys} · 장애 ${incidents}`,
  }
}
