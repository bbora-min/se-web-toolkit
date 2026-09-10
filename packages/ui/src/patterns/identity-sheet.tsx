import * as React from 'react'
import type { Identity } from '@se/tokens'
import { cn } from '../lib/cn'
import { useTheme } from '../lib/theme'
import { Badge, StatusBadge } from '../components/badge'
import { Button } from '../components/button'
import { Input } from '../components/input'
import { Tabs } from '../components/tabs'

export interface IdentitySheetProps {
  identity: Identity
  /** 이 서비스의 시그니처를 실제 컴포넌트로 렌더한 것 */
  signaturePreview?: React.ReactNode
  /** 레지스트리의 형제들 — 가족 초상화 */
  siblings?: Array<{ id: string; name: string; hue: number; signature: string }>
}

const SIGNATURE_LABEL: Record<string, string> = {
  'status-strip': '상태 스트립',
  'search-hero': '검색 히어로',
  'stage-rail': '단계 레일',
  'timeline-ribbon': '타임라인 리본',
  'metric-marquee': '지표 마키',
}
const TONE: Record<Identity['tone'], { label: string; empty: string; ok: string; err: string }> = {
  terse: { label: '간결', empty: '표시할 항목이 없습니다', ok: '재시도를 큐에 넣었습니다', err: '스케줄러에 연결할 수 없습니다' },
  friendly: { label: '친절', empty: '아직 여기엔 아무것도 없어요', ok: '재시도를 걸어 뒀어요', err: '스케줄러에 연결할 수 없어요. 잠시 후 다시 해볼게요' },
  procedural: { label: '절차적', empty: '해당 조건의 항목이 존재하지 않습니다', ok: '재시도 요청이 접수되었습니다', err: '스케줄러 연결에 실패했습니다. 담당자에게 문의하십시오' },
}
const NEUTRAL: Record<Identity['neutralBias'], string> = { cool: '차가운 회색', warm: '따뜻한 회색', neutral: '중성 회색', accent: '액센트 쪽으로 기운 회색' }

function useVars(keys: string[]) {
  const { mode } = useTheme()
  const [vals, setVals] = React.useState<Record<string, string>>({})
  React.useEffect(() => {
    const cs = getComputedStyle(document.documentElement)
    setVals(Object.fromEntries(keys.map((k) => [k, cs.getPropertyValue(`--se-${k}`).trim()])))
  }, [mode, keys])
  return vals
}

const SWATCH_ROWS: Array<{ title: string; note: string; keys: string[] }> = [
  { title: '액센트', note: '이 서비스의 것. 한 화면에 한 곳', keys: ['accent-active', 'accent', 'accent-hover', 'accent-soft'] },
  { title: '뉴트럴', note: '브랜드 명도 밴드 + 서비스 편향', keys: ['ink', 'muted', 'line-strong', 'line', 'surface-2', 'canvas'] },
  { title: '의미 색', note: '모든 서비스에서 같다', keys: ['status-success', 'status-warning', 'status-danger', 'status-info'] },
  { title: '차트', note: '순서 고정', keys: ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5', 'chart-6'] },
]

/**
 * 아이덴티티 시트 — 서비스의 "얼굴"을 한 장으로.
 * 브랜드 코어(고정)와 서비스 슬롯(가변)이 실제 렌더에서 어떻게 보이는지, 형제와 어떻게 다른지.
 */
export function IdentitySheet({ identity: id, signaturePreview, siblings }: IdentitySheetProps) {
  const keys = React.useMemo(() => SWATCH_ROWS.flatMap((r) => r.keys), [])
  const vars = useVars(keys)
  const { density, setDensity } = useTheme()
  const [tab, setTab] = React.useState('a')
  const tone = TONE[id.tone]
  const markText = id.mark.type === 'monogram' ? id.mark.text : id.name.slice(0, 1)

  return (
    <div className="flex flex-col gap-12 pb-8">
      {/* 히어로 */}
      <section className="grid grid-cols-[1fr_auto] items-end gap-8 pt-6">
        <div className="flex flex-col gap-5">
          <span className="grid size-16 place-items-center rounded-xl bg-accent font-mono text-2xl font-semibold text-on-accent shadow-raised">{markText}</span>
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-3xl font-semibold leading-none tracking-[-0.025em] text-ink">{id.name}</h1>
            <p className="text-md text-muted">
              SE 가족의 일원. <span className="text-ink">{id.accent.hue}°</span> · {NEUTRAL[id.neutralBias]} · {SIGNATURE_LABEL[id.signature] ?? id.signature} · {tone.label}한 톤
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 text-right">
          <span className="h-24 w-40 rounded-lg bg-accent shadow-xs" aria-hidden />
          <span className="font-mono text-xs text-muted">accent {vars.accent}</span>
        </div>
      </section>

      {/* 고정 vs 가변 */}
      <section className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-5">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted">브랜드 코어 — 모든 서비스 동일</h2>
          <dl className="grid grid-cols-[96px_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted">타이포</dt><dd>Pretendard · IBM Plex Mono · 12/13/14/16/20/24/28/36</dd>
            <dt className="text-muted">간격·반경</dt><dd>4pt 리듬 · 4/6/10</dd>
            <dt className="text-muted">쉘</dt><dd>좌측 네비 + ⌘K · 콘텐츠 1120px</dd>
            <dt className="text-muted">의미 색</dt><dd className="flex gap-1.5"><Badge tone="success">성공</Badge><Badge tone="warning">주의</Badge><Badge tone="danger">위험</Badge><Badge tone="info">정보</Badge></dd>
            <dt className="text-muted">관례</dt><dd>3상태 · 위험 동작 확인 · 상대+절대 시간</dd>
          </dl>
        </div>
        <div className="flex flex-col gap-3 rounded-lg border border-accent/30 bg-accent-soft/40 p-5">
          <h2 className="text-xs font-medium uppercase tracking-wider text-accent-fg">이 서비스 — 슬롯 8개</h2>
          <dl className="grid grid-cols-[96px_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted">액센트</dt><dd className="font-mono">hue {id.accent.hue}° · {vars.accent}</dd>
            <dt className="text-muted">뉴트럴</dt><dd>{NEUTRAL[id.neutralBias]}</dd>
            <dt className="text-muted">마크</dt><dd>{id.mark.type === 'monogram' ? `모노그램 ${id.mark.text}` : `아이콘 ${id.mark.icon}`}</dd>
            <dt className="text-muted">시그니처</dt><dd>{SIGNATURE_LABEL[id.signature] ?? id.signature}</dd>
            <dt className="text-muted">밀도</dt>
            <dd className="flex items-center gap-2">
              {id.density}
              <Button variant="ghost" size="sm" onClick={() => setDensity(density === 'compact' ? 'comfortable' : 'compact')}>
                지금 {density} → 바꿔 보기
              </Button>
            </dd>
            <dt className="text-muted">헤딩 폰트</dt><dd>{id.displayFont}</dd>
            <dt className="text-muted">차트</dt><dd>{id.chart}</dd>
            <dt className="text-muted">톤</dt><dd>{tone.label}</dd>
          </dl>
        </div>
      </section>

      {/* 시그니처 */}
      {signaturePreview ? (
        <section className="flex flex-col gap-3">
          <SheetHeading title="시그니처" note={`${SIGNATURE_LABEL[id.signature] ?? id.signature} — 이 서비스의 얼굴. 페이지 맨 위에 항상 같은 자리`} />
          {signaturePreview}
        </section>
      ) : null}

      {/* 팔레트 */}
      <section className="flex flex-col gap-5">
        <SheetHeading title="팔레트" note="hue 하나로 계산된다. 채도·명도는 브랜드 밴드에 고정" />
        {SWATCH_ROWS.map((r) => (
          <div key={r.title} className="grid grid-cols-[120px_1fr] items-center gap-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-ink">{r.title}</span>
              <span className="text-xs text-muted">{r.note}</span>
            </div>
            <div className="flex overflow-hidden rounded-md border border-line">
              {r.keys.map((k) => (
                <div key={k} className="flex flex-1 flex-col">
                  <span className="h-10" style={{ background: `var(--se-${k})` }} />
                  <span className="truncate border-t border-line bg-surface px-2 py-1 font-mono text-[10px] leading-4 text-muted">{k.replace('status-', '')} <span className="text-ink/70">{vars[k]}</span></span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* 타이포 */}
      <section className="flex flex-col gap-4">
        <SheetHeading title="타이포" note="본문은 고정, 헤딩 폰트만 슬롯" />
        <div className="grid grid-cols-[1fr_auto] gap-8 rounded-lg border border-line bg-surface p-6">
          <div className="flex flex-col gap-3">
            <p className="font-display text-3xl font-semibold leading-tight tracking-[-0.025em]">지금 괜찮은가를<br />3초 안에.</p>
            <p className="max-w-[46ch] text-md text-ink/85">내부 도구는 읽히는 화면이 아니라 스캔되는 화면입니다. 요약이 먼저, 목록은 조용하게, 숫자는 줄을 맞춰서.</p>
            <p className="font-mono text-sm text-muted">job_5exc9y · etl-daily-1668 · 0:04:12 · 1,204,113 rows</p>
          </div>
          <ul className="flex flex-col gap-1 text-xs text-muted tnum">
            {[['3xl', 36, '히어로'], ['2xl', 28, '페이지 제목'], ['xl', 24, '섹션·핵심 숫자'], ['lg', 20, '카드 제목'], ['md', 16, '강조 본문'], ['base', 14, '본문'], ['sm', 13, '보조'], ['xs', 12, '라벨']].map(([k, px, use]) => (
              <li key={String(k)} className="flex items-baseline justify-between gap-6"><span className="font-mono">{k}</span><span>{px}px</span><span className="w-20 text-right">{use}</span></li>
            ))}
          </ul>
        </div>
      </section>

      {/* 목소리 */}
      <section className="flex flex-col gap-4">
        <SheetHeading title="목소리" note={`${tone.label}한 톤 — 빈 상태·완료·실패 문장이 같은 사람처럼 말한다`} />
        <div className="grid grid-cols-3 gap-4">
          {[['빈 상태', tone.empty, 'neutral'], ['완료', tone.ok, 'success'], ['실패', tone.err, 'danger']].map(([t, m, k]) => (
            <div key={String(t)} className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-4">
              <Badge tone={k as 'neutral' | 'success' | 'danger'}>{t}</Badge>
              <p className="text-sm text-ink">{m}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 컴포넌트 */}
      <section className="flex flex-col gap-4">
        <SheetHeading title="컴포넌트" note="형태는 고정, 색만 이 서비스의 것" />
        <div className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="primary">주 액션</Button><Button>보조</Button><Button variant="ghost">고스트</Button><Button variant="danger">위험</Button><Button loading>저장 중</Button>
            <Input placeholder="입력" className="w-44" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(['pending', 'running', 'succeeded', 'failed', 'cancelled'] as const).map((s) => <StatusBadge key={s} state={s} />)}
            <Badge tone="accent">액센트 배지</Badge>
          </div>
          <Tabs value={tab} onChange={setTab} items={[{ value: 'a', label: '전체', count: 64 }, { value: 'b', label: '실패', count: 6, tone: 'danger' }, { value: 'c', label: '실행 중', count: 7 }]} className="max-w-md" />
        </div>
      </section>

      {/* 가족 */}
      {siblings?.length ? (
        <section className="flex flex-col gap-4">
          <SheetHeading title="가족" note="같은 골격, 다른 색과 얼굴. hue는 서로 30° 이상, 의미 색과 18° 이상" />
          <div className="flex flex-wrap gap-3">
            {siblings.map((s) => (
              <div key={s.id} className={cn('flex items-center gap-3 rounded-lg border px-3 py-2', s.id === id.id ? 'border-accent bg-accent-soft/50' : 'border-line bg-surface')}>
                {/* eslint-disable-next-line se/no-raw-color -- 형제 서비스의 색은 이 앱의 토큰에 없다. hue로 계산하는 것이 이 표시의 목적 */}
                <span className="size-6 rounded-md" style={{ background: `oklch(0.5 0.12 ${s.hue})` }} aria-hidden />
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-medium text-ink">{s.name}</span>
                  <span className="text-xs text-muted">{s.hue}° · {SIGNATURE_LABEL[s.signature] ?? s.signature}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

function SheetHeading({ title, note }: { title: string; note: string }) {
  return (
    <div className="flex items-baseline gap-3 border-b border-line pb-2">
      <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
      <span className="text-sm text-muted">{note}</span>
    </div>
  )
}

/** 마크 색으로 파비콘을 그린다 — 탭 목록에서도 형제가 구분되게 */
export function useIdentityFavicon(id: Pick<Identity, 'name' | 'mark'>) {
  React.useEffect(() => {
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--se-accent').trim() || '#1B6B85'
    const text = id.mark.type === 'monogram' ? id.mark.text : id.name.slice(0, 1)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="${accent}"/><text x="16" y="21" font-family="ui-monospace,Menlo,monospace" font-size="${text.length > 1 ? 13 : 17}" font-weight="600" fill="#fff" text-anchor="middle">${text}</text></svg>`
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.type = 'image/svg+xml'
    link.href = `data:image/svg+xml,${encodeURIComponent(svg)}`
  }, [id.name, id.mark])
}
