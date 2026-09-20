import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Callout, DocHeader, DocLayout, Prose, TableOfContents, TreeNav } from '@se/ui'

/**
 * 문서 골격의 재료 — 좌측 트리 · 65자 본문(`Prose`) · 우측 목차. 읽는 화면이라 타이포와 여백이 전부다.
 * 원본 화면은 Dataset Explorer 도메인 가이드(`examples/dataset-explorer/DomainPage.tsx`).
 */
const meta = { title: '패턴/Doc', component: DocLayout, parameters: { layout: 'fullscreen' } } satisfies Meta<typeof DocLayout>
export default meta
type Story = StoryObj<typeof meta>

const TREE = [
  { id: 'events', label: 'events', hint: 6, children: [{ id: 'e1', label: 'clicks_v3' }, { id: 'e2', label: 'pageviews' }] },
  { id: 'dim', label: 'dim', hint: 5 },
  { id: 'fct', label: 'fct', hint: 5, children: [{ id: 'f1', label: 'orders_daily' }, { id: 'f2', label: 'revenue_hourly' }] },
  { id: 'raw', label: 'raw', hint: 4 },
]
const TOC = [{ id: 'overview', label: '개요' }, { id: 'rules', label: '적재 규약과 사용 규칙' }, { id: 'queries', label: '자주 쓰는 쿼리' }]

export const 문서: Story = {
  render: () => (
    <div className="mx-auto max-w-[1120px] px-8">
      <DocLayout aside={<TreeNav items={TREE} activeId="fct" onSelect={() => {}} />} toc={<TableOfContents items={TOC} />}>
        <DocHeader
          eyebrow="도메인 가이드 · fct"
          title="팩트 테이블 — 리포트의 기준 소스"
          summary="대시보드·주간 리포트가 이 테이블을 봐요. 숫자가 다르면 여기서부터 확인해요."
          meta={<><span>소유 <span className="text-ink">analytics</span> · minseo</span><span>3일 전 갱신</span><span>감시 7명</span></>}
          actions={<Button variant="ghost" size="sm">편집 제안</Button>}
        />
        <Prose>
          <section id="overview">
            <h2>개요</h2>
            <p>매일 06:00 KST 에 전날 분이 확정돼요. 그 전엔 부분 집계라 숫자가 움직여요. 통화는 전부 KRW 정수이고, 환율 변환은 <code>finance.settlements</code> 기준이에요.</p>
          </section>
          <section id="rules">
            <h2>적재 규약과 사용 규칙</h2>
            <ul>
              <li>재적재(backfill)는 파티션 단위로만.</li>
              <li>이력은 데이터셋 상세의 "최근 변경"에 남아요.</li>
            </ul>
            <Callout tone="info" title="확정 전 숫자">오늘 06:00 이전에 어제 숫자를 보면 부분 집계예요. 리포트는 확정 후에.</Callout>
          </section>
          <section id="queries">
            <h2>자주 쓰는 쿼리</h2>
            <pre><code>{`SELECT dt, store_id, SUM(revenue_krw) AS revenue\nFROM fct.orders_daily\nWHERE dt >= CURRENT_DATE() - 7\nGROUP BY 1, 2`}</code></pre>
          </section>
        </Prose>
      </DocLayout>
    </div>
  ),
}
