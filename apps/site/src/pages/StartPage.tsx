/**
 * 시작하기 — 신입 온보딩 문서. 이 페이지만 읽고 첫 앱과 첫 화면을 만들 수 있어야 한다.
 * 순서: 준비물 → 플러그인 → 첫 앱(실습) → 첫 화면(명세·구현·리뷰) → 백엔드 → 배포 → 계속 맞춰 가기 → 있는 앱 → 막힐 때 → 첫 주 체크리스트.
 * 명령과 파일명은 플러그인 스킬(plugin/skills/*)과 템플릿(templates/app-vite-react)에서 그대로 가져온다.
 */
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'
import { Button, Callout, DocHeader, DocLayout, PageBody, Prose, Table, TableBody, TableCell, TableHead, TableHeader, TableOfContents, TableRow, type TocItem } from '@se/ui'
import { PLUGIN_README, README } from '../lib/links'
import { Figure, Flow, Steps, Tree } from '../components/diagrams'

const TOC: TocItem[] = [
  { id: 'ready', label: '0. 준비물', level: 2 },
  { id: 'plugin', label: '1. 플러그인 설치', level: 2 },
  { id: 'new', label: '2. 첫 앱 만들기 (실습)', level: 2 },
  { id: 'files', label: '무엇이 생기나', level: 3 },
  { id: 'page', label: '3. 첫 화면 만들기', level: 2 },
  { id: 'spec', label: '/se:spec — 명세', level: 3 },
  { id: 'build', label: '/se:page — 구현', level: 3 },
  { id: 'review', label: '/se:review — 리뷰', level: 3 },
  { id: 'api', label: '4. 백엔드 연결', level: 2 },
  { id: 'deploy', label: '5. 배포', level: 2 },
  { id: 'keep', label: '6. 계속 맞춰 가기', level: 2 },
  { id: 'adopt', label: '7. 이미 있는 앱이라면', level: 2 },
  { id: 'stuck', label: '8. 막힐 때', level: 2 },
  { id: 'week', label: '첫 주 체크리스트', level: 2 },
]

const COMMANDS = [
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

export function StartPage() {
  return (
    <PageBody className="pb-24">
      <DocLayout toc={<TableOfContents items={TOC} />}>
        <DocHeader
          eyebrow="온보딩"
          title="시작하기"
          summary="처음 온 분을 위한 문서입니다. 위에서부터 따라 하면 오늘 안에 앱 하나와 화면 하나가 생깁니다. 중간에 나오는 명령은 전부 Claude Code 안에서 치는 것이고, 터미널로 하는 방법도 함께 적었습니다."
        />
        <Prose>
          <section id="ready">
            <h2>0. 준비물</h2>
            <p>네 가지가 있으면 됩니다. 하나라도 없으면 아래 표의 방법으로 먼저 준비하세요.</p>
            <Table>
              <TableHeader><TableRow><TableHead>준비물</TableHead><TableHead>확인</TableHead><TableHead>없으면</TableHead></TableRow></TableHeader>
              <TableBody>
                <TableRow><TableCell>Node 22</TableCell><TableCell><code>node -v</code> → v22.x</TableCell><TableCell><code>nvm install 22 && nvm use 22</code>. 20.19 미만이면 툴킷이 진행을 거부합니다</TableCell></TableRow>
                <TableRow><TableCell>pnpm 9</TableCell><TableCell><code>pnpm -v</code> → 9.x</TableCell><TableCell><code>corepack enable pnpm</code></TableCell></TableRow>
                <TableRow><TableCell>Claude Code</TableCell><TableCell><code>claude --version</code></TableCell><TableCell>사내 안내대로 설치. 없어도 2·3절은 터미널만으로 됩니다</TableCell></TableRow>
                <TableRow><TableCell>GitHub 접근</TableCell><TableCell><code>git ls-remote https://github.com/bbora-min/se-web-toolkit</code>가 태그를 보여 줌</TableCell><TableCell>저장소 권한 요청. 패키지는 npm이 아니라 이 저장소의 git 태그에서 설치됩니다</TableCell></TableRow>
              </TableBody>
            </Table>
          </section>

          <section id="plugin">
            <h2>1. 플러그인 설치</h2>
            <p>플러그인은 Claude에게 이 툴킷을 가르치는 묶음입니다. 설치하면 스킬 두 개(<code>se-ui</code>: 컴포넌트·패턴 지식, <code>se-design</code>: 디자인 규칙)가 자동으로 붙고, <code>/se:</code>로 시작하는 명령 열 개가 생깁니다.</p>
            <pre><code>{`/plugin marketplace add bbora-min/se-web-toolkit
/plugin install se@se-web-toolkit`}</code></pre>
            <p>터미널이라면 <code>claude plugin marketplace add bbora-min/se-web-toolkit && claude plugin install se@se-web-toolkit</code>.</p>
            <Callout tone="info" title="설치가 됐는지 확인하는 법">
              Claude Code에서 <code>/se:</code>까지 치면 명령 목록이 뜹니다. 앱 폴더에서 새 세션을 열면 첫 줄에 <code>[SE Web Toolkit] @se/ui v… · Node v…</code>와 아이덴티티 요약이 찍힙니다. 이 줄이 없으면 플러그인이 꺼져 있는 것입니다.
            </Callout>
            <p>플러그인이 하는 일 세 가지를 알아 두면 앞으로의 동작이 이해됩니다.</p>
            <ul>
              <li><strong>세션 시작 훅</strong> — Node 버전과 <code>@se/ui</code> 버전, 이 앱의 아이덴티티를 Claude에게 알려 줍니다.</li>
              <li><strong>저장 훅</strong> — Claude가 <code>.ts</code>·<code>.tsx</code> 파일을 저장할 때마다 린트를 돌려서, 규칙 위반이면 저장을 되돌리고 바로 고치게 합니다. "색을 hex로 썼다", "raw <code>&lt;button&gt;</code>을 썼다" 같은 것이 여기서 잡힙니다.</li>
              <li><strong>명령</strong> — 아래 표. 순서대로 쓰면 앱 하나가 완성됩니다.</li>
            </ul>
            <Table>
              <TableHeader><TableRow><TableHead>명령</TableHead><TableHead>언제</TableHead><TableHead>하는 일</TableHead></TableRow></TableHeader>
              <TableBody>
                {COMMANDS.map(([cmd, when, what]) => <TableRow key={cmd}><TableCell><code>{cmd}</code></TableCell><TableCell>{when}</TableCell><TableCell>{what}</TableCell></TableRow>)}
              </TableBody>
            </Table>
          </section>

          <section id="new">
            <h2>2. 첫 앱 만들기 (실습)</h2>
            <p>예로 "인시던트 데스크"를 만들어 봅니다. 빈 폴더에서 Claude Code를 열고 한 줄을 칩니다.</p>
            <pre><code>/se:new incident-desk</code></pre>
            <Steps
              items={[
                { title: '아이덴티티 인터뷰 (질문 5개)', body: <>Claude가 묻습니다: 서비스가 하는 일 · 주 사용자와 사용 순간 · 분위기 3단어 · 닮으면 안 되는 형제 서비스 · 가장 중요한 화면. 짧게 답하면 됩니다. 예: "온콜 엔지니어가 새벽에 알림 받고 열어 봄", "긴박·정확·조용". 답을 바탕으로 색상(hue)·시그니처·말투·밀도 후보 2–3가지를 한 줄씩 제안합니다. 하나 고르세요.</> },
                { title: '생성', body: <>Claude가 아래 한 줄을 실행합니다. 직접 쳐도 같습니다.<pre><code>{`pnpm dlx "github:bbora-min/se-web-toolkit#path:packages/create-se-app" incident-desk \\
  --name "Incident Desk" --hue 20 --signature status-strip --shell sidebar --tone terse --density compact`}</code></pre>hue가 다른 서비스와 30° 미만이거나 의미 색(성공·경고·오류)과 18° 미만이면 CLI가 거부합니다. 감으로 고르지 말고 CLI가 제안하는 값을 쓰세요.</> },
                { title: '설치와 첫 실행', body: <><code>cd incident-desk && pnpm install && pnpm dev</code>. 첫 설치는 1–2분 걸립니다(<code>@se/*</code>를 git 태그에서 받습니다). 브라우저에 <code>http://localhost:5170</code>이 뜨고, 사이드바·검색(⌘K)·테마 토글이 있는 앱 쉘과 첫 화면 <code>/items</code>가 보입니다.</> },
                { title: '아이덴티티 확인', body: <><code>http://localhost:5170/__identity</code>를 열면 이 앱의 색·마크·시그니처·말투가 한 장에 보입니다(개발 전용 화면). 마음에 안 들면 <code>/se:identity</code>로 다시 정합니다.</> },
              ]}
            />
            <Callout tone="warning" title="첫 화면 /items 는 출발점일 뿐입니다">
              템플릿의 <code>ItemsPage</code>는 "목록" 골격의 빈 껍데기입니다. 실제 도메인(인시던트·잡·데이터셋…)으로 바꾸는 것이 3절입니다. 지우지 말고 3절에서 대체하세요.
            </Callout>
            <h3 id="files">무엇이 생기나</h3>
            <p>생성된 폴더입니다. 앞으로 손대는 곳은 강조된 다섯 군데뿐입니다.</p>
            <Figure caption="src/pages 에 화면, src/api 에 데이터 훅, src/mocks 에 목 데이터, docs/spec.md 에 명세, se.identity.json 에 아이덴티티. 나머지는 템플릿이 관리합니다.">
              <Tree
                nodes={[
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
                  { name: 'Dockerfile · nginx.conf · .github/workflows/ci.yml', note: '배포·CI. 5절' },
                ]}
              />
            </Figure>
          </section>

          <section id="page">
            <h2>3. 첫 화면 만들기</h2>
            <p>화면 하나는 세 명령으로 만듭니다. 명세 → 구현 → 리뷰. 각각 무엇이 만들어지는지 알면 Claude의 결과를 검토할 수 있습니다.</p>
            <Flow steps={[{ label: '/se:spec', note: 'docs/spec.md' }, { label: '/se:page', note: 'src/pages/…' }, { label: '/se:review', note: 'docs/design-review.md' }, { label: 'PR', tone: 'accent' }]} />

            <h3 id="spec">/se:spec — 명세</h3>
            <p>요구사항을 한두 문장으로 줍니다. Figma가 없는 팀에서는 이 단계가 디자인입니다.</p>
            <pre><code>/se:spec 열린 인시던트를 심각도별로 보고, 하나를 골라 담당자를 지정하고 상태를 바꾼다</code></pre>
            <p>Claude는 문장에서 <strong>명사(데이터)</strong>와 <strong>동사(액션)</strong>를 뽑아 화면을 2–4개로 나누고, 화면마다 <code>docs/spec.md</code>에 아래 블록을 채웁니다. 확인을 요청하면 읽고 고칠 것을 말하세요. 특히 "주 액션은 하나"와 "3상태 문구"를 보세요.</p>
            <pre><code>{`## 화면: 인시던트 목록 — 목록(ListDetail)
- 라우트: /incidents
- 답하는 질문: 지금 열린 인시던트 중 내가 먼저 봐야 할 것은?
- 데이터: GET /api/incidents · id, title, severity(P1|P2|P3), status(open|ack|resolved), assignee, openedAt
- 1차 분류(탭) / 2차 필터: status / severity, 서비스
- 표 컬럼: 제목 · 심각도 · 상태 · 담당 · 열린 시각
- 주 액션 / 행 액션 / 위험 액션: 담당자 지정 / 상태 변경 / 종료
- 3상태 문구: 로딩 스켈레톤 · "열린 인시던트 없음" · "인시던트를 가져올 수 없음 — 다시 시도"
- 시그니처에 넣을 숫자: 열린 P1 수, 미배정 수`}</code></pre>

            <h3 id="build">/se:page — 구현</h3>
            <pre><code>/se:page 인시던트 목록</code></pre>
            <p>이 명령은 순서가 고정되어 있습니다. 결과를 볼 때 이 순서대로 확인하면 됩니다.</p>
            <Steps
              items={[
                { title: '디자인 플랜 10줄', body: <>화면 파일 맨 위 주석으로 남습니다 — 골격 · 목적 · 첫 시선 · 주 액션 · 정보 계층 · 밀도 · 액센트 · 3상태 · 말투. 플랜에서 답이 안 나오는 항목이 있으면 화면이 아직 정의되지 않은 것이라 코드로 넘어가지 않습니다.</> },
                { title: '골격 고르고 원본 열기', body: <>목록·보드·문서·처리함 등 <Link to="/archetypes">골격 10가지</Link> 중 하나를 고르고, 그 골격의 원본 화면(플러그인에 동봉된 예제 앱 코드)을 읽습니다. 백지에서 그리지 않습니다.</> },
                { title: '데이터 층', body: <><code>src/api/types.ts</code>에 타입, <code>src/api/incidents.ts</code>에 <code>useQuery</code> 훅, <code>src/mocks/handlers.ts</code>에 목 핸들러. 목은 <code>?__state=empty|error|slow</code>를 지원하고 목록은 <code>{'{ items, total, counts }'}</code> 형태입니다.</> },
                { title: '화면', body: <><code>src/pages/incidents/IncidentsPage.tsx</code>. 원본을 복사해 컬럼·필터·액션만 바꿉니다. 원본의 구조(제목 → 시그니처 → 탭 → 필터 → 표 → 상세)는 그대로 둡니다.</> },
                { title: '등록', body: <><code>App.tsx</code>의 Route, <code>Shell.tsx</code>의 네비와 검색 팔레트, <code>e2e/screens.spec.ts</code>의 화면 목록(기본·empty·error).</> },
                { title: '검사', body: <><code>pnpm typecheck && pnpm lint</code>가 통과할 때까지. 저장 훅이 이미 대부분 잡았을 것입니다.</> },
                { title: '스크린샷 1회', body: <>1440·1024 폭, 라이트·다크, 빈·오류 상태를 찍고 스스로 채점합니다. 7점 미만 항목은 고치고 다시 찍습니다.</> },
                { title: '보고', body: <>라우트, 스크린샷 경로, 3상태 확인 URL(<code>/incidents?__state=empty</code> 등), 남은 TODO. 이 URL들을 직접 열어 보는 것이 신입의 첫 리뷰입니다.</> },
              ]}
            />

            <h3 id="review">/se:review — 리뷰</h3>
            <pre><code>/se:review /incidents</code></pre>
            <p>"틀리지 않음"(린트)과 "잘 만듦"(디자인)은 다릅니다. 이 명령은 후자를 봅니다. 스크린샷을 찍어 디자인 비평 에이전트(80점 만점 루브릭)와 코드 리뷰 에이전트에 넘기고, 나온 목록을 심각도 순으로 보여 줍니다. <strong>결함</strong>은 바로 고치고, <strong>판단</strong>(취향이 갈리는 것)은 당신이 고릅니다. 고친 뒤 재채점해 <code>docs/design-review.md</code>에 점수를 남깁니다.</p>
            <Callout tone="info" title="점수 읽는 법">
              70/80 미만이면 "출시 가능"이라고 하지 않습니다. 같은 결함이 두 번 나오면 툴킷 쪽 규칙에 추가하자고 제안이 옵니다. 앱에서 못 고치는 결함(컴포넌트 한계)은 "툴킷에 제안할 것"으로 분리되니 툴킷 저장소에 이슈로 옮기면 됩니다.
            </Callout>
          </section>

          <section id="api">
            <h2>4. 백엔드 연결</h2>
            <p>지금까지는 목(MSW)이 <code>/api</code>를 응답했습니다. 실제 백엔드가 준비되면 연결합니다. 접점은 <code>src/api/</code> 한 곳뿐이고 화면은 훅만 쓰므로, 화면 코드는 바뀌지 않습니다.</p>
            <Figure caption="화면은 훅만 부른다. 훅은 client 를 부른다. client 는 VITE_API_BASE 가 있으면 실제 백엔드로, 없으면 /api(목)로 간다. 목은 없애지 않는다 — 백엔드가 죽어도 UI 개발이 계속되고 ?__state= 가 리뷰에 필요하다.">
              <Flow steps={[{ label: '화면', note: 'src/pages' }, { label: 'useQuery 훅', note: 'src/api/<domain>.ts' }, { label: 'client.ts', note: 'VITE_API_BASE?' }, { label: '실제 백엔드 · 또는 · MSW 목', note: 'src/mocks', tone: 'accent' }]} />
            </Figure>
            <pre><code>{`/se:api ./openapi.yaml        # 스펙이 있으면 — 타입 자동 생성
/se:api "GET /incidents 는 {items,total} 을 주고 …"   # 없으면 설명으로`}</code></pre>
            <p>Claude는 훅의 경로·파라미터·응답 타입을 실제 API에 맞추고, 목 데이터도 같은 형태로 고칩니다. 그다음 <code>.env</code>에 <code>VITE_API_BASE=https://…</code>를 넣고 <code>pnpm dev</code>로 목록·상세·액션을 한 번씩 확인합니다. 인증 헤더가 필요하면 <code>client.ts</code> 한 곳에만 넣습니다.</p>
          </section>

          <section id="deploy">
            <h2>5. 배포</h2>
            <pre><code>/se:deploy</code></pre>
            <p>템플릿에 <code>Dockerfile</code>·<code>nginx.conf</code>(SPA fallback + <code>/api</code> 프록시)·<code>.github/workflows/ci.yml</code>이 이미 있습니다. 이 명령은 <code>pnpm build</code>가 통과하는지, nginx의 프록시 대상이 실제 백엔드인지, 환경 변수가 빠지지 않았는지 점검하고 배포 명령을 알려 줍니다.</p>
            <ul>
              <li><code>VITE_API_BASE</code>는 <strong>빌드 시점</strong>에 박힙니다. 환경마다 다른 값이 필요하면 런타임 주입 방식을 제안받으세요.</li>
              <li>목(MSW)과 <code>/__identity</code>는 개발 전용입니다. 프로덕션 빌드에 들어가지 않는지 명령이 확인합니다.</li>
              <li>CI는 <code>.nvmrc</code>의 Node로 typecheck → lint → build를 돌립니다. 배포 잡은 팀 인프라(컨테이너 레지스트리 또는 정적 호스팅)에 맞춰 묻습니다.</li>
            </ul>
          </section>

          <section id="keep">
            <h2>6. 계속 맞춰 가기</h2>
            <p>툴킷이 새 버전을 내도 앱은 저절로 바뀌지 않습니다. 앱은 태그 하나(<code>github:…#v0.21.0&path:packages/ui</code>)에 고정되어 있고, 올리는 것은 명령 하나입니다.</p>
            <pre><code>{`claude plugin update se@se-web-toolkit   # 플러그인(규칙·스킬) 먼저
/se:upgrade                                # 앱의 @se/* 를 같은 버전으로`}</code></pre>
            <p><code>/se:upgrade</code>는 현재 태그와 목표 태그 사이의 CHANGELOG에서 <strong>"앱에서 할 일"</strong>만 뽑아 보여 주고, 갱신 전후 스크린샷을 픽셀 비교해 달라진 화면만 리뷰한 뒤 PR을 엽니다. 사람은 그 PR만 보면 됩니다. 툴킷 저장소가 앱 저장소를 알고 있으면(레지스트리의 <code>repo</code>) 태그가 찍힐 때 업그레이드 PR이 자동으로 열리기도 합니다.</p>
            <p>어디까지 따르고 있는지 숫자로 보려면 <code>/se:audit</code>. 규칙 위반 수·3상태 없는 화면·디자인 점수를 <code>docs/audit.md</code>에 남깁니다.</p>
          </section>

          <section id="adopt">
            <h2>7. 이미 있는 앱이라면</h2>
            <p>새로 만드는 대신 기존 React 앱에 붙일 수도 있습니다. 한 번에 바꾸지 않고 단계마다 PR 하나씩, 어디서 멈춰도 동작하도록 진행합니다.</p>
            <pre><code>/se:adopt        # 0단계(감사)부터. /se:adopt 3 처럼 단계를 지정할 수도</code></pre>
            <Table>
              <TableHeader><TableRow><TableHead>단계</TableHead><TableHead>하는 일</TableHead><TableHead>결과</TableHead></TableRow></TableHeader>
              <TableBody>
                <TableRow><TableCell>0 감사</TableCell><TableCell>스택·Node·패키지 매니저·Tailwind 버전·옛 UI 라이브러리 파악</TableCell><TableCell>리포트</TableCell></TableRow>
                <TableRow><TableCell>1 아이덴티티</TableCell><TableCell>현재 서비스의 색·말투를 보존하며 <code>se.identity.json</code> 작성</TableCell><TableCell>PR</TableCell></TableRow>
                <TableRow><TableCell>2 기반</TableCell><TableCell><code>@se/*</code> 설치, Vite 플러그인, CSS 네 줄, 루트 프로바이더. <strong>화면 변화 0</strong>을 픽셀 비교로 증명</TableCell><TableCell>PR</TableCell></TableRow>
                <TableRow><TableCell>3 쉘</TableCell><TableCell>기존 네비·헤더를 <code>AppShell</code>로</TableCell><TableCell>PR</TableCell></TableRow>
                <TableRow><TableCell>4 페이지</TableCell><TableCell>codemod로 80% 자동 변환 → 트래픽 많은 페이지부터 한 장씩</TableCell><TableCell>페이지별 PR</TableCell></TableRow>
                <TableRow><TableCell>5 강제</TableCell><TableCell>린트 규칙 켜기, CI에 lint 추가</TableCell><TableCell>PR</TableCell></TableRow>
              </TableBody>
            </Table>
            <p>직접 설치하려면:</p>
            <pre><code>{`T=$(git ls-remote --refs --tags --sort=-v:refname https://github.com/bbora-min/se-web-toolkit "v*" | head -1 | sed 's#.*/##')
pnpm add "github:bbora-min/se-web-toolkit#$T&path:packages/tokens" \\
         "github:bbora-min/se-web-toolkit#$T&path:packages/ui"
pnpm add -D "github:bbora-min/se-web-toolkit#$T&path:packages/eslint-plugin" tailwindcss @tailwindcss/vite`}</code></pre>
            <ol>
              <li>Vite 플러그인에 <code>seTokens()</code>·<code>tailwindcss()</code>, 진입점에 <code>import 'virtual:se-theme.css'</code></li>
              <li>앱 CSS를 네 줄로: <code>@import 'tailwindcss'</code> · <code>@import '@se/tokens/tailwind.css'</code> · <code>@import '@se/ui/styles.css'</code> · <code>@source '../node_modules/@se/ui/src'</code></li>
              <li>루트에 <code>ThemeProvider</code>·<code>TooltipProvider</code>·<code>Toaster</code></li>
              <li><code>se.identity.json</code>을 쓰고 레지스트리에 등록</li>
            </ol>
          </section>

          <section id="stuck">
            <h2>8. 막힐 때</h2>
            <Table>
              <TableHeader><TableRow><TableHead>증상</TableHead><TableHead>원인</TableHead><TableHead>해결</TableHead></TableRow></TableHeader>
              <TableBody>
                <TableRow><TableCell>Claude가 파일을 저장하자마자 <code>[se lint] 디자인 시스템 규칙 위반</code>이 뜬다</TableCell><TableCell>저장 훅이 린트 위반을 잡았다</TableCell><TableCell>정상 동작. 메시지의 규칙 이름(<code>no-raw-color</code> 등)대로 고치면 된다. 규칙을 끄지 않는다</TableCell></TableRow>
                <TableRow><TableCell><code>/se:new</code>가 hue를 거부한다</TableCell><TableCell>다른 서비스와 30° 미만, 또는 의미 색과 18° 미만</TableCell><TableCell>CLI가 제안하는 값을 쓴다. 형제 서비스 목록은 <code>identities/registry.json</code></TableCell></TableRow>
                <TableRow><TableCell>세션 첫 줄에 Node 경고가 뜬다</TableCell><TableCell>Node 20.19 미만</TableCell><TableCell><code>nvm use 22</code>. 툴킷 저장소라면 <code>./scripts/setup.sh --dev</code></TableCell></TableRow>
                <TableRow><TableCell>빈 화면·오류 화면을 보고 싶다</TableCell><TableCell>—</TableCell><TableCell>주소 뒤에 <code>?__state=empty</code> · <code>?__state=error</code> · <code>?__state=slow</code></TableCell></TableRow>
                <TableRow><TableCell>화면을 다시 찍어야 하는데 뭘 써야 할지 모르겠다</TableCell><TableCell>—</TableCell><TableCell><code>pnpm e2e</code>. <code>e2e/screens.spec.ts</code>의 목록을 1440·1024, 라이트·다크로 찍는다</TableCell></TableRow>
                <TableRow><TableCell>컴포넌트가 없어서 못 만들겠다</TableCell><TableCell>정말 없는지 먼저 확인</TableCell><TableCell>Storybook(상단 링크)에서 찾는다. 정말 없으면 페이지 안 로컬 컴포넌트로 두고 보고. 두 서비스에서 반복되면 툴킷으로 승격</TableCell></TableRow>
                <TableRow><TableCell>백엔드가 죽어서 화면을 못 본다</TableCell><TableCell>—</TableCell><TableCell><code>.env</code>의 <code>VITE_API_BASE</code>를 비우면 목으로 돌아간다</TableCell></TableRow>
              </TableBody>
            </Table>
          </section>

          <section id="week">
            <h2>첫 주 체크리스트</h2>
            <ul>
              <li>플러그인 설치, 새 세션 첫 줄에 <code>[SE Web Toolkit]</code> 확인</li>
              <li><code>/se:new</code>로 앱 하나. <code>/__identity</code>에서 아이덴티티 확인</li>
              <li><code>/se:spec</code> → <code>/se:page</code> → <code>/se:review</code>로 화면 하나. 3상태 URL 세 개를 직접 열어 봄</li>
              <li><Link to="/archetypes">골격 10가지</Link>를 훑고, 예제 앱 넷을 한 번씩 열어 봄 — 다음 화면을 만들 때 "이건 어느 골격이지"가 떠오르면 됩니다</li>
              <li><Link to="/how">동작 원리</Link>를 읽고 "왜 색을 직접 못 쓰는지", "왜 버전이 하나인지"를 설명할 수 있으면 온보딩 끝</li>
            </ul>
            <p>
              <Button variant="secondary" size="sm" asChild><a href={README} target="_blank" rel="noreferrer">저장소 README <ArrowUpRight /></a></Button>{' '}
              <Button variant="secondary" size="sm" asChild><a href={PLUGIN_README} target="_blank" rel="noreferrer">플러그인 README <ArrowUpRight /></a></Button>
            </p>
          </section>
        </Prose>
      </DocLayout>
    </PageBody>
  )
}
