import type { Meta, StoryObj } from '@storybook/react-vite'
import { BarChart, ChartCard, LineChart, MeterList, type Series } from '@se/charts'

const meta = { title: '차트/@se charts', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const FLOW: Series[] = [{ key: 'ok', label: '성공', color: 'success' }, { key: 'fail', label: '실패', color: 'danger' }, { key: 'cancel', label: '취소', color: 'neutral' }]
const HOURS = Array.from({ length: 24 }, (_, i) => ({ h: `${(i + 17) % 24}시`, ok: 6 + ((i * 7) % 9), fail: (i * 5) % 4, cancel: i % 6 === 0 ? 1 : 0 }))

/** 색은 전부 CSS 변수 — 의미 색은 상태에만, 계열은 chart-1..8 순서. 축선 없음, 가로 점선 격자, 2개 이상 시리즈면 범례 */
export const 막대: Story = {
  render: () => (
    <ChartCard title="시간별 완료" description="정시 기준 24시간. 실패는 빨강." legend={FLOW} actions={<span className="text-xs text-accent-fg">실패만 보기 →</span>}>
      <BarChart data={HOURS} xKey="h" series={FLOW} stacked xInterval={4} />
    </ChartCard>
  ),
}

const DAYS = Array.from({ length: 30 }, (_, i) => ({ d: `9/${i + 1}`, p50: 240 + Math.round(40 * Math.sin(i / 3)), p95: 520 + Math.round(90 * Math.sin(i / 4 + 1)) }))
const LAT: Series[] = [{ key: 'p50', label: 'p50', color: 'chart-1' }, { key: 'p95', label: 'p95', color: 'chart-2' }]
/** 목표선(referenceLines)은 점선 + 우측 라벨. 색은 의미가 있을 때만 */
export const 선과_목표선: Story = {
  name: '선과 목표선',
  render: () => (
    <ChartCard title="응답 시간" description="일별 p50 · p95 (ms). 목표 p95 ≤ 500ms" legend={LAT}>
      <LineChart data={DAYS} xKey="d" series={LAT} xInterval={6} yFormat={(v) => `${v}ms`} referenceLines={[{ y: 500, label: '목표 500ms', color: 'warning' }]} />
    </ChartCard>
  ),
}

/** 순위·비율 비교. 채움은 심각도(accent → warning → danger), 카테고리는 chart-N 으로 배지·차트와 색을 맞춘다 */
export const 미터_목록: Story = {
  name: '미터 목록',
  render: () => (
    <div className="grid gap-4 md:grid-cols-2">
      <ChartCard title="파이프라인별 성공률" description="낮은 순. 눌러서 해당 파이프라인 잡을 봅니다.">
        <MeterList items={[
          { label: 'model-train', value: 88.9, display: '88.9%', sub: '48회', tone: 'danger', onClick: () => {} },
          { label: 'report-hourly', value: 91.4, display: '91.4%', sub: '34회', tone: 'danger', onClick: () => {} },
          { label: 'index-rebuild', value: 95.8, display: '95.8%', sub: '25회', tone: 'warning', onClick: () => {} },
          { label: 'export-s3', value: 97.5, display: '97.5%', sub: '57회', onClick: () => {} },
          { label: 'etl-daily', value: 99.2, display: '99.2%', sub: '20회', onClick: () => {} },
        ]} />
      </ChartCard>
      <ChartCard title="카테고리별 티켓" description="이번 주. 색은 카테고리 배지와 같다.">
        <MeterList items={[
          { label: '결제 오류', value: 42, display: '42%', sub: '118건', tone: 'chart-1' },
          { label: '로그인 문제', value: 27, display: '27%', sub: '76건', tone: 'chart-2' },
          { label: '기능 요청', value: 19, display: '19%', sub: '53건', tone: 'chart-3' },
          { label: '기타', value: 12, display: '12%', sub: '34건', tone: 'neutral' },
        ]} />
      </ChartCard>
    </div>
  ),
}
