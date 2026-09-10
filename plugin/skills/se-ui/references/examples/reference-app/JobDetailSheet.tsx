// 원본: examples/reference-app/src/pages/jobs/JobDetailSheet.tsx (자동 복사 — 수정하지 말 것, pnpm gen:skill-docs)
import * as React from 'react'
import { AlertTriangle, RotateCcw, XCircle } from 'lucide-react'
import {
  Button,
  ConfirmDialog,
  DescriptionList,
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  StatusBadge,
  LogViewer,
  Tabs,
  toast,
} from '@se/ui'
import { useCancelJob, useJobLogs, useRetryJob } from '../../api/jobs'
import type { Job } from '../../api/types'
import { formatAbsolute, formatDuration } from '@se/ui'

export function JobDetailSheet({ job, open, onClose }: { job: Job | null; open: boolean; onClose: () => void }) {
  const retry = useRetryJob()
  const cancel = useCancelJob()
  const [confirmCancel, setConfirmCancel] = React.useState(false)
  const [tab, setTab] = React.useState('overview')
  const logs = useJobLogs(open && tab === 'logs' ? job?.id : undefined, job?.state === 'running')
  React.useEffect(() => {
    if (!open) setTab('overview')
  }, [open])

  const canRetry = job?.state === 'failed' || job?.state === 'cancelled'
  const canCancel = job?.state === 'running' || job?.state === 'pending'

  const onRetry = async () => {
    if (!job) return
    try {
      await retry.mutateAsync(job.id)
      toast.success('재시도를 큐에 넣었습니다', { description: job.name })
    } catch (e) {
      toast.error('재시도 실패', { description: (e as Error).message })
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent width={tab === 'logs' ? 760 : 560} aria-describedby={undefined} className="transition-[width] duration-200">
        {job ? (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <SheetTitle className="font-mono">{job.name}</SheetTitle>
                <StatusBadge state={job.state} />
              </div>
              <SheetDescription className="font-mono text-xs">{job.id}</SheetDescription>
            </SheetHeader>
            <SheetBody className="flex flex-col gap-5">
              <Tabs value={tab} onChange={setTab} aria-label="상세" items={[{ value: 'overview', label: '개요' }, { value: 'logs', label: '로그', count: logs.data?.lines.length }]} className="-mt-1" />
              {tab === 'logs' ? (
                <LogViewer lines={logs.data?.lines ?? []} live={logs.data?.live} height="calc(100vh - 220px)" title={job.name} emptyText={logs.isPending ? '로그를 불러오는 중…' : job.state === 'pending' ? '아직 시작되지 않았습니다' : '로그가 없습니다'} />
              ) : (
              <>
              {job.error ? (
                <div role="alert" className="flex gap-2.5 rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-sm">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-danger">실패 원인</span>
                    <code className="text-xs text-ink">{job.error}</code>
                  </div>
                </div>
              ) : null}
              <DescriptionList
                columns={2}
                items={[
                  { label: '파이프라인', value: job.pipeline, mono: true },
                  { label: '소유자', value: job.owner },
                  { label: '시작', value: formatAbsolute(job.startedAt) },
                  { label: '소요', value: formatDuration(job.durationSec) },
                  { label: '노드', value: job.node, mono: true },
                  { label: '시도', value: `${job.attempts}회` },
                ]}
              />
              <section className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xs font-medium text-muted">로그 (마지막 {job.logTail.length}줄)</h3>
                  <Button variant="link" size="sm" onClick={() => setTab('logs')}>전체 로그</Button>
                </div>
                <pre className="overflow-x-auto rounded-lg border border-line bg-canvas p-4 font-mono text-xs leading-relaxed text-ink">
                  {job.logTail.join('\n')}
                </pre>
              </section>
              </>
              )}
            </SheetBody>
            <SheetFooter>
              {canCancel ? (
                <Button variant="ghost" onClick={() => setConfirmCancel(true)}>
                  <XCircle /> 취소
                </Button>
              ) : null}
              {canRetry ? (
                <Button variant="primary" onClick={onRetry} loading={retry.isPending}>
                  <RotateCcw /> 재시도
                </Button>
              ) : null}
            </SheetFooter>
            <ConfirmDialog
              open={confirmCancel}
              onOpenChange={setConfirmCancel}
              title="실행 중인 잡을 취소할까요?"
              description={
                <>
                  <code>{job.name}</code> 이(가) 즉시 중단되고 지금까지의 출력은 버려집니다. 되돌릴 수 없습니다.
                </>
              }
              confirmLabel="취소하기"
              cancelLabel="돌아가기"
              destructive
              typeToConfirm={job.name}
              onConfirm={async () => {
                await cancel.mutateAsync(job.id)
                toast('잡을 취소했습니다', { description: job.name })
              }}
            />
          </>
        ) : open ? (
          <SheetHeader>
            <SheetTitle>잡을 찾을 수 없습니다</SheetTitle>
            <SheetDescription>목록에서 사라졌거나 필터에 걸러졌을 수 있습니다.</SheetDescription>
          </SheetHeader>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
