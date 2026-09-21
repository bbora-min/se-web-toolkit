import type { AppId } from './links'
import ledger from '../../../../examples/reference-app/e2e/__snapshots__/jobs-light-1280.png'
import hub from '../../../../examples/se-home/e2e/__snapshots__/home-light-1280.png'
import wall from '../../../../examples/reference-app/e2e/__snapshots__/overview-light-1280.png'
import board from '../../../../examples/release-desk/e2e/__snapshots__/releases-board-light-1280.png'
import doc from '../../../../examples/dataset-explorer/e2e/__snapshots__/domain-light-1280.png'
import triage from '../../../../examples/release-desk/e2e/__snapshots__/approvals-light-1280.png'
import console_ from '../../../../examples/reference-app/e2e/__snapshots__/job-console-light-1280.png'
import calendar from '../../../../examples/release-desk/e2e/__snapshots__/calendar-light-1280.png'
import canvas from '../../../../examples/reference-app/e2e/__snapshots__/pipeline-light-1280.png'
import chat from '../../../../examples/dataset-explorer/e2e/__snapshots__/ask-thread-light-1280.png'

export interface Archetype {
  id: string
  name: string
  en: string
  /** 어떤 화면에 쓰는 골격인지 — 한 문장 */
  when: string
  /** 화면 구성 */
  shape: string
  /** 원본 화면 */
  app: AppId
  appName: string
  path: string
  /** 구성 요소 — @se/ui 컴포넌트·패턴 */
  parts: string[]
  /** 이 골격의 대표 사례 */
  refs: string[]
  /** 툴킷 버전 */
  since: string
  shot: string
}

/** 화면 골격 10가지 — 화면을 만들 때 가장 먼저 정하는 것. 서비스 단위가 아니라 화면마다 고른다 */
export const ARCHETYPES: Archetype[] = [
  { id: 'ledger', name: '원장', en: 'Ledger', when: '같은 종류의 항목이 수백 개 있고, 찾아서 하나를 열어 보는 화면입니다.', shape: '필터 바 · 표 · 오른쪽 상세 패널', app: 'job-monitor', appName: 'Job Monitor', path: '/jobs', parts: ['DataTable', 'FilterBar', 'ListDetail', 'PageHeader'], refs: ['Linear', 'Vercel', 'Stripe Dashboard'], since: '0.1.0', shot: ledger },
  { id: 'hub', name: '허브', en: 'Hub', when: '여러 서비스로 들어가는 입구입니다. 목록이 아니라 고르는 화면입니다.', shape: '상단 네비 · 큰 검색 · 서비스 카드 · 최근 항목', app: 'se-home', appName: 'SE Home', path: '/', parts: ['AppShell topnav', 'TimelineRibbon', 'Chip', 'SectionHeader', 'ServiceMark'], refs: ['Google Cloud Console', 'Backstage', 'Notion Home'], since: '0.11.0', shot: hub },
  { id: 'wall', name: '관측 벽', en: 'Observation wall', when: '지금 상태가 괜찮은지 3초 안에 파악하는 화면입니다. 숫자와 추세가 중심입니다.', shape: '12칸 타일 격자 · 차트 · 상태 띠', app: 'job-monitor', appName: 'Job Monitor', path: '/overview', parts: ['TileGrid', 'Tile', 'StatCard', 'ChartLegend', '@se/charts'], refs: ['Grafana', 'Datadog', 'Vercel Analytics'], since: '0.12.0', shot: wall },
  { id: 'board', name: '보드', en: 'Board', when: '일이 단계를 거쳐 흘러갑니다. 어느 단계에 몰려 있는지 한눈에 보는 화면입니다.', shape: '단계별 열 · 카드 · 끌어서 옮기기', app: 'release-desk', appName: 'Release Desk', path: '/releases?view=board', parts: ['Board', 'BoardColumn', 'BoardCard'], refs: ['Linear Board', 'Trello', 'GitHub Projects'], since: '0.13.0', shot: board },
  { id: 'doc', name: '문서', en: 'Document', when: '읽는 화면입니다. 규약·가이드·런북에 씁니다.', shape: '왼쪽 문서 트리 · 본문(Prose) · 오른쪽 목차', app: 'dataset-explorer', appName: 'Dataset Explorer', path: '/domains/fct', parts: ['DocLayout', 'DocHeader', 'Prose', 'TreeNav', 'TableOfContents', 'Callout'], refs: ['Stripe Docs', 'Notion', 'GitBook'], since: '0.14.0', shot: doc },
  { id: 'triage', name: '트리아지', en: 'Triage', when: '내 차례인 항목을 하나씩 처리하는 화면입니다. 결정이 주된 동작입니다.', shape: '대기열 · 대상 · 결정 패널의 3단 구성', app: 'release-desk', appName: 'Release Desk', path: '/approvals', parts: ['SplitPane', 'ShellFill', 'DecisionDialog 패턴'], refs: ['Gmail', 'Superhuman', 'PagerDuty'], since: '0.15.0', shot: triage },
  { id: 'console', name: '콘솔', en: 'Console', when: '대상 하나의 로그와 상태를 실시간으로 보는 화면입니다.', shape: '헤더 · 왼쪽 필터(패싯) · 로그 뷰어(실시간 따라가기)', app: 'job-monitor', appName: 'Job Monitor', path: '/jobs/demo-running/logs', parts: ['LogViewer', 'FacetGroup', 'ShellFill fixed'], refs: ['GitHub Actions', 'Vercel Deploy', 'Cloud Logging'], since: '0.16.0', shot: console_ },
  { id: 'calendar', name: '일정', en: 'Calendar', when: '언제인지가 핵심인 화면입니다. 일정이 겹치는 날과 빈 날을 봅니다.', shape: '월 격자 · 이벤트 · 기간 띠', app: 'release-desk', appName: 'Release Desk', path: '/calendar', parts: ['CalendarGrid', 'monthDays', 'lib/date'], refs: ['Google Calendar', 'Cron', 'Linear Cycles'], since: '0.17.0', shot: calendar },
  { id: 'canvas', name: '캔버스', en: 'Canvas', when: '관계 자체가 내용인 화면입니다. 노드와 선으로 그립니다.', shape: '그래프 · 노드를 고르면 옆 패널에 상세', app: 'job-monitor', appName: 'Job Monitor', path: '/pipelines', parts: ['@se/canvas Canvas', 'TaskNode', 'dagLayout'], refs: ['Airflow Graph', 'Figma', 'n8n'], since: '0.18.0', shot: canvas },
  { id: 'chat', name: '대화', en: 'Chat', when: '묻고 답하는 화면입니다. 답에는 출처가 붙습니다.', shape: '대화 목록 · 대화 본문 · 입력 상자', app: 'dataset-explorer', appName: 'Dataset Explorer', path: '/ask/t1', parts: ['Thread', 'Message', 'Composer', 'Citation'], refs: ['ChatGPT', 'Claude', 'Perplexity'], since: '0.19.0', shot: chat },
]
