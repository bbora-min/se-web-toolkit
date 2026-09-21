/**
 * 온보딩 문서(시작하기·동작 원리)가 스킬·스키마·템플릿에서 베낀 사실들.
 * 순수 데이터 — `scripts/check-site-docs.ts` 가 이 파일을 읽어 원본(plugin/skills, identity.schema.json, templates/, eslint-plugin)과 대조한다.
 * 스킬 절차가 바뀌면 검사가 실패하고, 이 파일과 페이지를 고치면 된다.
 */
import type { TreeNode } from '../components/diagrams'

/** 명령 표 — 이름은 plugin/skills/<name>/SKILL.md 의 description 끝 인용("/se:new <id>")과 같아야 한다 */
export const COMMANDS: Array<[cmd: string, when: string, what: string]> = [
  ['/se:new <id>', '새 앱', '템플릿 생성 → 아이덴티티 인터뷰 → 설치 → 첫 실행'],
  ['/se:identity', '아이덴티티', '항목 8개를 2–3가지 안으로 제시해 정하고, 검증 후 레지스트리에 등록'],
  ['/se:spec <요구사항>', '명세', '요구사항 문장 → 화면 명세(docs/spec.md). Figma 없는 팀의 디자인 단계'],
  ['/se:page <화면>', '구현', '골격 선택 → 원본 복사·수정 → 목 데이터 → 3가지 상태 → 등록 → 린트 → 스크린샷'],
  ['/se:review [라우트]', '리뷰', '스크린샷 → 디자인 비평·코드 리뷰 에이전트 → 수정 → 재채점(80점 만점)'],
  ['/se:api <spec>', '백엔드', 'OpenAPI·설명으로 타입 클라이언트·훅. 목 데이터는 실제 응답 형태로'],
  ['/se:deploy', '배포', 'Dockerfile·nginx·CI 점검, 환경 변수 체크리스트, 프로덕션 빌드'],
  ['/se:upgrade [버전]', '업그레이드', '@se/* 를 새 태그로. CHANGELOG "앱에서 할 일" → 검사 → 전/후 스크린샷 → PR'],
  ['/se:audit', '점검', '규칙 위반·3상태 누락·버전·디자인 점수를 숫자로(docs/audit.md)'],
  ['/se:adopt [0-5]', '도입', '기존 프로젝트에 단계적으로. 단계마다 PR 하나'],
]

/** /se:new 의 아이덴티티 인터뷰 문항 수 — new/SKILL.md "인터뷰 N문항" */
export const INTERVIEW_QUESTIONS = 5

/** /se:page 절차 — page/SKILL.md "## 절차" 의 번호 항목과 개수가 같아야 한다 */
export const PAGE_STEP_TITLES = ['디자인 플랜 10줄', '골격 고르고 원본 열기', '데이터 층', '화면', '등록', '검사', '스크린샷 1회', '보고']

/** /se:adopt 단계 — adopt/SKILL.md 의 "| **N 이름** |" 행과 개수가 같아야 한다 */
export const ADOPT_STAGES: Array<[stage: string, what: string, result: string]> = [
  ['0 감사', '스택·Node·패키지 매니저·Tailwind 버전·옛 UI 라이브러리 파악', '리포트'],
  ['1 아이덴티티', '현재 서비스의 색·말투를 보존하며 se.identity.json 작성', 'PR'],
  ['2 기반', '@se/* 설치, Vite 플러그인, CSS 네 줄, 루트 프로바이더. 화면 변화 0을 픽셀 비교로 증명', 'PR'],
  ['3 쉘', '기존 네비·헤더를 AppShell로', 'PR'],
  ['4 페이지', 'codemod로 80% 자동 변환 → 트래픽 많은 페이지부터 한 장씩', '페이지별 PR'],
  ['5 강제', '린트 규칙 켜기, CI에 lint 추가', 'PR'],
]

/** create-se-app 이 만드는 파일 — templates/app-vite-react 에 실제로 있어야 한다(children 이 없는 노드만 검사) */
export const TEMPLATE_TREE: TreeNode[] = [
  { name: 'se.identity.json', note: '아이덴티티 한 장 — 색·마크·시그니처·쉘 배치·밀도·글꼴·말투', mark: true },
  { name: 'docs', children: [{ name: 'spec.md', note: '화면 명세. /se:spec 이 채운다', mark: true }] },
  { name: 'src', children: [
    { name: 'app', children: [{ name: 'App.tsx', note: '라우트' }, { name: 'Shell.tsx', note: '네비·검색 팔레트' }] },
    { name: 'api', note: '백엔드와의 유일한 접점', mark: true, children: [{ name: 'client.ts', note: 'VITE_API_BASE 또는 /api(목)' }, { name: 'types.ts' }, { name: 'items.ts', note: 'useQuery 훅' }] },
    { name: 'mocks', note: 'MSW 목 — 백엔드 없이 개발', mark: true, children: [{ name: 'handlers.ts', note: '?__state=empty|error|slow 지원' }] },
    { name: 'pages', note: '화면 하나 = 폴더 하나', mark: true, children: [{ name: 'items', children: [{ name: 'ItemsPage.tsx', note: '첫 화면(목록 골격)' }, { name: 'Signature.tsx' }] }, { name: 'identity', children: [{ name: 'IdentityPage.tsx', note: '/__identity (개발 전용)' }] }] },
    { name: 'main.tsx' }, { name: 'app.css', note: '네 줄. 건드릴 일 없음' },
  ] },
  { name: 'e2e', children: [{ name: 'screens.spec.ts', note: '스크린샷 찍을 화면 목록' }] },
  { name: 'CLAUDE.md', note: 'Claude가 이 앱에서 지킬 규칙' },
  { name: 'eslint.config.js', note: '@se/eslint-plugin 규칙' },
  { name: 'Dockerfile', note: '배포. 5절' }, { name: 'nginx.conf', note: 'SPA fallback · /api 프록시' }, { name: '.github', children: [{ name: 'workflows', children: [{ name: 'ci.yml', note: 'typecheck → lint → build' }] }] },
]

/** 린트 규칙 — packages/eslint-plugin/src/rules/<name>.js 와 같아야 한다 */
export const RULES: Array<[name: string, what: string, bad: string, good: string]> = [
  ['no-raw-color', '색은 토큰 클래스만', 'className="bg-[#1e293b]"', 'className="bg-surface-2"'],
  ['no-raw-control', '컨트롤·표는 @se/ui', '<button onClick={…}>저장</button>', '<Button onClick={…}>저장</Button>'],
  ['import-from-ui', '기반 라이브러리 직접 import 금지', "import * as Dialog from '@radix-ui/react-dialog'", "import { Dialog } from '@se/ui'"],
  ['page-states', '원격 표는 loading · empty · error', '<DataTable columns data />', '<DataTable columns data loading empty error />'],
  ['single-accent', '한 화면에 primary 버튼 하나', '<Button variant="primary">저장</Button> <Button variant="primary">삭제</Button>', '<Button variant="primary">저장</Button> <Button variant="ghost">삭제</Button>'],
]

/** 아이덴티티 항목 — identity.schema.json 의 properties 와 enum 을 따른다. 값이 열거형이면 " · " 로 잇는다 */
export const SLOTS: Array<[key: string, values: string, where: string]> = [
  ['mark', '모노그램 2–3글자', '앱 쉘 로고, 파비콘, 형제 목록의 마크'],
  ['accent.hue', '0–360°', '액센트 색. 버튼·활성 탭·선택 행·시그니처 블록'],
  ['neutralBias', 'cool · warm · neutral · accent', '회색의 기울기 — 바탕·표면·선의 온도'],
  ['signature', 'status-strip · search-hero · stage-rail · timeline-ribbon · metric-marquee', '첫 화면 상단의 "이 서비스다운" 한 조각'],
  ['shell', 'sidebar · topnav · panes', '앱 쉘 배치. 같은 배치는 두 서비스까지'],
  ['density', 'compact · comfortable', '표 행 높이·간격'],
  ['displayFont', 'pretendard · ibm-plex-sans · noto-sans-kr · ibm-plex-mono', '제목 글꼴'],
  ['tone', 'terse · friendly · procedural', '빈 화면·오류·알림의 말투. 어미까지'],
]
