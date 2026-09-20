export type Freshness = 'fresh' | 'stale' | 'broken'

export interface Column {
  name: string
  type: string
  description?: string
  nullable: boolean
  /** 프로필링 결과 — null 비율 0–1 */
  nullRate: number
  pii?: boolean
}

/** 문서 블록 — 백엔드(위키)가 구조화해서 준다. 화면은 타이포만 */
export type DocBlock =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'code'; lang?: string; code: string }
  | { type: 'callout'; tone: 'info' | 'warning'; title?: string; text: string }
  /** 데이터 사전 표 — 데이터셋 목록 */
  | { type: 'datasets'; ids: string[] }
  /** 컬럼 사전 표 — 데이터셋 하나의 컬럼 */
  | { type: 'columns'; dataset: string }
export interface DocSection {
  id: string
  title: string
  blocks: DocBlock[]
}
export interface DomainSummary {
  id: string
  name: string
  title: string
  count: number
}
/** 도메인 가이드 — 문서 골격의 재료 */
export interface DomainDoc {
  id: string
  name: string
  title: string
  summary: string
  ownerTeam: string
  owner: string
  updatedAt: string
  watchers: number
  sections: DocSection[]
  /** 사전 표에 쓸 데이터셋(컬럼 포함) */
  datasets: Dataset[]
}

export interface Dataset {
  id: string
  /** schema.table */
  name: string
  domain: string
  description: string
  owner: string
  team: string
  rows: number
  bytes: number
  freshness: Freshness
  /** ISO — 마지막 갱신 */
  updatedAt: string
  /** SLA (시간). 이 시간 안에 갱신되어야 fresh */
  slaHours: number
  tags: string[]
  columns: Column[]
  upstream: string[]
  downstream: string[]
  /** 최근 30일 일별 조회 수 */
  queries30d: number[]
  sampleQuery: string
  /** 최근 변경 이력 — 스키마·소유자·SLA 등 */
  changes: Array<{ at: string; kind: 'schema' | 'owner' | 'sla' | 'backfill' | 'incident'; summary: string; by: string }>
  /** 같은 도메인·같은 업스트림을 쓰는 이웃 */
  related: string[]
}
