/**
 * 동작 원리 — 신입이 "왜 이렇게 되어 있나"를 설명할 수 있게. 그림 위주.
 * 큰 그림 → 패키지 계층 → 아이덴티티 → 골격 → 화면이 만들어지는 길 → 데이터 층 → 3상태 → 규칙과 린트 → 릴리스 → 저장소 지도 → 용어.
 */
import { Link } from 'react-router'
import { Callout, DocHeader, DocLayout, PageBody, Prose, Table, TableBody, TableCell, TableHead, TableHeader, TableOfContents, TableRow, type TocItem } from '@se/ui'
import { Compare, Figure, Flow, Stack, Tree } from '../components/diagrams'
import { ARCHETYPES } from '../lib/archetypes'
import idJm from '../../../../examples/reference-app/e2e/__snapshots__/identity-light-1280.png'
import idDe from '../../../../examples/dataset-explorer/e2e/__snapshots__/identity-light-1280.png'
import idRd from '../../../../examples/release-desk/e2e/__snapshots__/identity-light-1280.png'
import jobs from '../../../../examples/reference-app/e2e/__snapshots__/jobs-light-1280.png'
import jobsEmpty from '../../../../examples/reference-app/e2e/__snapshots__/jobs-empty-light-1280.png'
import jobsError from '../../../../examples/reference-app/e2e/__snapshots__/jobs-error-light-1280.png'

const TOC: TocItem[] = [
  { id: 'big', label: '큰 그림', level: 2 },
  { id: 'packages', label: '패키지 계층', level: 2 },
  { id: 'identity', label: '아이덴티티가 모습을 정합니다', level: 2 },
  { id: 'archetype', label: '골격이 구조를 정합니다', level: 2 },
  { id: 'page', label: '화면 하나가 만들어지는 길', level: 2 },
  { id: 'data', label: '데이터 층과 목', level: 2 },
  { id: 'states', label: '화면마다 세 가지 상태', level: 2 },
  { id: 'rules', label: '규칙은 린트가 지킵니다', level: 2 },
  { id: 'release', label: '릴리스와 업그레이드', level: 2 },
  { id: 'repo', label: '툴킷 저장소 지도', level: 2 },
  { id: 'glossary', label: '용어', level: 2 },
]

const SLOTS = [
  ['mark', '모노그램 2–3글자', '앱 쉘 로고, 파비콘, 형제 목록의 마크'],
  ['accent.hue', '0–360°', '액센트 색. 버튼·활성 탭·선택 행·시그니처 블록'],
  ['neutralBias', 'cool · warm · neutral · accent', '회색의 기울기 — 바탕·표면·선의 온도'],
  ['signature', 'status-strip · search-hero · stage-rail · timeline-ribbon · metric-marquee', '첫 화면 상단의 "이 서비스다운" 한 조각'],
  ['shell', 'sidebar · topnav · panes', '앱 쉘 배치. 같은 배치는 두 서비스까지'],
  ['density', 'compact · comfortable', '표 행 높이·간격'],
  ['displayFont', 'pretendard · ibm-plex-sans · noto-sans-kr · ibm-plex-mono', '제목 글꼴'],
  ['tone', 'terse · friendly · procedural', '빈 화면·오류·알림의 말투. 어미까지'],
]

const RULES = [
  ['no-raw-color', '색은 토큰 클래스만', 'className="bg-[#1e293b]"', 'className="bg-surface-2"'],
  ['no-raw-control', '컨트롤·표는 @se/ui', '<button onClick={…}>저장</button>', '<Button onClick={…}>저장</Button>'],
  ['import-from-ui', '기반 라이브러리 직접 import 금지', "import * as Dialog from '@radix-ui/react-dialog'", "import { Dialog } from '@se/ui'"],
  ['page-states', '원격 표는 loading · empty · error', '<DataTable columns data />', '<DataTable columns data loading empty error />'],
  ['single-accent', '한 화면에 primary 버튼 하나', '<Button variant="primary">저장</Button> <Button variant="primary">삭제</Button>', '<Button variant="primary">저장</Button> <Button variant="ghost">삭제</Button>'],
]

export function HowPage() {
  return (
    <PageBody className="pb-24">
      <DocLayout toc={<TableOfContents items={TOC} />}>
        <DocHeader eyebrow="온보딩" title="동작 원리" summary="부품은 하나, 모습은 서비스마다, 구조는 화면마다 다릅니다. 그 사이를 규칙과 자동화가 이어 줍니다. 이 문서를 읽고 나면 '왜 색을 직접 못 쓰는지', '왜 버전이 하나인지', '화면을 만들 때 왜 원본부터 여는지'를 설명할 수 있어야 합니다." />
        <Prose>
          <section id="big">
            <h2>큰 그림</h2>
            <p>등장하는 것은 셋입니다. <strong>툴킷 저장소</strong>(부품·플러그인·예제가 한곳에, 버전 하나로), <strong>앱 저장소</strong>(당신이 만드는 것, 툴킷의 태그 하나를 가리킴), 그리고 <strong>Claude Code</strong>(플러그인을 통해 툴킷을 알고 앱을 대신 만듦).</p>
            <Figure caption="툴킷은 태그로 배포된다. 앱은 태그를 가리키고, 플러그인은 마켓플레이스에서 받는다. 사이트와 Storybook 은 사람이 보는 창이다.">
              <Stack
                layers={[
                  { title: '툴킷 저장소', items: ['packages/*', 'plugin/', 'examples/*', 'apps/site', 'apps/storybook'], note: 'main 에 합쳐지면 v태그', tone: 'accent' },
                  { title: '배포 통로', items: ['git 태그 github:…#v0.21.0&path:packages/ui', '플러그인 마켓플레이스', 'GitHub Pages'], note: '세 갈래로 나간다' },
                  { title: '앱 저장소', items: ['@se/tokens', '@se/ui', '@se/charts', '@se/eslint-plugin', 'se.identity.json'], note: '/se:upgrade 로 태그를 올린다' },
                  { title: 'Claude Code', items: ['se-ui 스킬', 'se-design 스킬', '/se:* 명령', '저장 훅(린트)'], note: '플러그인이 가르친다' },
                ]}
              />
            </Figure>
          </section>

          <section id="packages">
            <h2>패키지 계층</h2>
            <p>아래층이 위층을 모릅니다. 토큰은 UI를 모르고, UI는 앱을 모릅니다. 그래서 토큰 하나를 바꾸면 모든 앱이 따라오고, 앱은 UI 아래를 볼 일이 없습니다.</p>
            <Figure caption="화살표 방향으로만 의존한다. 린트 플러그인은 옆에서 전 층을 검사하고, Claude 플러그인은 같은 규칙으로 화면을 만든다.">
              <Stack
                layers={[
                  { title: '@se/tokens', items: ['색·간격·글꼴 토큰', 'identity.schema.json', 'seTokens() Vite 플러그인', 'virtual:se-theme.css'], note: '아이덴티티 → CSS 변수' },
                  { title: '@se/ui · charts · canvas', items: ['Button · DataTable · Dialog …', 'AppShell · ListDetail · Board · DocLayout · Chat …', '시그니처 5종', 'recharts · xyflow 래핑'], note: '토큰 변수만 읽는다' },
                  { title: '앱', items: ['src/pages', 'src/api', 'src/mocks', 'se.identity.json'], note: '컴포넌트만 조립한다', tone: 'accent' },
                ]}
              />
            </Figure>
            <Table>
              <TableHeader><TableRow><TableHead>패키지</TableHead><TableHead>역할</TableHead></TableRow></TableHeader>
              <TableBody>
                <TableRow><TableCell><code>@se/tokens</code></TableCell><TableCell>색·간격·글꼴 토큰, 아이덴티티 스키마와 검증, Vite 플러그인(<code>virtual:se-theme.css</code>)</TableCell></TableRow>
                <TableRow><TableCell><code>@se/ui</code></TableCell><TableCell>컴포넌트 · 화면 패턴(AppShell·ListDetail·Board·DocLayout·SplitPane·CalendarGrid·Chat 등) · 시그니처 5종</TableCell></TableRow>
                <TableRow><TableCell><code>@se/charts</code></TableCell><TableCell>recharts를 감싼 차트 — 토큰 색만 씁니다</TableCell></TableRow>
                <TableRow><TableCell><code>@se/canvas</code></TableCell><TableCell>xyflow를 감싼 캔버스 — 노드·선·DAG 자동 배치</TableCell></TableRow>
                <TableRow><TableCell><code>@se/eslint-plugin</code></TableCell><TableCell>규칙 5개. 앱의 린트와 플러그인 훅이 같은 규칙을 씁니다</TableCell></TableRow>
                <TableRow><TableCell><code>create-se-app</code> · <code>@se/codemods</code> · <code>@se/upgrade</code></TableCell><TableCell>새 앱 생성 · 기존 코드 자동 변환 · 버전 태그 갱신. <code>/se:new</code>·<code>/se:adopt</code>·<code>/se:upgrade</code>가 부릅니다</TableCell></TableRow>
                <TableRow><TableCell><code>plugin/</code></TableCell><TableCell>Claude Code 플러그인 — 스킬·명령·에이전트·훅. <code>references/</code> 문서는 코드에서 자동 생성되어 Storybook과 같은 원본입니다</TableCell></TableRow>
              </TableBody>
            </Table>
          </section>

          <section id="identity">
            <h2>아이덴티티가 모습을 정합니다</h2>
            <p>같은 컴포넌트로 만든 세 앱입니다. 코드는 같고 <code>se.identity.json</code> 한 장만 다릅니다.</p>
            <Figure caption="각 앱의 /__identity 화면(개발 전용). 색·마크·시그니처·말투가 한 장에 요약된다.">
              <Compare items={[{ src: idJm, label: 'Job Monitor', note: 'hue 195 · cool · status-strip · sidebar · compact · terse' }, { src: idDe, label: 'Dataset Explorer', note: 'hue 310 · warm · search-hero · sidebar · comfortable · friendly' }, { src: idRd, label: 'Release Desk', note: 'hue 235 · neutral · stage-rail · sidebar · compact · procedural' }]} />
            </Figure>
            <p>동작은 이렇습니다. JSON의 항목 8개를 Vite 플러그인이 CSS 변수(<code>--se-accent</code>, <code>--se-surface</code> …)로 풀어 <code>virtual:se-theme.css</code>로 내보내고, 컴포넌트는 그 변수를 가리키는 토큰 클래스(<code>bg-accent</code>, <code>text-ink</code> …)만 씁니다. 라이트·다크·밀도도 같은 변수를 바꾸는 것뿐입니다.</p>
            <Flow steps={[{ label: 'se.identity.json', note: '항목 8개' }, { label: 'seTokens()', note: 'Vite 플러그인 · 검증' }, { label: 'virtual:se-theme.css', note: 'CSS 변수' }, { label: '토큰 클래스', note: 'bg-accent · text-ink' }, { label: '컴포넌트', tone: 'accent' }]} />
            <Table>
              <TableHeader><TableRow><TableHead>항목</TableHead><TableHead>값</TableHead><TableHead>어디에 보이나</TableHead></TableRow></TableHeader>
              <TableBody>
                {SLOTS.map(([k, v, w]) => <TableRow key={k}><TableCell><code>{k}</code></TableCell><TableCell>{v}</TableCell><TableCell>{w}</TableCell></TableRow>)}
              </TableBody>
            </Table>
            <p>말투(<code>tone</code>)는 실제 문장을 바꿉니다. 같은 "빈 상태"가 세 앱에서 이렇게 다릅니다.</p>
            <Table>
              <TableHeader><TableRow><TableHead>tone</TableHead><TableHead>빈 상태</TableHead><TableHead>오류</TableHead></TableRow></TableHeader>
              <TableBody>
                <TableRow><TableCell><code>terse</code> (운영 도구)</TableCell><TableCell>등록된 노드가 없음</TableCell><TableCell>노드 목록을 가져올 수 없음</TableCell></TableRow>
                <TableRow><TableCell><code>friendly</code> (탐색 도구)</TableCell><TableCell>아직 태그가 없어요</TableCell><TableCell>태그를 불러오지 못했어요</TableCell></TableRow>
                <TableRow><TableCell><code>procedural</code> (승인·규정)</TableCell><TableCell>아직 끝난 릴리스가 없습니다</TableCell><TableCell>이력을 불러오지 못했습니다</TableCell></TableRow>
              </TableBody>
            </Table>
            <Callout tone="info" title="형제 규칙">
              같은 조직의 서비스들은 레지스트리(<code>identities/registry.json</code>)에 모입니다. 새 서비스는 색상(hue)이 다른 서비스와 30° 이상, 의미 색(성공·경고·오류)과 18° 이상 떨어져야 하고, 같은 시그니처를 피하며, 같은 쉘 배치는 두 서비스까지만 허용됩니다. <code>pnpm check-identity</code>와 <code>create-se-app</code>이 검사합니다. 그래서 "같은 팀이 만든 것 같은데 서로 다른 제품"으로 보입니다.
            </Callout>
          </section>

          <section id="archetype">
            <h2>골격이 구조를 정합니다</h2>
            <p>아이덴티티는 겉모습입니다. 색만 바꾸면 세 서비스가 "사이드바 · 제목 · 필터 · 표"로 똑같아집니다. 그래서 화면을 만들 때 가장 먼저 <strong>골격</strong>을 고릅니다 — 서비스 단위가 아니라 화면마다.</p>
            <Table>
              <TableHeader><TableRow><TableHead>골격</TableHead><TableHead>어떤 화면</TableHead><TableHead>원본</TableHead></TableRow></TableHeader>
              <TableBody>
                {ARCHETYPES.map((a) => <TableRow key={a.id}><TableCell><strong>{a.name}</strong> <span className="text-muted">{a.en}</span></TableCell><TableCell>{a.when}</TableCell><TableCell>{a.appName} <code>{a.path}</code></TableCell></TableRow>)}
              </TableBody>
            </Table>
            <p>골격마다 실제로 동작하는 원본 화면이 있고, 그 코드가 플러그인에 동봉됩니다. <code>/se:page</code>는 백지가 아니라 그 원본을 복사해 도메인에 맞게 바꿉니다. 원본의 구조(예: 목록이면 제목 → 시그니처 → 탭 → 필터 → 표 → 상세)는 유지하고 컬럼·필터·액션만 바뀝니다.</p>
            <p><Link to="/archetypes">골격 10가지를 원본 화면과 함께 보기 →</Link></p>
          </section>

          <section id="page">
            <h2>화면 하나가 만들어지는 길</h2>
            <p><code>/se:page</code>가 하는 일을 순서대로 펼치면 이렇습니다. 사람이 손으로 만들 때도 같은 순서입니다.</p>
            <Figure caption="플랜이 먼저, 코드는 나중. 플랜에서 답이 안 나오는 항목이 있으면 화면이 아직 정의되지 않은 것이다.">
              <Flow steps={[{ label: '디자인 플랜 10줄', note: '파일 상단 주석' }, { label: '골격 · 원본 열기' }, { label: '데이터 층', note: 'types · 훅 · 목' }, { label: '화면', note: '원본 복사 → 변형' }, { label: '등록', note: 'Route · 네비 · e2e' }, { label: 'lint · typecheck' }, { label: '스크린샷 · 자체 채점' }, { label: '리뷰', tone: 'accent' }]} />
            </Figure>
            <p>디자인 플랜은 이런 모양입니다. 예제 앱의 모든 화면 파일 맨 위에 실제로 있습니다.</p>
            <pre><code>{`/**
 * 노드 — 워커 노드의 상태·부하. 목록 골격(요약 타일 한 줄 + 표).
 *  골격       : 목록. 노드는 다섯에서 수십 대 — 표 한 장으로 다 보인다.
 *  목적       : "어느 노드가 힘든가, 거기 무슨 잡이 도는가"를 10초 안에.
 *  첫 시선    : 요약 타일의 저하/오프라인 수 → 표의 상태 배지와 CPU 막대.
 *  주 액션    : 없음(읽는 화면). 행 → 잡 목록(노드 필터).
 *  정보 계층  : 요약 타일 4 → 표(노드 · 상태 · CPU · MEM · 실행 중 · 하트비트).
 *  밀도       : compact. CPU·MEM 은 숫자 + 얇은 막대.
 *  액센트     : 없음 — 색은 임계를 넘을 때만.
 *  3상태      : 스켈레톤 / "등록된 노드가 없음" / 원인 + 다시 시도.
 *  톤         : terse.
 */`}</code></pre>
            <p>한 화면이 닿는 파일은 다섯입니다.</p>
            <Figure>
              <Tree nodes={[
                { name: 'src/pages/nodes/NodesPage.tsx', note: '화면 — 플랜 주석 + 원본 변형', mark: true },
                { name: 'src/api/types.ts', note: '타입 추가' },
                { name: 'src/api/jobs.ts', note: 'useNodes() 훅' },
                { name: 'src/mocks/handlers.ts', note: '/api/nodes 목 핸들러' },
                { name: 'src/app/App.tsx · Shell.tsx', note: '라우트 · 네비 · 검색 팔레트' },
                { name: 'e2e/screens.spec.ts', note: '스크린샷 목록에 추가' },
              ]} />
            </Figure>
          </section>

          <section id="data">
            <h2>데이터 층과 목</h2>
            <p>백엔드는 팀마다 다릅니다. 그래서 접점을 <code>src/api/</code> 한 곳으로 제한하고, 화면은 훅만 씁니다. 훅 안에서 응답을 화면이 기대하는 형태로 바꾸므로 컴포넌트에 백엔드 어휘(<code>data.results.map</code> 같은 것)가 새지 않습니다.</p>
            <Figure caption="VITE_API_BASE 가 있으면 실제 백엔드, 없으면 /api 를 MSW 목이 응답한다. 목은 실제 API 의 응답 형태를 그대로 따르는 '계약'이다.">
              <Flow steps={[{ label: '화면', note: 'useNodes()' }, { label: '훅', note: 'react-query · 어댑터' }, { label: 'client.ts', note: 'ApiError · 인증 헤더' }, { label: 'MSW 목 (개발)', note: '?__state= 지원' }, { label: '실제 백엔드 (VITE_API_BASE)', tone: 'accent' }]} />
            </Figure>
            <ul>
              <li>목록 응답은 <code>{'{ items, total, counts }'}</code> 형태를 유지합니다. 탭 숫자(<code>counts</code>)는 상태 필터를 뺀 기준으로 세어, 탭을 옮겨도 숫자가 흔들리지 않습니다.</li>
              <li>필터·페이지·정렬은 URL 파라미터 그대로입니다(<code>/jobs?state=failed&node=wk-03</code>). 링크로 공유되고 뒤로 가기가 됩니다.</li>
              <li>목 핸들러는 <code>?__state=empty|error|slow</code>를 받아 강제 상태를 냅니다. 리뷰와 시각 회귀가 이걸 씁니다.</li>
              <li>에러 메시지는 서버 것을 그대로(<code>ApiError.message</code>) — 오류 화면이 "원인"을 보여 줄 수 있어야 합니다.</li>
            </ul>
          </section>

          <section id="states">
            <h2>화면마다 세 가지 상태</h2>
            <p>원격 데이터를 보여 주는 화면은 로딩·빈·오류 상태를 반드시 갖습니다. 린트 규칙(<code>page-states</code>)이 표에서 강제하고, 시각 회귀 테스트가 세 화면을 모두 기준 스크린샷으로 남깁니다.</p>
            <Figure caption="Job Monitor 잡 목록. 같은 화면의 기본 · 빈 · 오류. 오류에는 원인과 '다시 시도'가 있다.">
              <Compare items={[{ src: jobs, label: '기본', note: '/jobs' }, { src: jobsEmpty, label: '빈 상태', note: '/jobs?__state=empty — 말투는 tone 을 따른다' }, { src: jobsError, label: '오류', note: '/jobs?__state=error — 서버 메시지 + 다시 시도' }]} />
            </Figure>
          </section>

          <section id="rules">
            <h2>규칙은 린트가 지킵니다</h2>
            <p>규칙은 문서가 아니라 ESLint 규칙으로 존재합니다. 앱의 <code>pnpm lint</code>, CI, 그리고 플러그인의 저장 훅이 같은 규칙을 실행하므로 Claude가 쓴 코드든 사람이 쓴 코드든 같은 기준을 통과해야 합니다. 규칙을 끄지 말고 코드를 고칩니다.</p>
            <Table>
              <TableHeader><TableRow><TableHead>규칙</TableHead><TableHead>뜻</TableHead><TableHead>막히는 코드</TableHead><TableHead>이렇게</TableHead></TableRow></TableHeader>
              <TableBody>
                {RULES.map(([k, what, bad, good]) => <TableRow key={k}><TableCell><code>{k}</code></TableCell><TableCell>{what}</TableCell><TableCell><code className="text-danger">{bad}</code></TableCell><TableCell><code className="text-success">{good}</code></TableCell></TableRow>)}
              </TableBody>
            </Table>
            <Callout tone="info" title="왜 색을 직접 못 쓰나">
              토큰 클래스는 CSS 변수를 가리키고, 변수는 아이덴티티와 테마(라이트·다크)가 정합니다. hex를 쓰는 순간 그 요소만 다크 모드와 형제 서비스의 색에서 떨어져 나옵니다. 하나가 빠지면 "같은 팀이 만든 것"이 깨집니다.
            </Callout>
          </section>

          <section id="release">
            <h2>릴리스와 업그레이드</h2>
            <p>패키지와 플러그인은 버전 하나를 공유합니다. 앱은 태그 하나를 가리키고 올릴 때도 한 번에 올립니다. 그래서 "UI는 새 버전인데 스킬은 옛 버전" 같은 어긋남이 생기지 않습니다.</p>
            <Figure caption="툴킷 쪽 PR 하나가 앱까지 닿는 길. 사람은 마지막 업그레이드 PR 만 본다.">
              <Flow steps={[{ label: 'PR + release:bump', note: 'CHANGELOG 세 항목' }, { label: 'CI', note: 'check · visual · react18' }, { label: 'merge → v태그' }, { label: '앱 저장소에 업그레이드 PR', note: 'upgrade-apps 워크플로' }, { label: '/se:upgrade', note: '전/후 화면 비교', tone: 'accent' }]} />
            </Figure>
            <p>CHANGELOG는 항목마다 세 칸입니다. 앱 담당자는 세 번째 칸만 읽어도 됩니다.</p>
            <pre><code>{`## 0.21.0 — 2026-09-21

**바뀐 것**        ← 툴킷에 무엇이 추가·수정됐나
**화면 변화**      ← 코드는 그대로인데 보이는 게 달라지는 것 (스크린샷 비교 대상)
**앱에서 할 일**   ← 앱 코드를 고쳐야 하는 것. "없음"이면 /se:upgrade 만`}</code></pre>
            <Table>
              <TableHeader><TableRow><TableHead>버전</TableHead><TableHead>뜻</TableHead></TableRow></TableHeader>
              <TableBody>
                <TableRow><TableCell>patch (0.21.0 → 0.21.1)</TableCell><TableCell>화면 변화 없음</TableCell></TableRow>
                <TableRow><TableCell>minor (0.21 → 0.22)</TableCell><TableCell>기능 추가 또는 화면 변화. 앱 코드 수정 불필요</TableCell></TableRow>
                <TableRow><TableCell>major (0.x → 1.0)</TableCell><TableCell>앱 코드를 고쳐야 함. 호환이 깨지는 변경은 한 minor 동안 이전 방식을 남기고 경고합니다</TableCell></TableRow>
              </TableBody>
            </Table>
            <p>CI가 지키는 것: 코드가 바뀌었는데 버전·CHANGELOG가 없으면 실패(<code>check:release</code>), 예제 앱 화면이 기준 스크린샷과 다르면 실패(<code>visual</code>), React 18로 강제 설치해도 빌드·테스트가 되는지(<code>react18</code>). 의도한 화면 변화면 <code>visual-baseline</code> 워크플로로 기준을 다시 찍습니다.</p>
          </section>

          <section id="repo">
            <h2>툴킷 저장소 지도</h2>
            <p>툴킷 자체를 고칠 때 어디를 보면 되는지.</p>
            <Figure>
              <Tree nodes={[
                { name: 'packages', children: [{ name: 'tokens', note: '토큰 · 아이덴티티 스키마 · Vite 플러그인' }, { name: 'ui', note: '컴포넌트 · 패턴 · 시그니처. src/index.ts 가 export 목록' }, { name: 'charts · canvas' }, { name: 'eslint-plugin', note: '규칙 5개 + 테스트' }, { name: 'create-se-app · codemods · upgrade', note: 'CLI 셋' }] },
                { name: 'plugin', children: [{ name: 'skills', note: 'se-ui · se-design · 명령 10개. references/ 는 pnpm gen:skill-docs 로 생성' }, { name: 'agents', note: 'se-design-critic · se-reviewer · se-migrator' }, { name: 'hooks', note: 'session-start.sh · lint-file.sh' }] },
                { name: 'examples', note: '예제 앱 넷 = 골격 원본. 시각 회귀 기준 스크린샷 포함', children: [{ name: 'reference-app', note: 'Job Monitor (5173)' }, { name: 'dataset-explorer', note: '(5174)' }, { name: 'release-desk', note: '(5175)' }, { name: 'se-home', note: '(5177)' }] },
                { name: 'templates/app-vite-react', note: 'create-se-app 이 복사하는 원본' },
                { name: 'apps', children: [{ name: 'site', note: '이 사이트 (5178)' }, { name: 'storybook', note: '(6006)' }] },
                { name: 'identities/registry.json', note: '형제 서비스 목록 — hue·시그니처·쉘' },
                { name: 'docs/DESIGN.md', note: '설계 문서 — 왜 이렇게 만들었나' },
                { name: 'CHANGELOG.md', note: '버전마다 세 칸' },
              ]} />
            </Figure>
            <pre><code>{`git clone https://github.com/bbora-min/se-web-toolkit && cd se-web-toolkit
./scripts/setup.sh --dev      # Node · pnpm · 설치 · 검사 · 플러그인 등록 · 예제 앱 실행
pnpm site                     # 이 사이트     pnpm storybook   # Storybook
pnpm release:bump 0.22.0      # 패키지·플러그인을 바꿨다면 버전을 올리고 CHANGELOG 세 칸을 채운다`}</code></pre>
          </section>

          <section id="glossary">
            <h2>용어</h2>
            <Table>
              <TableHeader><TableRow><TableHead>용어</TableHead><TableHead>뜻</TableHead></TableRow></TableHeader>
              <TableBody>
                <TableRow><TableCell>토큰</TableCell><TableCell>색·간격·글꼴의 이름(<code>bg-accent</code>, <code>text-muted</code>). 값은 아이덴티티와 테마가 정한다</TableCell></TableRow>
                <TableRow><TableCell>아이덴티티</TableCell><TableCell><code>se.identity.json</code>. 서비스의 모습을 정하는 항목 8개</TableCell></TableRow>
                <TableRow><TableCell>시그니처</TableCell><TableCell>첫 화면 상단의 "이 서비스다운" 조각 5종. 상태 띠·검색 히어로·단계 레일·타임라인 리본·지표 마퀴</TableCell></TableRow>
                <TableRow><TableCell>쉘</TableCell><TableCell><code>AppShell</code>. 네비·검색 팔레트·테마 토글이 있는 바깥 틀. 배치는 sidebar·topnav·panes</TableCell></TableRow>
                <TableRow><TableCell>골격</TableCell><TableCell>화면의 뼈대 10가지. 화면마다 고른다. 원본 화면이 있다</TableCell></TableRow>
                <TableRow><TableCell>패턴</TableCell><TableCell>골격을 코드로 만든 <code>@se/ui</code>의 조립품(ListDetail·Board·DocLayout …)</TableCell></TableRow>
                <TableRow><TableCell>3상태</TableCell><TableCell>로딩 · 빈 · 오류. 원격 데이터를 보여 주는 화면의 필수 조건</TableCell></TableRow>
                <TableRow><TableCell>목(MSW)</TableCell><TableCell>브라우저 안에서 <code>/api</code>를 대신 응답하는 가짜 백엔드. 실제 API의 응답 형태를 따른다</TableCell></TableRow>
                <TableRow><TableCell>강제 상태</TableCell><TableCell><code>?__state=empty|error|slow</code>. 목이 그 상태를 돌려준다</TableCell></TableRow>
                <TableRow><TableCell>시각 회귀</TableCell><TableCell>화면을 기준 스크린샷과 픽셀 비교하는 테스트. CI의 <code>visual</code></TableCell></TableRow>
                <TableRow><TableCell>레지스트리</TableCell><TableCell><code>identities/registry.json</code>. 형제 서비스 목록과 그들의 hue·시그니처·쉘</TableCell></TableRow>
              </TableBody>
            </Table>
          </section>
        </Prose>
      </DocLayout>
    </PageBody>
  )
}
