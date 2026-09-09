import type { Job, JobState } from '../api/types'

/* 결정적 의사난수 — 새로고침해도 같은 데이터 */
let seed = 20260909
function rnd() {
  seed = (seed * 1664525 + 1013904223) % 4294967296
  return seed / 4294967296
}
const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(rnd() * xs.length)]!

const PIPELINES = ['etl-daily', 'index-rebuild', 'report-hourly', 'backfill', 'model-train', 'export-s3'] as const
const OWNERS = ['bora', 'jihoon', 'minseo', 'data-platform', 'ml-infra'] as const
const NODES = ['wk-01', 'wk-02', 'wk-03', 'wk-04', 'gpu-01'] as const
const STATES: JobState[] = ['succeeded', 'succeeded', 'succeeded', 'running', 'pending', 'failed', 'cancelled']
const ERRORS = [
  'OOMKilled: container exceeded memory limit (8Gi)',
  'Timeout after 3600s waiting for upstream table events.clicks_v3',
  'S3 PutObject AccessDenied for bucket se-exports',
  'Schema mismatch: column `user_id` expected INT64, got STRING',
]

function logLines(j: Pick<Job, 'name' | 'state' | 'error'>): string[] {
  const t = (s: number) => `2026-09-09T${String(9 + Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}Z`
  const lines = [
    `${t(0)} INFO  starting ${j.name}`,
    `${t(2)} INFO  resolved 3 upstream dependencies`,
    `${t(14)} INFO  reading partition dt=2026-09-08 (1,204,113 rows)`,
    `${t(131)} INFO  stage 2/4 transform 80%`,
  ]
  if (j.state === 'failed') lines.push(`${t(140)} ERROR ${j.error}`, `${t(140)} ERROR exit code 137`)
  else if (j.state === 'succeeded') lines.push(`${t(190)} INFO  wrote 1,204,113 rows to fct.events_daily`, `${t(191)} INFO  done`)
  else if (j.state === 'running') lines.push(`${t(150)} INFO  stage 3/4 write`)
  return lines
}

export function makeJobs(count = 64): Job[] {
  const jobs: Job[] = []
  const base = Date.now() - 20 * 60_000
  for (let i = 0; i < count; i++) {
    const pipeline = pick(PIPELINES)
    const state = pick(STATES)
    const startedAt = new Date(base - Math.floor(rnd() * 36) * 3600_000 - Math.floor(rnd() * 3600_000)).toISOString()
    const error = state === 'failed' ? pick(ERRORS) : undefined
    const suffix = pipeline === 'backfill' ? `2026w${36 - Math.floor(rnd() * 3)}` : String(1000 + Math.floor(rnd() * 900))
    const name = `${pipeline}-${suffix}`
    jobs.push({
      id: `job_${(7000 + i).toString(36)}${Math.floor(rnd() * 1e6).toString(36)}`,
      name,
      pipeline,
      state,
      owner: pick(OWNERS),
      startedAt,
      durationSec: state === 'pending' ? null : Math.floor(rnd() * 5400) + 20,
      attempts: state === 'failed' ? 1 + Math.floor(rnd() * 3) : 1,
      node: state === 'pending' ? '—' : pick(NODES),
      logTail: logLines({ name, state, error }),
      error,
    })
  }
  return jobs.sort((a, b) => b.startedAt.localeCompare(a.startedAt))
}
