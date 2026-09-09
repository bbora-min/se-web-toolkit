import type { Column, Dataset, Freshness } from '../api/types'

let seed = 20260910
function rnd() {
  seed = (seed * 1664525 + 1013904223) % 4294967296
  return seed / 4294967296
}
const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(rnd() * xs.length)]!

const DOMAINS = ['events', 'dim', 'fct', 'raw', 'ml', 'finance'] as const
const OWNERS = [
  ['bora', 'data-platform'],
  ['jihoon', 'data-platform'],
  ['minseo', 'analytics'],
  ['seoyeon', 'ml-infra'],
  ['taeho', 'finance-eng'],
] as const
const TABLES: Record<string, string[]> = {
  events: ['clicks_v3', 'pageviews', 'purchases', 'sessions', 'push_delivered', 'search_queries'],
  dim: ['users', 'products', 'campaigns', 'stores', 'devices'],
  fct: ['orders_daily', 'revenue_hourly', 'retention_weekly', 'funnel_daily', 'inventory_snapshot'],
  raw: ['sensor_stream', 'app_logs', 'payment_webhooks', 'crm_export'],
  ml: ['user_embeddings', 'churn_features', 'ranking_train_set'],
  finance: ['ledger', 'settlements', 'refunds'],
}
const TAGS = ['core', 'pii', 'tier-1', 'deprecated', 'experimental', 'certified', 'gdpr']
const DESC: Record<string, string> = {
  events: '앱·웹에서 수집된 이벤트 스트림. 파티션 dt 기준 일별 적재.',
  dim: '분석용 차원 테이블. SCD Type 2로 이력 관리.',
  fct: '집계된 팩트 테이블. 대시보드와 리포트의 기준 소스.',
  raw: '원본 그대로. 스키마가 자주 바뀌니 직접 쿼리보다 fct를 권장.',
  ml: '모델 학습·추론용 피처와 임베딩.',
  finance: '정산·회계 원장. 접근 권한 필요.',
}

function columns(domain: string): Column[] {
  const base: Column[] = [
    { name: 'id', type: 'STRING', nullable: false, nullRate: 0, description: '고유 식별자' },
    { name: 'created_at', type: 'TIMESTAMP', nullable: false, nullRate: 0 },
    { name: 'updated_at', type: 'TIMESTAMP', nullable: true, nullRate: 0.12 },
  ]
  const extra: Record<string, Column[]> = {
    events: [
      { name: 'user_id', type: 'INT64', nullable: true, nullRate: 0.03, pii: true },
      { name: 'session_id', type: 'STRING', nullable: false, nullRate: 0 },
      { name: 'event_name', type: 'STRING', nullable: false, nullRate: 0 },
      { name: 'properties', type: 'JSON', nullable: true, nullRate: 0.41, description: '이벤트별 자유 속성' },
      { name: 'dt', type: 'DATE', nullable: false, nullRate: 0, description: '파티션 키' },
    ],
    dim: [
      { name: 'name', type: 'STRING', nullable: false, nullRate: 0 },
      { name: 'email', type: 'STRING', nullable: true, nullRate: 0.08, pii: true },
      { name: 'country', type: 'STRING', nullable: true, nullRate: 0.02 },
      { name: 'valid_from', type: 'DATE', nullable: false, nullRate: 0 },
      { name: 'valid_to', type: 'DATE', nullable: true, nullRate: 0.87, description: 'NULL이면 현재 레코드' },
    ],
    fct: [
      { name: 'dt', type: 'DATE', nullable: false, nullRate: 0 },
      { name: 'store_id', type: 'INT64', nullable: false, nullRate: 0 },
      { name: 'orders', type: 'INT64', nullable: false, nullRate: 0 },
      { name: 'revenue_krw', type: 'NUMERIC', nullable: false, nullRate: 0 },
      { name: 'refund_krw', type: 'NUMERIC', nullable: true, nullRate: 0.6 },
    ],
  }
  return [...base, ...(extra[domain] ?? extra.events!)]
}

export function makeDatasets(): Dataset[] {
  const out: Dataset[] = []
  const now = Date.now()
  for (const domain of DOMAINS) {
    for (const table of TABLES[domain]!) {
      const [owner, team] = pick(OWNERS)
      const slaHours = pick([1, 6, 24, 24, 168])
      const ageH = rnd() < 0.78 ? rnd() * slaHours * 0.9 : slaHours * (1.2 + rnd() * 3)
      const freshness: Freshness = ageH < slaHours ? 'fresh' : rnd() < 0.8 ? 'stale' : 'broken'
      const rows = Math.floor(10 ** (4 + rnd() * 6))
      const tags = [...new Set([pick(TAGS), ...(rnd() < 0.3 ? [pick(TAGS)] : [])])].filter((t) => t !== 'pii' || domain !== 'fct')
      if (domain === 'events' || domain === 'dim') tags.push('pii')
      out.push({
        id: `${domain}.${table}`,
        name: `${domain}.${table}`,
        domain,
        description: DESC[domain]!,
        owner,
        team,
        rows,
        bytes: rows * (60 + Math.floor(rnd() * 400)),
        freshness,
        updatedAt: new Date(now - ageH * 3600_000).toISOString(),
        slaHours,
        tags: [...new Set(tags)],
        columns: columns(domain),
        upstream: domain === 'raw' ? [] : [`raw.${pick(TABLES.raw!)}`, ...(rnd() < 0.5 ? [`dim.${pick(TABLES.dim!)}`] : [])],
        downstream: domain === 'fct' ? ['dash.revenue', 'report.weekly'] : [`fct.${pick(TABLES.fct!)}`],
        queries30d: (() => {
          let v = domain === 'fct' ? 300 + rnd() * 200 : 20 + rnd() * 120
          return Array.from({ length: 30 }, () => {
            v = Math.max(0, v * (0.85 + rnd() * 0.3))
            return Math.round(v)
          })
        })(),
        sampleQuery: `SELECT *\nFROM ${domain}.${table}\nWHERE dt = CURRENT_DATE() - 1\nLIMIT 100`,
      })
    }
  }
  return out.sort((a, b) => b.queries30d.at(-1)! - a.queries30d.at(-1)!)
}
