import type { Meta, StoryObj } from '@storybook/react-vite'
import { DescriptionList, LogViewer, Sparkline, StatCard } from '@se/ui'

const meta = { title: '컴포넌트/데이터 표시', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/** 값이 이 화면의 목적일 때만. 장식용 KPI 나열 금지. 델타는 "어제 대비 +2" 어순, 좋은 방향은 upIsGood 이 정한다 */
export const 스탯_카드: Story = {
  name: '스탯 카드와 스파크라인',
  render: () => (
    <div className="grid max-w-3xl gap-6 rounded-lg border border-line bg-surface p-5 md:grid-cols-4">
      <StatCard label="실행 중" value={175} delta={{ value: 12, period: '어제 대비', upIsGood: null }} trend={[120, 140, 150, 160, 170, 168, 175]} />
      <StatCard label="24시간 실패" value={163} tone="danger" delta={{ value: 41, period: '어제 대비', upIsGood: false }} trend={[60, 70, 90, 100, 120, 150, 163]} />
      <StatCard label="성공률" value="75.0%" delta={{ value: -8.2, period: '어제 대비', format: (v) => `${v.toFixed(1)}%p` }} trend={[92, 90, 88, 85, 80, 78, 75]} trendFormat={(v) => `${v}%`} />
      <StatCard label="p50 소요" value="04:12" delta={{ value: 0, period: '어제 대비' }} trend={[250, 252, 248, 260, 255, 252, 252]} />
      <div className="col-span-full flex items-center gap-6 border-t border-line pt-4 text-xs text-muted">
        단독 스파크라인 <Sparkline data={[3, 5, 4, 7, 6, 8, 9, 7, 10]} /> 액센트 블록 위 <span className="rounded bg-accent p-2"><Sparkline data={[3, 5, 4, 7, 6, 8, 9, 7, 10]} inverse /></span>
      </div>
    </div>
  ),
}

/** 상세 화면의 기본 재료. ID·해시·경로는 mono */
export const 설명_목록: Story = {
  name: '설명 목록',
  render: () => (
    <div className="max-w-lg rounded-lg border border-line bg-surface p-5">
      <DescriptionList items={[{ label: '잡 ID', value: 'etl-daily-1148', mono: true }, { label: '파이프라인', value: 'etl-daily' }, { label: '소유자', value: 'jihoon' }, { label: '노드', value: 'gpu-01', mono: true }, { label: '시작', value: '2026-09-14 13:02:11 (30분 전)' }, { label: '이미지', value: 'registry/etl:2026.09.14-a1b2c3', mono: true }]} />
    </div>
  ),
}

const ESC = String.fromCharCode(27)
const LOG = [
  '2026-09-14T13:02:11Z INFO  starting etl-daily-1148 (attempt 1)',
  `2026-09-14T13:02:12Z INFO  ${ESC}[36mreading${ESC}[0m s3://se-raw/events/2026/09/14/*.parquet (1,204 files)`,
  ...Array.from({ length: 60 }, (_, i) => `2026-09-14T13:0${2 + Math.floor(i / 20)}:${String(10 + (i % 50)).padStart(2, '0')}Z INFO  chunk ${i + 1}/60 ok (${(12 + (i % 7)).toFixed(1)}s)`),
  `2026-09-14T13:05:41Z WARN  ${ESC}[33mretrying${ESC}[0m chunk 61 after timeout`,
  `2026-09-14T13:05:58Z ERROR ${ESC}[31mS3 PutObject AccessDenied${ESC}[0m for bucket se-exports`,
  '2026-09-14T13:05:58Z ERROR job failed: exit code 1',
]
/** 로그는 읽는 게 아니라 빨간 줄을 찾는 것. ANSI 색·레벨 강조·검색·따라가기 */
export const 로그_뷰어: Story = {
  name: '로그 뷰어',
  render: () => <LogViewer title="etl-daily-1148 · stdout" lines={LOG} height={360} />,
}
