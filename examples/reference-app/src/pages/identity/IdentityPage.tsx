/**
 * /__identity — 이 서비스의 아이덴티티 시트 (개발 전용).
 * "우리 서비스는 SE 가족 안에서 어떤 형제인가"를 한 화면에 보여준다.
 */
import * as React from 'react'
import { Badge, Button, Input, PageBody, PageHeader, StatusBadge, useTheme } from '@se/ui'
import type { JobState } from '@se/tokens'
import identity from '../../../se.identity.json'

const SWATCHES: Array<{ group: string; keys: string[] }> = [
  { group: '표면', keys: ['canvas', 'surface', 'surface-2', 'line', 'line-strong'] },
  { group: '텍스트', keys: ['ink', 'muted', 'accent-fg'] },
  { group: '액센트 (아이덴티티)', keys: ['accent', 'accent-hover', 'accent-active', 'accent-soft', 'on-accent'] },
  { group: '의미 색 (브랜드 코어 · 고정)', keys: ['status-success', 'status-warning', 'status-danger', 'status-info', 'status-neutral'] },
  { group: '차트', keys: ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5', 'chart-6'] },
]

function useCssVars(keys: string[]) {
  const { mode } = useTheme()
  const [vals, setVals] = React.useState<Record<string, string>>({})
  React.useEffect(() => {
    const cs = getComputedStyle(document.documentElement)
    setVals(Object.fromEntries(keys.map((k) => [k, cs.getPropertyValue(`--se-${k}`).trim()])))
    // mode가 바뀌면 다시 읽는다
  }, [mode, keys])
  return vals
}

export function IdentityPage() {
  const allKeys = React.useMemo(() => SWATCHES.flatMap((s) => s.keys), [])
  const vals = useCssVars(allKeys)
  const { density, setDensity } = useTheme()

  return (
    <PageBody>
      <PageHeader
        title={`${identity.name} 아이덴티티`}
        description="브랜드 코어(고정)와 서비스 슬롯(가변)이 실제로 어떻게 렌더되는지 확인하는 시트입니다."
        actions={
          <Button variant="ghost" size="sm" onClick={() => setDensity(density === 'compact' ? 'comfortable' : 'compact')}>
            밀도: {density}
          </Button>
        }
      />

      <section className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
        {Object.entries({
          id: identity.id,
          'accent.hue': `${identity.accent.hue}°`,
          neutralBias: identity.neutralBias,
          signature: identity.signature,
          density: identity.density,
          displayFont: identity.displayFont,
          chart: identity.chart,
          tone: identity.tone,
        }).map(([k, v]) => (
          <div key={k} className="flex flex-col gap-0.5 rounded-md border border-line bg-surface px-3 py-2">
            <span className="font-mono text-[11px] text-muted">{k}</span>
            <span className="text-sm font-medium">{String(v)}</span>
          </div>
        ))}
      </section>

      {SWATCHES.map((s) => (
        <section key={s.group} className="flex flex-col gap-2">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted">{s.group}</h2>
          <div className="flex flex-wrap gap-2">
            {s.keys.map((k) => (
              <div key={k} className="flex w-36 flex-col overflow-hidden rounded-md border border-line bg-surface">
                <div className="h-12 border-b border-line" style={{ background: `var(--se-${k})` }} />
                <div className="flex flex-col px-2 py-1.5 font-mono text-[11px] leading-tight">
                  <span className="text-ink">{k}</span>
                  <span className="text-muted">{vals[k]}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted">타이포 (브랜드 코어 · 고정)</h2>
        <div className="flex flex-col gap-1 rounded-md border border-line bg-surface p-4">
          <p className="font-display text-2xl font-semibold leading-tight">잡 모니터링, 한눈에.</p>
          <p className="text-lg font-semibold">섹션 제목 20px</p>
          <p className="text-md">본문 강조 16px — 내부 도구는 밀도가 높아 본문 기본은 14px.</p>
          <p className="text-base">본문 14px. 스케줄된 잡 1,204건 중 실패 7건.</p>
          <p className="text-sm text-muted">보조 13px — 상대 시간, 설명.</p>
          <p className="font-mono text-xs">mono 12px · job_5jz8k2 · etl-daily-0912 · 0:04:12</p>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted">컴포넌트</h2>
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-line bg-surface p-4">
          <Button variant="primary">주 액션</Button>
          <Button>보조</Button>
          <Button variant="ghost">고스트</Button>
          <Button variant="danger">위험</Button>
          <Button loading>저장 중</Button>
          <Input placeholder="입력" className="w-40" />
          <Badge tone="accent">액센트</Badge>
          {(['pending', 'running', 'succeeded', 'failed', 'cancelled'] as JobState[]).map((s) => (
            <StatusBadge key={s} state={s} />
          ))}
        </div>
      </section>
    </PageBody>
  )
}
