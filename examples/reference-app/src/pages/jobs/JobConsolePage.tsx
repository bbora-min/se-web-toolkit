/**
 * 잡 콘솔 — 콘솔(console) 골격의 원본. 패싯 | 로그 스트림 | 컨텍스트. 전폭, 모노스페이스, 라이브 테일.
 *
 * 디자인 플랜
 *  골격       : 콘솔. 드로어(잡 목록의 상세)가 "잠깐 보는 로그"라면 이 화면은 "파고드는 로그". 같은 데이터, 다른 골격 — 원장은 표, 콘솔은 스트림.
 *  목적       : 실패한 잡의 빨간 줄을 찾고, 그 앞뒤 맥락(단계·시도·노드)을 본다. 실행 중이면 따라간다.
 *  첫 시선    : 상단 바의 상태 배지 → 스트림의 ERROR 줄(좌측 마커) → 오른쪽 실패 원인.
 *  주 액션    : 실패면 재시도(primary). 실행 중이면 취소(ghost). 필터는 패싯(레벨·단계·시도)과 한 줄 검색.
 *  정보 계층  : 상단 바(무엇·상태·소요) → [패싯 | 스트림 | 컨텍스트(원인·같은 파이프라인 최근·런북)].
 *  밀도       : 화면 높이 고정(ShellFill fixed), 폭 1600. 패싯 240, 컨텍스트 280. 로그는 22px 줄.
 *  액센트     : 패싯 선택, 검색 일치. 레벨 색은 의미 색(ERROR danger · WARN warning).
 *  3상태      : 스켈레톤 / "아직 시작되지 않았습니다"(pending) / 원인 + 다시 시도.
 *  톤         : terse.
 */
import * as React from 'react'
import { ArrowLeft, RotateCcw, Search, XCircle } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'
import { Badge, Button, ErrorState, FacetGroup, Input, LOG_LEVEL_RE, LogViewer, ShellFill, Skeleton, SplitPane, StatusBadge, Switch, cn, formatAbsolute, formatDuration, formatRelative, stripAnsi, toast, useContentWidth } from '@se/ui'
import { useCancelJob, useJob, useJobLogs, useJobs, useRetryJob } from '../../api/jobs'
import type { Job } from '../../api/types'

type Level = 'ERROR' | 'WARN' | 'INFO'
interface Parsed {
  raw: string
  /** ANSI 를 벗긴 줄 — 필터·검색은 이것으로 */
  plain: string
  level: Level
  stage: string
}
const STAGE_RE = /\bstage\s+([a-z ]+?)\s+\d+%|^(?:\S+\s+\S+\s+)?\S+\s+([a-z ]+?): batch\b/

/** 줄마다 레벨·단계를 뽑는다. 단계는 마지막으로 본 "stage …" 마커를 따른다 */
function parse(lines: string[]): Parsed[] {
  let stage = 'resolve deps'
  return lines.map((raw) => {
    const plain = stripAnsi(raw)
    const lv = LOG_LEVEL_RE.exec(plain)
    const level: Level = lv?.[1] ? 'ERROR' : lv?.[2] ? 'WARN' : 'INFO'
    const st = STAGE_RE.exec(plain)
    const found = st?.[1] ?? st?.[2]
    if (found) stage = found.trim()
    return { raw, plain, level, stage }
  })
}

export function JobConsolePage() {
  const { jobId } = useParams()
  // 잡이 바뀌면 필터·스위치도 새로 — 이전 잡의 필터가 딸려오지 않는다
  return <JobConsole key={jobId} jobId={jobId} />
}

function JobConsole({ jobId }: { jobId: string | undefined }) {
  const job = useJob(jobId)
  const j = job.data
  const [live, setLive] = React.useState(true)
  const running = j?.state === 'running'
  const logs = useJobLogs(j?.id, running && live)
  const siblings = useJobs({ pipeline: j?.pipeline ?? '', pageSize: 6 }, { enabled: Boolean(j?.pipeline), refetchInterval: false })
  const retry = useRetryJob()
  const cancel = useCancelJob()
  useContentWidth(1600)

  const [levels, setLevels] = React.useState<string[]>([])
  const [stages, setStages] = React.useState<string[]>([])
  const [q, setQ] = React.useState('')

  const parsed = React.useMemo(() => parse(logs.data?.lines ?? []), [logs.data?.lines])
  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase()
    return parsed.filter((l) => (!levels.length || levels.includes(l.level)) && (!stages.length || stages.includes(l.stage)) && (!needle || l.plain.toLowerCase().includes(needle))).map((l) => l.raw)
  }, [parsed, levels, stages, q])
  const { byLevel, byStage } = React.useMemo(() => {
    const byLevel = new Map<string, number>(), byStage = new Map<string, number>()
    for (const l of parsed) {
      byLevel.set(l.level, (byLevel.get(l.level) ?? 0) + 1)
      byStage.set(l.stage, (byStage.get(l.stage) ?? 0) + 1)
    }
    return { byLevel, byStage }
  }, [parsed])
  const stageOrder = ['resolve deps', 'read partitions', 'transform', 'write', 'publish']

  const onRetry = async () => {
    if (!j) return
    try {
      await retry.mutateAsync(j.id)
      toast.success('재시도를 큐에 넣었습니다', { description: j.name })
    } catch (e) {
      toast.error('재시도 실패', { description: (e as Error).message })
    }
  }

  return (
    <ShellFill fixed className="border-t border-line">
      <h1 className="sr-only">잡 콘솔</h1>
      {/* 상단 바 — 무엇을 보고 있나. 제목이 아니라 식별자 */}
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-line bg-surface px-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted"><Link to="/jobs"><ArrowLeft /> 잡</Link></Button>
        {j ? (
          <>
            <span className="font-mono text-[13px] font-semibold text-ink">{j.name}</span>
            <StatusBadge state={j.state} />
            <Badge>{j.pipeline}</Badge>
            <span className="hidden items-center gap-3 text-xs text-muted lg:flex">
              <span className="font-mono">{j.node}</span>
              <span title={formatAbsolute(j.startedAt)}>{formatRelative(j.startedAt)} 시작</span>
              <span className="tnum">{formatDuration(j.durationSec)}</span>
              <span>시도 {j.attempts}회</span>
            </span>
            <div className="ml-auto flex items-center gap-2">
              {j.state === 'running' || j.state === 'pending' ? <Button variant="ghost" size="sm" onClick={() => cancel.mutate(j.id, { onSuccess: () => toast('취소 요청을 보냈습니다') })} loading={cancel.isPending}><XCircle /> 취소</Button> : null}
              {j.state === 'failed' || j.state === 'cancelled' ? <Button variant="primary" size="sm" onClick={() => void onRetry()} loading={retry.isPending}><RotateCcw /> 재시도</Button> : null}
            </div>
          </>
        ) : job.isError ? null : (
          <Skeleton className="h-5 w-72" />
        )}
      </div>

      {job.isError ? (
        <ErrorState title="잡을 불러오지 못했습니다" description={job.error.message} action={<Button onClick={() => job.refetch()}>다시 시도</Button>} />
      ) : (
        <SplitPane
          storageKey="job-console"
          leftWidth={240}
          rightWidth={280}
          minCenter={480}
          left={
            <div className="flex flex-col gap-4 px-2 py-3">
              <FacetGroup
                title="레벨"
                values={levels}
                onChange={setLevels}
                options={(['ERROR', 'WARN', 'INFO'] as Level[]).map((l) => ({ value: l, count: byLevel.get(l) ?? 0, tone: l === 'ERROR' ? 'danger' : l === 'WARN' ? 'warning' : 'default' }))}
              />
              <FacetGroup title="단계" values={stages} onChange={setStages} options={stageOrder.filter((s) => byStage.has(s)).map((s) => ({ value: s, count: byStage.get(s) ?? 0 }))} />
              {j && j.attempts > 1 ? (
                <section className="flex flex-col gap-1">
                  <h3 className="flex h-7 items-center px-2 text-[11px] font-medium uppercase tracking-wider text-muted">시도</h3>
                  <ol className="flex flex-col">
                    {Array.from({ length: j.attempts }, (_, i) => (
                      <li key={i} className={cn('flex h-7 items-center justify-between px-2 font-mono text-xs', i + 1 === j.attempts ? 'text-ink' : 'text-muted')}>
                        <span>{i + 1}회{i + 1 === j.attempts ? ' · 현재' : ''}</span>
                        {i + 1 === j.attempts ? <span className="tnum">{parsed.length.toLocaleString()}</span> : <span className="text-[11px]">보관 안 됨</span>}
                      </li>
                    ))}
                  </ol>
                </section>
              ) : null}
            </div>
          }
          right={j ? <Context job={j} siblings={siblings.data?.items.filter((s) => s.id !== j.id).slice(0, 5) ?? []} /> : null}
        >
          {/* 필터 바 — 스트림 위 한 줄. 패싯과 AND */}
          <div className="flex h-11 shrink-0 items-center gap-3 border-b border-line bg-surface px-3">
            <Input leading={<Search />} placeholder="줄 필터 — 텍스트 (레벨·단계는 왼쪽)" value={q} onChange={(e) => setQ(e.target.value)} aria-label="로그 필터" className="min-w-0 max-w-[28rem] flex-1 [&_input]:h-8 [&_input]:font-mono [&_input]:text-xs" />
            <span className="shrink-0 whitespace-nowrap text-xs text-muted tnum">{filtered.length.toLocaleString()} / {parsed.length.toLocaleString()}줄</span>
            {levels.length || stages.length || q ? <Button variant="link" size="sm" className="shrink-0" onClick={() => { setLevels([]); setStages([]); setQ('') }}>필터 초기화</Button> : null}
            <label className="ml-auto flex shrink-0 items-center gap-2 whitespace-nowrap text-xs text-muted">
              라이브 테일
              <Switch checked={live && running} onCheckedChange={setLive} aria-label="라이브 테일" disabled={!running} />
            </label>
          </div>
          <div className="flex min-h-0 flex-1 flex-col p-3">
            {logs.isError ? (
              <ErrorState title="로그를 불러오지 못했습니다" description={logs.error.message} action={<Button onClick={() => logs.refetch()}>다시 시도</Button>} />
            ) : logs.isPending ? (
              <Skeleton className="flex-1 rounded-lg" />
            ) : (
              <LogViewer
                lines={filtered}
                live={Boolean(live && running)}
                height="100%"
                title={<span className="whitespace-nowrap">{j?.name}</span>}
                emptyText={j?.state === 'pending' ? '아직 시작되지 않았습니다' : parsed.length ? '필터에 맞는 줄이 없습니다' : '로그가 없습니다'}
                className="min-h-0 flex-1"
              />
            )}
          </div>
        </SplitPane>
      )}
    </ShellFill>
  )
}

/** 오른쪽 — 원인·같은 파이프라인 최근·런북. 스트림에 없는 것만 */
function Context({ job: j, siblings }: { job: Job; siblings: Job[] }) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col gap-5 px-4 py-4 text-sm">
      {j.error ? (
        <section className="flex flex-col gap-1.5">
          <h2 className="text-xs font-medium text-muted">실패 원인</h2>
          <code className="block rounded-md border border-danger/20 bg-danger-soft px-3 py-2 font-mono text-xs leading-relaxed text-ink">{j.error}</code>
          <Button variant="link" size="sm" className="w-fit" onClick={() => navigate(`/jobs?state=failed&q=${encodeURIComponent(j.error!.split(/[\s:(]/)[0] ?? '')}`)}>같은 원인의 잡 →</Button>
        </section>
      ) : null}
      <section className="flex flex-col gap-1.5">
        <h2 className="text-xs font-medium text-muted">런북</h2>
        <ul className="flex flex-col gap-1 text-[13px]">
          <li><a className="text-accent-fg hover:underline" href="#runbook-oom">OOMKilled — 메모리 상한 올리기</a></li>
          <li><a className="text-accent-fg hover:underline" href="#runbook-s3">S3 AccessDenied — 버킷 정책 확인</a></li>
          <li><a className="text-accent-fg hover:underline" href="#runbook-upstream">업스트림 지연 — 대기 시간 조정</a></li>
        </ul>
      </section>
      <section className="flex flex-col gap-1.5">
        <h2 className="text-xs font-medium text-muted">같은 파이프라인 · 최근</h2>
        <ul className="flex flex-col divide-y divide-line rounded-md border border-line bg-surface">
          {siblings.length === 0 ? <li className="px-3 py-2 text-xs text-muted">없음</li> : null}
          {siblings.map((s) => (
            <li key={s.id}>
              <Link to={`/jobs/${s.id}/logs`} className="flex items-center gap-2 px-3 py-2 hover:bg-surface-2/60">
                <span className="min-w-0 flex-1 truncate font-mono text-xs">{s.name}</span>
                <StatusBadge state={s.state} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
