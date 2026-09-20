import type { RibbonTone } from '@se/ui'

/** 서비스의 지금 상태 — 카드의 점과 문장 */
export type Health = 'ok' | 'degraded' | 'down'

/** 레지스트리의 형제 서비스 + 운영 정보 */
export interface Service {
  id: string
  name: string
  description: string
  /** 액센트 hue — 카드의 마크 색 */
  hue: number
  monogram: string
  shell: 'sidebar' | 'topnav' | 'panes'
  signature: string
  url: string
  team: string
  owner: string
  health: Health
  /** 상태 한 줄 — "실패 163 · 노드 5/5" */
  headline: string
  lastDeploy: { version: string; at: string } | null
  openIncidents: number
}

export type RecentKind = '잡' | '데이터셋' | '릴리스' | '런북' | '인시던트'

/** 내가 최근에 본 것 — 서비스를 가로지른다 */
export interface RecentItem {
  id: string
  serviceId: string
  kind: RecentKind
  label: string
  url: string
  at: string
}

/** 가족 전체의 지난 24시간 — 시그니처(타임라인 리본)의 재료 */
export interface HomeEvent {
  id: string
  serviceId: string
  at: string
  until?: string
  label: string
  tone: RibbonTone
}

export interface Oncall {
  name: string
  team: string
  until: string
  next: { name: string; from: string }
  /** 교대표 링크 — 온콜 서비스의 주소는 백엔드가 안다 */
  scheduleUrl?: string
}

/** 빠른 진입 칩 — 주소는 백엔드가 `services[].url` 로 만든다. 화면에 호스트를 적지 않는다 */
export interface QuickLink {
  id: string
  label: string
  href: string
  count?: number
  tone?: 'danger'
}

export interface Notice {
  id: string
  kind: 'freeze' | 'notice'
  title: string
  detail: string
  at: string
}

export interface Home {
  me: { name: string }
  generatedAt: string
  services: Service[]
  recent: RecentItem[]
  events: HomeEvent[]
  oncall: Oncall
  notices: Notice[]
  quick: QuickLink[]
}
