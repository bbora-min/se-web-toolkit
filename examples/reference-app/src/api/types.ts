import type { JobState } from '@se/tokens'

export type { JobState }

export interface Job {
  id: string
  name: string
  pipeline: string
  state: JobState
  owner: string
  /** ISO */
  startedAt: string
  /** 초. 실행 중이면 현재까지 */
  durationSec: number | null
  attempts: number
  node: string
  /** 마지막 로그 몇 줄 */
  logTail: string[]
  error?: string
}

export interface MetricPoint {
  value: number
  /** 전기(어제 같은 시각) 대비 */
  delta: number
  /** 최근 24시간, 시간별 */
  series: number[]
}

export interface ClusterSummary {
  health: 'ok' | 'degraded' | 'down'
  headline: string
  running: MetricPoint
  pending: MetricPoint
  failed24h: MetricPoint
  /** 0–100 */
  successRate: MetricPoint
  nodesOnline: number
  nodesTotal: number
  updatedAt: string
}
