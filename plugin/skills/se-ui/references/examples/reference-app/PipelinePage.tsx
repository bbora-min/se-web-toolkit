// 원본: examples/reference-app/src/pages/pipelines/PipelinePage.tsx (자동 복사 — 수정하지 말 것, pnpm gen:skill-docs)
/**
 * 파이프라인 — 캔버스(그래프) 골격의 원본. 태스크 DAG 를 무한 캔버스에, 오른쪽에 인스펙터.
 *
 * 디자인 플랜
 *  골격       : 캔버스. 잡 목록(목록)·개요(대시보드)·콘솔(스트림)과 달리 "관계"가 정보다 — 무엇이 무엇을 기다리는지.
 *  목적       : 마지막 실행에서 어느 태스크가 실패했고 그 뒤로 무엇이 막혔는지 본다. 태스크를 누르면 사실과 로그 링크.
 *  첫 시선    : 빨간 테두리 노드와 그 뒤의 회색(대기) 노드들. 실행 중이면 흐르는 간선.
 *  주 액션    : 없음(읽는 화면). 실패 태스크의 인스펙터에서 "콘솔에서 로그 보기"·재시도.
 *  정보 계층  : 상단 바(파이프라인 · 스케줄 · 담당 · 마지막 실행) → [캔버스 | 인스펙터(선택 태스크 또는 파이프라인 요약)].
 *  밀도       : 화면 높이 고정(ShellFill fixed), 폭 1600. 노드 184px 카드, 층 간격 260.
 *  액센트     : 선택 노드 링, 상태색은 브랜드 코어(실행 info · 실패 danger · 성공 success).
 *  3상태      : 캔버스 자리 스켈레톤 / 태스크 없음 문구 / 원인 + 다시 시도.
 *  톤         : terse.
 */
import * as React from 'react'
import { ArrowLeft, RotateCcw, SquareTerminal } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router'
import { Badge, Button, DescriptionList, EmptyState, ErrorState, Kbd, ShellFill, Skeleton, SplitPane, StatusBadge, formatAbsolute, formatDuration, formatRelative, toast, useContentWidth } from '@se/ui'
import { Canvas, type CanvasEdge, type CanvasNode } from '@se/canvas'
import { usePipeline, usePipelines, useRetryJob } from '../../api/jobs'
import type { Pipeline, PipelineTask } from '../../api/types'

export function PipelinePage() {
  const { name } = useParams()
  const list = usePipelines()
  if (!name) {
    const first = list.data?.items[0]?.name
    if (first) return <Navigate to={`/pipelines/${first}`} replace />
    return (
      <div className="pt-6">
        {list.isError ? (
          <ErrorState title="파이프라인 목록을 불러오지 못했습니다" description={list.error.message} action={<Button onClick={() => list.refetch()}>다시 시도</Button>} />
        ) : list.data ? (
          <EmptyState title="파이프라인이 없습니다" description="실행된 잡이 있는 파이프라인이 여기에 나타납니다." action={<Button asChild><Link to="/jobs">잡 목록</Link></Button>} />
        ) : (
          <Skeleton className="h-8 w-64" />
        )}
      </div>
    )
  }
  return <PipelineCanvas key={name} name={name} />
}

function PipelineCanvas({ name }: { name: string }) {
  const q = usePipeline(name)
  const list = usePipelines()
  const p = q.data
  const [selected, setSelected] = React.useState<string | null>(null)
  useContentWidth(1600)

  const nodes: CanvasNode[] = React.useMemo(() => (p?.tasks ?? []).map((t) => ({ id: t.id, label: t.name, state: t.state, meta: [t.durationSec != null ? formatDuration(t.durationSec) : null, t.node].filter(Boolean).join(' · ') || undefined })), [p?.tasks])
  const edges: CanvasEdge[] = React.useMemo(() => (p?.tasks ?? []).flatMap((t) => t.upstream.map((u) => ({ from: u, to: t.id }))), [p?.tasks])
  const task = p?.tasks.find((t) => t.id === selected) ?? null
  const failed = p?.tasks.filter((t) => t.state === 'failed').length ?? 0

  return (
    <ShellFill fixed className="border-t border-line">
      <h1 className="sr-only">파이프라인 {name}</h1>
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-line bg-surface px-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted"><Link to="/jobs"><ArrowLeft /> 잡</Link></Button>
        {/* 파이프라인 전환 — 탭이 아니라 이름. 5–6개면 이 정도가 맞다 */}
        <nav className="flex min-w-0 items-center gap-1 overflow-x-auto whitespace-nowrap" aria-label="파이프라인">
          {(list.data?.items ?? []).map((it) => (
            <Link key={it.name} to={`/pipelines/${it.name}`} aria-current={it.name === name ? 'page' : undefined} className="shrink-0 rounded-md px-2 py-1 font-mono text-xs text-muted hover:bg-surface-2 hover:text-ink aria-[current=page]:bg-accent-soft aria-[current=page]:text-accent-fg">
              {it.name}
            </Link>
          ))}
        </nav>
        {p ? (
          <span className="ml-auto hidden shrink-0 items-center gap-3 whitespace-nowrap text-xs text-muted xl:flex">
            <span className="font-mono">{p.schedule}</span>
            <span>담당 {p.owner}</span>
            <span className="flex items-center gap-1.5">마지막 실행 <StatusBadge state={p.lastRun.state} /> <span title={formatAbsolute(p.lastRun.startedAt)}>{formatRelative(p.lastRun.startedAt)}</span></span>
          </span>
        ) : null}
      </div>

      {q.isError ? (
        <ErrorState title="파이프라인을 불러오지 못했습니다" description={q.error.message} action={<Button onClick={() => q.refetch()}>다시 시도</Button>} />
      ) : (
        <SplitPane storageKey="pipeline" rightWidth={300} minCenter={520} right={p ? <Inspector p={p} task={task} onClear={() => setSelected(null)} /> : null}>
          {q.isPending ? (
            <Skeleton className="m-3 flex-1 rounded-lg" />
          ) : !p || p.tasks.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-sm text-muted">이 파이프라인에 태스크가 없습니다.</div>
          ) : (
            <Canvas
              nodes={nodes}
              edges={edges}
              selectedId={selected}
              onSelect={setSelected}
              minimap={nodes.length > 20}
              overlay={
                <div className="flex items-center gap-3 rounded-md border border-line bg-surface/90 px-3 py-1.5 text-[11px] text-muted backdrop-blur-sm">
                  <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm border-2 border-success/60" aria-hidden />성공</span>
                  <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm border-2 border-info" aria-hidden />실행 중</span>
                  <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm border-2 border-danger" aria-hidden />실패</span>
                  <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm border border-line" aria-hidden />대기</span>
                  {failed ? <span className="text-danger tnum">실패 {failed}</span> : null}
                  <span className="hidden items-center gap-1 xl:flex"><Kbd>스크롤</Kbd> 확대 · <Kbd>끌기</Kbd> 이동</span>
                </div>
              }
            />
          )}
        </SplitPane>
      )}
      <span className="sr-only" aria-live="polite">{task ? `${task.name} 선택됨` : ''}</span>
    </ShellFill>
  )
}

/** 오른쪽 — 선택한 태스크의 사실, 없으면 파이프라인 요약 */
function Inspector({ p, task, onClear }: { p: Pipeline; task: PipelineTask | null; onClear: () => void }) {
  const retry = useRetryJob()
  if (!task) {
    const counts = p.tasks.reduce<Record<string, number>>((m, t) => ((m[t.state] = (m[t.state] ?? 0) + 1), m), {})
    return (
      <div className="flex flex-col gap-4 px-4 py-4 text-sm">
        <div className="flex flex-col gap-1">
          <h2 className="font-mono text-[13px] font-semibold text-ink">{p.name}</h2>
          <p className="text-xs text-muted">태스크를 누르면 사실과 로그가 여기에.</p>
        </div>
        <DescriptionList
          items={[
            { label: '스케줄', value: p.schedule, mono: true },
            { label: '담당', value: p.owner },
            { label: '태스크', value: `${p.tasks.length}개` },
            { label: '마지막 실행', value: <span className="flex items-center gap-2"><StatusBadge state={p.lastRun.state} />{formatRelative(p.lastRun.startedAt)}</span> },
            { label: '소요', value: formatDuration(p.lastRun.durationSec) },
          ]}
        />
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(counts).map(([s, n]) => <Badge key={s}><StatusBadge state={s as PipelineTask['state']} /> <span className="tnum">{n}</span></Badge>)}
        </div>
        <Button variant="secondary" size="sm" asChild><Link to={`/jobs/${p.lastRun.jobId}/logs`}><SquareTerminal /> 마지막 실행 콘솔</Link></Button>
      </div>
    )
  }
  const down = p.tasks.filter((t) => t.upstream.includes(task.id)).map((t) => t.name)
  return (
    <div className="flex flex-col gap-4 px-4 py-4 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="truncate font-mono text-[13px] font-semibold text-ink">{task.name}</h2>
          <StatusBadge state={task.state} />
        </div>
        <Button variant="ghost" size="sm" onClick={onClear}>해제</Button>
      </div>
      {task.error ? <code className="block rounded-md border border-danger/20 bg-danger-soft px-3 py-2 font-mono text-xs leading-relaxed text-ink">{task.error}</code> : null}
      <DescriptionList
        items={[
          { label: '소요', value: task.durationSec != null ? formatDuration(task.durationSec) : '—' },
          { label: '노드', value: task.node ?? '—', mono: true },
          { label: '시도', value: `${task.attempts}회` },
          { label: '상류', value: task.upstream.length ? task.upstream.map((u) => p.tasks.find((t) => t.id === u)?.name ?? u).join(', ') : '없음', mono: true },
          { label: '하류', value: down.length ? down.join(', ') : '없음', mono: true },
        ]}
      />
      <div className="flex flex-col gap-2">
        <Button variant="secondary" size="sm" asChild><Link to={`/jobs/${p.lastRun.jobId}/logs`}><SquareTerminal /> 콘솔에서 로그 보기</Link></Button>
        {task.state === 'failed' ? (
          <Button variant="primary" size="sm" onClick={() => retry.mutate(p.lastRun.jobId, { onSuccess: () => toast.success('이 태스크부터 재시도를 큐에 넣었습니다', { description: task.name }) })} loading={retry.isPending}><RotateCcw /> 여기서부터 재시도</Button>
        ) : null}
      </div>
    </div>
  )
}
