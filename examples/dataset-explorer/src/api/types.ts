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
