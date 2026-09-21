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

export interface HourBucket {
  /** ISO, 정시 */
  hour: string
  succeeded: number
  failed: number
  cancelled: number
}
export interface PipelineStat {
  name: string
  runs: number
  /** 0–100 */
  successRate: number
  p50Sec: number
}
export interface NodeStat {
  name: string
  status: 'online' | 'degraded' | 'offline'
  cpu: number
  mem: number
  running: number
}
export interface QueuePoint {
  t: string
  p50: number
  p95: number
}
/** 파이프라인의 태스크 — DAG 의 노드. 상태는 마지막 실행 기준 */
export interface PipelineTask {
  id: string
  name: string
  state: JobState
  upstream: string[]
  durationSec: number | null
  node?: string
  attempts: number
  error?: string
}
export interface Pipeline {
  name: string
  schedule: string
  owner: string
  lastRun: { jobId: string; state: JobState; startedAt: string; durationSec: number | null }
  tasks: PipelineTask[]
}
export interface FailureCause {
  cause: string
  count: number
  /** 0–100, 실패 전체 대비 */
  share: number
}
export interface Overview {
  range: '24h' | '7d'
  hourly: HourBucket[]
  pipelines: PipelineStat[]
  recentFailures: Job[]
  nodes: NodeStat[]
  queueWait: QueuePoint[]
  failureCauses: FailureCause[]
}

/** 노드 하나 — 개요의 NodeStat 에 상세(라벨·하트비트·24h 추이·올라가 있는 잡)를 더한 것 */
export interface ClusterNode extends NodeStat {
  /** 풀·GPU 같은 스케줄링 라벨 */
  labels: string[]
  uptimeSec: number
  /** ISO — 마지막 하트비트 */
  lastHeartbeat: string
  /** 최근 24시간 CPU · MEM(%) */
  cpuSeries: number[]
  memSeries: number[]
  /** 지금 이 노드에서 도는 잡 */
  jobs: Array<{ id: string; name: string; pipeline: string; state: JobState; durationSec: number | null }>
}

export type ActivityKind = 'failed' | 'retried' | 'cancelled' | 'succeeded' | 'node' | 'schedule'
/** 활동 한 줄 — 잡·노드·스케줄에서 일어난 일을 시간순으로 */
export interface ActivityEvent {
  id: string
  at: string
  kind: ActivityKind
  title: string
  detail?: string
  /** 사람이 한 일이면 누가 */
  who?: string
  jobId?: string
  node?: string
  pipeline?: string
}
export interface ActivityList {
  items: ActivityEvent[]
  /** 종류별 건수(종류 필터 제외 기준). '' 키는 전체 */
  counts: Record<string, number>
}
