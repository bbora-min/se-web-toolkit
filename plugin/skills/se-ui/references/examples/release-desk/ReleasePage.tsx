// 원본: examples/release-desk/src/pages/releases/ReleasePage.tsx (자동 복사 — 수정하지 말 것, pnpm gen:skill-docs)
/**
 * 릴리스 상세 — DetailPage 패턴 + 워크플로 액션.
 *  첫 시선 : 버전·단계·막힘 배너. 그다음 단계 진행(Steps)과 승인 현황.
 *  주 액션 : 내 차례면 "승인/반려", 담당자면 "다음 단계로". 둘 다 아니면 primary 없음.
 */
import * as React from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, MessageSquare, Rocket, ThumbsDown, ThumbsUp, XCircle } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router'
import {
  Alert, Avatar, Badge, Button, CheckboxField, ConfirmDialog, DescriptionList, ErrorState, PageBody, Skeleton, Steps, Tabs, cn, toast,
} from '@se/ui'
import { useAdvance, useChecklist, useRelease } from '../../api/releases'
import { STAGES, type Release, type StageId } from '../../api/types'
import { formatAbsolute, formatRelative } from '@se/ui'
import { ApproverStack, RiskLabel, StageBadge, TypeBadge } from './bits'
import { DecisionDialog } from './DecisionDialog'

const ORDER: StageId[] = ['draft', 'review', 'staging', 'approval', 'deploy', 'done']
const windowFmt = new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric', weekday: 'short', hour: 'numeric', hour12: false })

export function ReleasePage() {
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') ?? 'overview'
  const q = useRelease(id)
  const r = q.data
  const advance = useAdvance(id ?? '')
  const [decide, setDecide] = React.useState(false)
  const [confirmAdvance, setConfirmAdvance] = React.useState(false)

  const myTurn = r?.stage === 'approval' && r.approvers.some((a) => a.name === 'bora' && a.decision === 'pending')
  const isOwner = r?.owner === 'bora'
  const requiredMissing = r?.checklist.filter((c) => c.required && !c.done).length ?? 0
  const stageIdx = r ? ORDER.indexOf(r.stage) : 0
  const nextLabel = r && r.stage !== 'done' ? STAGES[stageIdx + 1]?.label : null
  const canAdvance = r && r.stage !== 'done' && r.stage !== 'approval' && !(r.stage === 'staging' && requiredMissing > 0)

  return (
    <PageBody>
      <div className="pt-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted">
          <Link to="/releases"><ArrowLeft /> 릴리스</Link>
        </Button>
      </div>
      {q.isError ? (
        <ErrorState title="릴리스를 불러오지 못했습니다" description={q.error.message} action={<Button onClick={() => q.refetch()}>다시 시도</Button>} />
      ) : (
        <>
          <header className="flex items-start justify-between gap-6">
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {r ? (
                  <>
                    <h1 className="font-mono text-2xl font-semibold tracking-tight text-ink">{r.version}</h1>
                    <StageBadge stage={r.stage} />
                    <TypeBadge type={r.type} />
                    <Badge>{r.service}</Badge>
                  </>
                ) : <Skeleton className="h-8 w-64" />}
              </div>
              {r ? <p className="text-md text-ink/85">{r.title}</p> : <Skeleton className="h-4 w-80" />}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {myTurn ? (
                <Button key="decide" variant="primary" onClick={() => setDecide(true)}><ThumbsUp /> 승인 / 반려</Button>
              ) : isOwner && canAdvance ? (
                <Button key="advance" variant="primary" onClick={() => setConfirmAdvance(true)} loading={advance.isPending}>
                  {r?.stage === 'deploy' ? <><Rocket /> 배포 완료 처리</> : <>{nextLabel} 단계로 <ArrowRight /></>}
                </Button>
              ) : null}
              {r && r.stage !== 'done' ? <Button variant="ghost" onClick={() => toast('취소 요청이 접수되었습니다', { description: '담당자와 승인자에게 알림이 전송됩니다.' })}><XCircle /> 취소</Button> : null}
            </div>
          </header>

          {r?.blocked ? (
            <Alert tone="warning" title={`막힘: ${r.blocked}`}>
              해결 후 담당자가 다음 단계로 이동시켜야 합니다.
            </Alert>
          ) : null}
          {r?.stage === 'staging' && requiredMissing > 0 && isOwner ? (
            <Alert tone="info" title={`필수 체크리스트 ${requiredMissing}건이 남았습니다`}>
              모두 완료해야 승인 단계로 넘어갈 수 있습니다.
            </Alert>
          ) : null}

          {r ? (
            <section className="rounded-lg border border-line bg-surface px-6 py-5 shadow-xs">
              <Steps steps={STAGES.map((s) => ({ id: s.id, label: s.label }))} current={stageIdx} />
            </section>
          ) : <Skeleton className="h-20" />}

          <section className="grid grid-cols-5 gap-6 rounded-lg border border-line bg-surface px-6 py-4 shadow-xs">
            {r ? (
              <>
                <Fact label="담당" value={<span className="inline-flex items-center gap-2"><Avatar name={r.owner} /> {r.owner}</span>} sub={r.team} />
                <Fact label="승인" value={<ApproverStack approvers={r.approvers} />} sub={r.risk === 'high' ? '고위험 — 3인 승인' : '2인 승인'} />
                <Fact label="위험도" value={<RiskLabel risk={r.risk} />} sub={r.type === 'hotfix' ? '핫픽스는 항상 고위험' : undefined} />
                <Fact label="배포 창" value={windowFmt.format(new Date(r.windowFrom))} sub={`~ ${windowFmt.format(new Date(r.windowTo))}`} />
                <Fact label="등록" value={formatRelative(r.createdAt)} sub={formatAbsolute(r.createdAt)} />
              </>
            ) : Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
          </section>

          <section className="flex flex-col gap-5">
            <Tabs
              aria-label="상세"
              value={tab}
              onChange={(t) => setParams({ tab: t }, { replace: true })}
              items={[
                { value: 'overview', label: '개요' },
                { value: 'approval', label: '승인', count: r ? r.approvers.filter((a) => a.decision === 'approved').length : undefined },
                { value: 'timeline', label: '타임라인', count: r?.timeline.length },
              ]}
            />
            {!r ? <Skeleton className="h-48" /> : tab === 'overview' ? <Overview r={r} canEdit={isOwner && r.stage !== 'done'} /> : tab === 'approval' ? <Approval r={r} myTurn={!!myTurn} onDecide={() => setDecide(true)} /> : <Timeline r={r} />}
          </section>

          {r ? <DecisionDialog release={decide ? r : null} onClose={() => setDecide(false)} /> : null}
          <ConfirmDialog
            open={confirmAdvance}
            onOpenChange={setConfirmAdvance}
            title={r?.stage === 'deploy' ? '배포를 완료 처리할까요?' : `${nextLabel} 단계로 이동할까요?`}
            description={r?.stage === 'deploy' ? '완료 처리하면 릴리스가 닫히고 이력에 기록됩니다.' : '이동하면 승인자와 이해관계자에게 알림이 전송됩니다.'}
            confirmLabel={r?.stage === 'deploy' ? '완료 처리' : '이동'}
            onConfirm={async () => {
              await advance.mutateAsync()
              toast.success(r?.stage === 'deploy' ? '배포가 완료 처리되었습니다' : `${nextLabel} 단계로 이동되었습니다`)
            }}
          />
        </>
      )}
    </PageBody>
  )
}

function Fact({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-sm font-medium leading-tight text-ink">{value}</span>
      {sub ? <span className="truncate text-xs text-muted">{sub}</span> : null}
    </div>
  )
}

function Overview({ r, canEdit }: { r: Release; canEdit: boolean }) {
  const check = useChecklist(r.id)
  const done = r.checklist.filter((c) => c.done).length
  return (
    <div className="grid grid-cols-[3fr_2fr] gap-8">
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-ink">변경 내용</h3>
          <ul className="flex flex-col gap-1.5 text-sm text-ink/85">
            {r.changes.map((c, i) => <li key={i} className="flex gap-2"><span className="mt-2 size-1 shrink-0 rounded-full bg-line-strong" />{c}</li>)}
          </ul>
        </section>
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-ink">롤백 계획</h3>
          <p className="rounded-lg border border-line bg-canvas px-4 py-3 text-sm leading-relaxed text-ink/85">{r.rollback}</p>
        </section>
      </div>
      <section className="flex h-fit flex-col gap-3 rounded-lg border border-line bg-surface p-4 shadow-xs">
        <div className="flex items-baseline justify-between">
          <h3 className="text-sm font-semibold text-ink">체크리스트</h3>
          <span className={cn('text-xs tnum', done === r.checklist.length ? 'text-success' : 'text-muted')}>{done}/{r.checklist.length}</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${(done / r.checklist.length) * 100}%` }} /></div>
        <ul className="flex flex-col gap-3 pt-1">
          {r.checklist.map((c) => (
            <li key={c.id}>
              <CheckboxField
                checked={c.done}
                disabled={!canEdit}
                onCheckedChange={(v) => check.mutate({ itemId: c.id, done: v === true })}
                label={<span className={cn(c.done && 'text-muted line-through')}>{c.label}</span>}
                description={c.required ? '필수' : undefined}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function Approval({ r, myTurn, onDecide }: { r: Release; myTurn: boolean; onDecide: () => void }) {
  return (
    <div className="flex flex-col gap-3">
      {myTurn ? (
        <Alert tone="info" title="귀하의 승인 차례입니다" action={<Button size="sm" onClick={onDecide}>검토하기</Button>}>
          체크리스트와 롤백 계획을 확인한 뒤 결정하십시오.
        </Alert>
      ) : null}
      <ul className="flex flex-col divide-y divide-line rounded-lg border border-line bg-surface shadow-xs">
        {r.approvers.map((a) => (
          <li key={a.name} className="grid grid-cols-[auto_1fr_auto] items-start gap-4 px-4 py-3">
            <Avatar name={a.name} size="md" />
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm font-medium text-ink">{a.name} <span className="font-normal text-muted">· {a.team}</span></span>
              {a.comment ? <p className="flex items-start gap-1.5 text-sm text-ink/80"><MessageSquare className="mt-0.5 size-3.5 shrink-0 text-muted" />{a.comment}</p> : null}
              {a.at ? <span className="text-xs text-muted" title={formatAbsolute(a.at)}>{formatRelative(a.at)}</span> : null}
            </div>
            <span className={cn('inline-flex items-center gap-1.5 text-sm', a.decision === 'approved' ? 'text-success' : a.decision === 'rejected' ? 'text-danger' : 'text-muted')}>
              {a.decision === 'approved' ? <><CheckCircle2 className="size-4" /> 승인</> : a.decision === 'rejected' ? <><ThumbsDown className="size-4" /> 반려</> : '대기 중'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const KIND: Record<Release['timeline'][number]['kind'], { cls: string }> = {
  create: { cls: 'bg-line-strong' }, stage: { cls: 'bg-accent' }, approve: { cls: 'bg-success' }, reject: { cls: 'bg-danger' }, comment: { cls: 'bg-line-strong' }, deploy: { cls: 'bg-success' },
}
function Timeline({ r }: { r: Release }) {
  const items = [...r.timeline].reverse()
  return (
    <ol className="relative flex flex-col gap-0 border-l border-line pl-6">
      {items.map((e, i) => (
        <li key={i} className="relative pb-5 last:pb-0">
          <span className={cn('absolute -left-[29px] top-1.5 size-2.5 rounded-full ring-4 ring-surface', KIND[e.kind].cls)} aria-hidden />
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-ink">{e.what}</span>
            <span className="text-xs text-muted"><Avatar name={e.who} className="mr-1 align-middle" />{e.who} · <span title={formatAbsolute(e.at)}>{formatRelative(e.at)}</span></span>
          </div>
        </li>
      ))}
    </ol>
  )
}
