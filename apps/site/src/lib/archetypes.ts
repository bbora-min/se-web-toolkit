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
  /** 언제 이 골격인가 — 한 문장 */
  when: string
  /** 화면이 어떻게 생겼나 */
  shape: string
  /** 원본 화면 */
  app: AppId
  appName: string
  path: string
  /** 재료 — @se/ui 컴포넌트·패턴 */
  parts: string[]
  /** 세상에서 이 골격의 대표 */
  refs: string[]
  /** 툴킷 버전 */
  since: string
  shot: string
}

/** 골격 열 개 — 화면 단위의 첫 결정. 서비스가 아니라 화면마다 고른다 */
export const ARCHETYPES: Archetype[] = [
  { id: 'ledger', name: '원장', en: 'Ledger', when: '같은 종류의 것이 수백 개 있고, 찾아서 하나를 열어 본다', shape: '필터 바 · 표 · 오른쪽 상세', app: 'job-monitor', appName: 'Job Monitor', path: '/jobs', parts: ['DataTable', 'FilterBar', 'ListDetail', 'PageHeader'], refs: ['Linear', 'Vercel', 'Stripe Dashboard'], since: '0.1.0', shot: ledger },
  { id: 'hub', name: '허브', en: 'Hub', when: '여러 서비스의 입구. 목록이 아니라 고르는 화면', shape: '상단 네비 · 큰 검색 · 서비스 카드 · 최근 항목', app: 'se-home', appName: 'SE Home', path: '/', parts: ['AppShell topnav', 'TimelineRibbon', 'Chip', 'SectionHeader', 'ServiceMark'], refs: ['Google Cloud Console', 'Backstage', 'Notion Home'], since: '0.11.0', shot: hub },
  { id: 'wall', name: '관측 벽', en: 'Observation wall', when: '지금 괜찮은지 3초 안에. 숫자와 추세가 주인공', shape: '12칸 타일 벽 · 차트 · 상태 띠', app: 'job-monitor', appName: 'Job Monitor', path: '/overview', parts: ['TileGrid', 'Tile', 'StatCard', 'ChartLegend', '@se/charts'], refs: ['Grafana', 'Datadog', 'Vercel Analytics'], since: '0.12.0', shot: wall },
  { id: 'board', name: '보드', en: 'Board', when: '일이 단계를 지나간다. 어디에 몰렸는지 한눈에', shape: '단계 열 · 카드 · 끌어서 옮기기', app: 'release-desk', appName: 'Release Desk', path: '/releases?view=board', parts: ['Board', 'BoardColumn', 'BoardCard'], refs: ['Linear Board', 'Trello', 'GitHub Projects'], since: '0.13.0', shot: board },
  { id: 'doc', name: '문서', en: 'Document', when: '읽는 화면. 규약·가이드·런북', shape: '왼쪽 트리 · 본문(Prose) · 오른쪽 목차', app: 'dataset-explorer', appName: 'Dataset Explorer', path: '/domains/fct', parts: ['DocLayout', 'DocHeader', 'Prose', 'TreeNav', 'TableOfContents', 'Callout'], refs: ['Stripe Docs', 'Notion', 'GitBook'], since: '0.14.0', shot: doc },
  { id: 'triage', name: '트리아지', en: 'Triage', when: '내 차례인 것들을 하나씩 처리한다. 결정이 주 액션', shape: '큐 · 대상 · 결정 패널 3단', app: 'release-desk', appName: 'Release Desk', path: '/approvals', parts: ['SplitPane', 'ShellFill', 'DecisionDialog 패턴'], refs: ['Gmail', 'Superhuman', 'PagerDuty'], since: '0.15.0', shot: triage },
  { id: 'console', name: '콘솔', en: 'Console', when: '한 대상의 흐르는 로그와 상태를 본다', shape: '헤더 · 왼쪽 패싯 · 로그 뷰어(라이브 테일)', app: 'job-monitor', appName: 'Job Monitor', path: '/jobs/demo-running/logs', parts: ['LogViewer', 'FacetGroup', 'ShellFill fixed'], refs: ['GitHub Actions', 'Vercel Deploy', 'Cloud Logging'], since: '0.16.0', shot: console_ },
  { id: 'calendar', name: '일정', en: 'Calendar', when: '언제인지가 핵심. 겹침과 빈 날을 본다', shape: '월 격자 · 이벤트 · 기간 띠', app: 'release-desk', appName: 'Release Desk', path: '/calendar', parts: ['CalendarGrid', 'monthDays', 'lib/date'], refs: ['Google Calendar', 'Cron', 'Linear Cycles'], since: '0.17.0', shot: calendar },
  { id: 'canvas', name: '캔버스', en: 'Canvas', when: '관계가 내용이다. 노드와 선', shape: '그래프 · 선택하면 옆 패널', app: 'job-monitor', appName: 'Job Monitor', path: '/pipelines', parts: ['@se/canvas Canvas', 'TaskNode', 'dagLayout'], refs: ['Airflow Graph', 'Figma', 'n8n'], since: '0.18.0', shot: canvas },
  { id: 'chat', name: '대화', en: 'Chat', when: '묻고 답한다. 출처 있는 답', shape: '스레드 목록 · 대화 컬럼 · 컴포저', app: 'dataset-explorer', appName: 'Dataset Explorer', path: '/ask/t1', parts: ['Thread', 'Message', 'Composer', 'Citation'], refs: ['ChatGPT', 'Claude', 'Perplexity'], since: '0.19.0', shot: chat },
]
