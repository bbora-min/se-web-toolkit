import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Plus } from 'lucide-react'
import { Alert, Button, ConfirmDialog, DescriptionList, Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, EmptyState, ErrorState, Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, Skeleton, Steps, toast } from '@se/ui'

const meta = { title: '컴포넌트/상태와 피드백', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/** 모든 화면은 세 상태를 가진다. 빈 상태는 "다음 행동", 로딩은 형태를 유지한 스켈레톤, 에러는 원인 + 해결 */
export const 세_상태: Story = {
  name: '세 상태 — 로딩·빈·에러',
  render: () => (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-lg border border-line bg-surface p-4"><div className="flex flex-col gap-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /><Skeleton className="h-4 w-2/3" /></div></div>
      <div className="rounded-lg border border-line bg-surface"><EmptyState title="아직 등록된 장애가 없습니다" description="첫 장애를 등록하면 여기에 심각도 순으로 보입니다" action={<Button size="sm" variant="secondary"><Plus /> 장애 등록</Button>} /></div>
      <div className="rounded-lg border border-line bg-surface"><ErrorState title="목록을 불러오지 못했습니다" description="스케줄러 API(scheduler-01)에 연결할 수 없습니다" action={<Button size="sm" variant="secondary">다시 시도</Button>} /></div>
    </div>
  ),
}

/** 배너는 "지금 상태", 토스트는 "방금 일어난 일" */
export const 배너와_토스트: Story = {
  name: '배너와 토스트',
  render: () => (
    <div className="flex flex-col gap-3">
      <Alert tone="info" title="9월 14일 02:00–03:00 스케줄러 점검">그 시간의 잡은 자동으로 03:10 이후로 밀립니다.</Alert>
      <Alert tone="warning" title="배포 프리즈: 9월 11일 (금) 18:00 – 9월 14일 (월) 09:00" action={<Button size="sm" variant="ghost">규칙 보기</Button>}>주말 온콜 최소화. 이 기간의 배포 창은 승인되지 않습니다.</Alert>
      <Alert tone="danger" title="gpu-01 디스크 92%">24시간 안에 가득 찹니다. 오래된 체크포인트를 정리하세요.</Alert>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => toast.success('재시도를 큐에 넣었습니다', { description: 'etl-daily-1148' })}>성공 토스트</Button>
        <Button size="sm" variant="secondary" onClick={() => toast.error('취소하지 못했습니다', { description: '잡이 이미 끝났습니다' })}>실패 토스트</Button>
      </div>
    </div>
  ),
}

/** 다이얼로그는 짧은 결정, 시트는 목록 옆의 상세. 위험 동작은 ConfirmDialog — 되돌릴 수 없으면 이름을 다시 입력 */
export const 오버레이: Story = {
  render: function Render() {
    const [confirm, setConfirm] = React.useState(false)
    const [destroy, setDestroy] = React.useState(false)
    return (
      <div className="flex flex-wrap gap-2">
        <Dialog>
          <DialogTrigger asChild><Button variant="secondary">다이얼로그</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>담당자 배정</DialogTitle><DialogDescription>INC-1042 를 맡을 사람을 고릅니다.</DialogDescription></DialogHeader>
            <DialogBody><DescriptionList items={[{ label: '장애', value: 'INC-1042', mono: true }, { label: '심각도', value: 'S1' }, { label: '접수', value: '12분 전' }]} /></DialogBody>
            <DialogFooter><Button variant="ghost">취소</Button><Button variant="primary">배정</Button></DialogFooter>
          </DialogContent>
        </Dialog>
        <Sheet>
          <SheetTrigger asChild><Button variant="secondary">시트</Button></SheetTrigger>
          <SheetContent>
            <SheetHeader><SheetTitle>etl-daily-1148</SheetTitle><SheetDescription>etl-daily · jihoon · 30분 전 시작</SheetDescription></SheetHeader>
            <SheetBody><Steps current={2} steps={[{ id: 'q', label: '큐' }, { id: 'r', label: '실행' }, { id: 'v', label: '검증' }, { id: 'd', label: '완료' }]} /></SheetBody>
          </SheetContent>
        </Sheet>
        <Button variant="secondary" onClick={() => setConfirm(true)}>확인</Button>
        <Button variant="danger" onClick={() => setDestroy(true)}>삭제 (이름 입력)</Button>
        <ConfirmDialog open={confirm} onOpenChange={setConfirm} title="12건을 재시도할까요?" description="실패한 잡이 큐의 맨 뒤에 다시 들어갑니다. 취소할 수 있습니다." confirmLabel="재시도" onConfirm={() => { toast.success('12건을 재시도 큐에 넣었습니다') }} />
        <ConfirmDialog open={destroy} onOpenChange={setDestroy} destructive typeToConfirm="etl-daily" title="파이프라인 etl-daily 를 삭제할까요?" description="예약된 잡 34건이 함께 사라지고 되돌릴 수 없습니다." confirmLabel="삭제" onConfirm={() => { toast.error('etl-daily 를 삭제했습니다') }} />
      </div>
    )
  },
}
