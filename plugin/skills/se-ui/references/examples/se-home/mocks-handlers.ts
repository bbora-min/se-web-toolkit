// 원본: examples/se-home/src/mocks/handlers.ts (자동 복사 — 수정하지 말 것, pnpm gen:skill-docs)
import { delay, http, HttpResponse } from 'msw'
import type { Home, HomeEvent, QuickLink, RecentItem, Service } from '../api/types'

/** 시각은 전부 "지금" 기준 상대값 — e2e 가 시계를 고정하면 스크린샷이 매번 같다 */
const ago = (min: number) => new Date(Date.now() - min * 60_000).toISOString()
const later = (min: number) => new Date(Date.now() + min * 60_000).toISOString()

/** 레지스트리의 형제들 (identities/registry.json) + 운영 정보. 실제 백엔드는 레지스트리와 각 서비스의 /health 를 합친다 */
const services: Service[] = [
  { id: 'job-monitor', name: 'Job Monitor', description: '배치·ML 잡의 스케줄과 실행 결과. 실패한 잡은 상세에서 재시도.', hue: 195, monogram: 'JM', shell: 'sidebar', signature: 'status-strip', url: 'http://localhost:5173', team: 'data-platform', owner: 'bora', health: 'degraded', headline: '24시간 실패 163 · 노드 5/5', lastDeploy: { version: 'v4.19.0', at: ago(150) }, openIncidents: 1 },
  { id: 'dataset-explorer', name: 'Dataset Explorer', description: '웨어하우스의 모든 테이블을 한곳에서. 이름·컬럼·소유자·태그로 찾는다.', hue: 310, monogram: 'DE', shell: 'sidebar', signature: 'search-hero', url: 'http://localhost:5174', team: 'data-platform', owner: 'jihoon', health: 'ok', headline: '26개 데이터셋 · 4분 전 색인', lastDeploy: { version: 'v2.7.1', at: ago(60 * 26) }, openIncidents: 0 },
  { id: 'release-desk', name: 'Release Desk', description: '릴리스의 단계·승인·배포 창. 배포 프리즈는 여기서 정한다.', hue: 235, monogram: 'RD', shell: 'sidebar', signature: 'stage-rail', url: 'http://localhost:5175', team: 'platform', owner: 'minseo', health: 'ok', headline: '진행 중 19 · 막힘 8 · 내 승인 대기 5', lastDeploy: { version: 'v1.12.0', at: ago(60 * 5) }, openIncidents: 0 },
  { id: 'ai-voc', name: 'AI VOC', description: '고객의 소리를 LLM 이 분류·요약. 급증하는 주제를 먼저 보여준다.', hue: 278, monogram: 'AV', shell: 'sidebar', signature: 'status-strip', url: 'http://localhost:5176', team: 'cx-eng', owner: 'seoyeon', health: 'ok', headline: '오늘 1,204건 · 급증 주제 2', lastDeploy: { version: 'v0.9.3', at: ago(60 * 49) }, openIncidents: 0 },
  { id: 'incident-desk', name: 'Incident Desk', description: '인시던트 접수·에스컬레이션·포스트모템. 온콜이 가장 먼저 여는 화면.', hue: 215, monogram: 'ID', shell: 'sidebar', signature: 'stage-rail', url: 'http://localhost:5178', team: 'sre', owner: 'taeho', health: 'down', headline: 'P1 1건 진행 중 · 알림 지연', lastDeploy: { version: 'v0.3.0', at: ago(60 * 24 * 6) }, openIncidents: 1 },
]

const recent: RecentItem[] = [
  { id: 'r1', serviceId: 'job-monitor', kind: '잡', label: 'export-s3-1625', url: 'http://localhost:5173/jobs/export-s3-1625', at: ago(12) },
  { id: 'r2', serviceId: 'release-desk', kind: '릴리스', label: 'v4.19.0 · OAuth 토큰 갱신 버그 수정', url: 'http://localhost:5175/releases/v4.19.0', at: ago(35) },
  { id: 'r3', serviceId: 'incident-desk', kind: '인시던트', label: 'INC-2041 · 알림 지연', url: 'http://localhost:5178/incidents/INC-2041', at: ago(48) },
  { id: 'r4', serviceId: 'dataset-explorer', kind: '데이터셋', label: 'fct.orders_daily', url: 'http://localhost:5174/datasets/fct.orders_daily', at: ago(60 * 3) },
  { id: 'r5', serviceId: 'job-monitor', kind: '런북', label: 'S3 AccessDenied 대응', url: 'http://localhost:5173/runbooks/s3-access-denied', at: ago(60 * 5) },
  { id: 'r6', serviceId: 'ai-voc', kind: '잡', label: '주제 재분류 · 2026-09-19', url: 'http://localhost:5176/runs/2026-09-19', at: ago(60 * 22) },
]

/** 지난 24시간 — 배포는 success, 장애는 danger, 저하는 warning, 프리즈·점검은 neutral 구간 */
const events: HomeEvent[] = [
  { id: 'e1', serviceId: 'job-monitor', at: ago(60 * 21), label: 'v4.18.2 배포', tone: 'success' },
  { id: 'e2', serviceId: 'job-monitor', at: ago(60 * 3), label: '실패 증가 · export-s3', tone: 'warning' },
  { id: 'e3', serviceId: 'job-monitor', at: ago(150), label: 'v4.19.0 배포', tone: 'success' },
  { id: 'e4', serviceId: 'release-desk', at: ago(60 * 5), label: 'v1.12.0 배포', tone: 'success' },
  { id: 'e5', serviceId: 'release-desk', at: ago(60 * 2), until: later(60 * 7), label: '배포 창 · 금요일', tone: 'neutral' },
  { id: 'e6', serviceId: 'dataset-explorer', at: ago(60 * 14), until: ago(60 * 13), label: '전체 재색인', tone: 'neutral' },
  { id: 'e7', serviceId: 'incident-desk', at: ago(55), label: 'INC-2041 · P1 알림 지연', tone: 'danger' },
  { id: 'e8', serviceId: 'ai-voc', at: ago(60 * 8), label: '급증 주제 감지 · 결제 오류', tone: 'info' },
]

/** 형제 서비스의 주소 + 경로 — 실제 백엔드가 하는 일 */
const url = (id: string, path = '') => (services.find((s) => s.id === id)?.url ?? '') + path

function home(): Home {
  return {
    me: { name: 'bora' },
    generatedAt: new Date().toISOString(),
    services,
    recent,
    events,
    oncall: { name: 'minseo', team: 'sre', until: later(60 * 6), next: { name: 'taeho', from: later(60 * 6) }, scheduleUrl: url('incident-desk', '/oncall') },
    notices: [
      { id: 'n1', kind: 'freeze', title: '배포 프리즈 · 9월 18일(금) 18:00 – 21일(월) 09:00', detail: '주말 온콜 최소화. 이 기간의 배포 창은 승인되지 않아요.', at: ago(60 * 30) },
      { id: 'n2', kind: 'notice', title: '툴킷 0.10.0 — 쉘 배치 슬롯', detail: '새 서비스는 형제와 다른 배치(topnav·panes)를 고를 수 있어요.', at: ago(60 * 4) },
    ],
    quick: [
      { id: 'failed-jobs', label: '실패 중인 잡', href: url('job-monitor', '/jobs?state=failed'), count: 163, tone: 'danger' },
      { id: 'my-approvals', label: '내 승인 대기', href: url('release-desk', '/approvals'), count: 5 },
      { id: 'deploys-today', label: '오늘 배포', href: url('release-desk', '/calendar'), count: 2 },
      { id: 'oncall', label: '온콜 · minseo', href: url('incident-desk', '/oncall') },
    ] satisfies QuickLink[],
  }
}

async function devState(url: URL) {
  const s = url.searchParams.get('__state')
  if (s === 'slow') await delay(60_000)
  else await delay(200)
  if (s === 'error') return HttpResponse.json({ message: '레지스트리(registry-01)에 연결할 수 없어요' }, { status: 502 })
  if (s === 'empty') return HttpResponse.json({ ...home(), services: [], recent: [], events: [], notices: [], quick: [] })
  return null
}

export const handlers = [
  http.get('/api/home', async ({ request }) => {
    const url = new URL(request.url)
    const forced = await devState(url)
    if (forced) return forced
    return HttpResponse.json(home())
  }),
]
