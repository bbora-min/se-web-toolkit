/**
 * 동작 원리 — 한 버전으로 움직이는 패키지들, 아이덴티티 한 장이 얼굴을 정하는 법, 골격이 구조를 정하는 법, 린트가 규칙을 지키는 법, 릴리스와 업그레이드.
 * 그림은 div 로 그린 작은 도식. 문서 골격.
 */
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { Callout, DocHeader, DocLayout, PageBody, Prose, TableOfContents, type TocItem } from '@se/ui'

const TOC: TocItem[] = [
  { id: 'packages', label: '한 버전으로 움직인다', level: 2 },
  { id: 'identity', label: '아이덴티티 한 장이 얼굴을', level: 2 },
  { id: 'archetype', label: '골격이 구조를', level: 2 },
  { id: 'rules', label: '규칙은 린트가', level: 2 },
  { id: 'states', label: '화면마다 3상태', level: 2 },
  { id: 'release', label: '릴리스와 업그레이드', level: 2 },
]

const PACKAGES = [
  ['@se/tokens', '색·간격·글꼴 토큰, 아이덴티티 스키마, Vite 플러그인(virtual:se-theme.css)'],
  ['@se/ui', '컴포넌트 · 패턴(AppShell·ListDetail·Board·DocLayout·Chat…) · 시그니처 5종'],
  ['@se/charts', 'recharts 래핑 — 토큰 색만 쓰는 차트'],
  ['@se/canvas', 'xyflow 래핑 — 노드·선·DAG 배치'],
  ['@se/eslint-plugin', '규칙 5개. 앱의 lint 와 플러그인 훅이 같은 규칙'],
  ['create-se-app · @se/codemods · @se/upgrade', '새 앱 생성 · 기존 코드 자동 치환 · 태그 갱신'],
  ['plugin/', 'Claude Code 플러그인 — 스킬·명령·에이전트·훅. references/ 는 코드에서 자동 생성'],
]

const SLOTS = [
  ['mark', '모노그램 2–3자'],
  ['accent.hue', '0–360. 형제와 30° 이상'],
  ['neutralBias', 'cool · warm · neutral · accent'],
  ['signature', 'status-strip · search-hero · stage-rail · timeline-ribbon · metric-marquee'],
  ['shell', 'sidebar · topnav · panes — 같은 배치는 둘까지'],
  ['density', 'compact · comfortable'],
  ['displayFont', 'pretendard · ibm-plex-sans · noto-sans-kr · ibm-plex-mono'],
  ['tone', 'terse · friendly · procedural — 빈 화면·오류·토스트의 말투'],
]

const RULES = [
  ['no-raw-color', '색은 토큰 클래스(bg-canvas · text-ink · bg-accent …)만. hex·rgb·Tailwind 기본 팔레트 금지'],
  ['no-raw-control', '<button> <input> <select> <table> 대신 @se/ui 컴포넌트'],
  ['import-from-ui', '@radix-ui · cmdk · sonner · recharts · @xyflow 를 앱에서 직접 import 하지 않는다'],
  ['page-states', '원격 데이터를 그리는 표에는 loading · empty · error 가 있어야 한다'],
  ['single-accent', '한 화면에 동시에 보이는 primary 버튼은 하나'],
]

function Flow({ steps }: { steps: string[] }) {
  return (
    <div className="not-prose my-4 flex flex-wrap items-center gap-2 text-sm">
      {steps.map((s, i) => (
        <span key={s} className="flex items-center gap-2">
          <span className="rounded-md border border-line bg-surface px-2.5 py-1.5 text-[12px] font-medium text-ink">{s}</span>
          {i < steps.length - 1 ? <ArrowRight className="size-3.5 text-muted" aria-hidden /> : null}
        </span>
      ))}
    </div>
  )
}

export function HowPage() {
  return (
    <PageBody className="pb-24">
      <DocLayout toc={<TableOfContents items={TOC} />}>
        <DocHeader title="동작 원리" summary="재료는 하나, 얼굴은 서비스마다, 구조는 화면마다. 그 사이를 규칙과 자동화가 잇는다." />
        <Prose>
          <section id="packages">
            <h2>한 버전으로 움직인다</h2>
            <p>패키지와 플러그인은 버전 하나를 공유한다. 앱은 태그 하나(<code>v{__RELEASE__.version}</code>)를 가리키고, 올릴 때도 한 번에 올린다. 그래서 "UI 는 새 건데 스킬은 옛것" 같은 어긋남이 없다.</p>
            <ul>
              {PACKAGES.map(([name, what]) => <li key={name}><code>{name}</code> — {what}</li>)}
            </ul>
            <Flow steps={['@se/tokens', '@se/ui · charts · canvas', '앱', 'eslint-plugin 이 검사', 'plugin 이 같은 규칙으로 그린다']} />
          </section>

          <section id="identity">
            <h2>아이덴티티 한 장이 얼굴을</h2>
            <p><code>se.identity.json</code> 의 슬롯 8개가 서비스의 색·마크·시그니처·쉘 배치·밀도·글꼴·말투를 정한다. Vite 플러그인이 이걸 CSS 변수로 풀고, 컴포넌트는 그 변수만 읽는다. 그래서 같은 코드가 서비스마다 다른 얼굴이 된다.</p>
            <ul>
              {SLOTS.map(([k, v]) => <li key={k}><code>{k}</code> — {v}</li>)}
            </ul>
            <p>형제 서비스는 레지스트리(<code>identities/registry.json</code>)에 모인다. 새 서비스는 hue 가 30° 이상 떨어져야 하고, 같은 시그니처를 피하고, 같은 쉘 배치는 둘까지. <code>pnpm check-identity</code> 가 검사한다.</p>
          </section>

          <section id="archetype">
            <h2>골격이 구조를</h2>
            <p>아이덴티티는 표면이다. 색만 바꾸면 세 서비스가 "사이드바 · 제목 · 필터 · 표"로 똑같아진다. 그래서 화면마다 골격을 먼저 고른다 — 원장·허브·관측 벽·보드·문서·트리아지·콘솔·일정·캔버스·대화. 골격마다 실제로 돌아가는 원본 화면이 있고, <code>/se:page</code> 는 백지가 아니라 그 원본을 복사해 변형한다.</p>
            <Flow steps={['골격 고르기', '원본 복사', '도메인으로 변형', '목 · 3상태', 'lint · 스크린샷', '비평 · 리뷰']} />
            <p><Link to="/archetypes">골격 열 개 →</Link></p>
          </section>

          <section id="rules">
            <h2>규칙은 린트가</h2>
            <p>규칙은 문서가 아니라 ESLint 규칙이다. 앱의 <code>pnpm lint</code> 와 플러그인의 저장 훅이 같은 규칙을 돌리므로 Claude 가 짠 코드도 사람이 짠 코드도 같은 문턱을 넘는다.</p>
            <ul>
              {RULES.map(([k, v]) => <li key={k}><code>{k}</code> — {v}</li>)}
            </ul>
          </section>

          <section id="states">
            <h2>화면마다 3상태</h2>
            <p>원격 데이터를 그리는 화면은 loading · empty · error 를 반드시 가진다. 말투는 아이덴티티의 <code>tone</code> 을 따른다. 예제 앱은 <code>?__state=empty</code> · <code>?__state=error</code> · <code>?__state=slow</code> 로 각 상태를 강제할 수 있고, 시각 회귀가 그 화면까지 기준으로 찍는다.</p>
            <Callout tone="info" title="목이 곧 계약">
              예제 앱의 목(MSW)은 실제 API 의 형태를 그대로 따른다. 백엔드를 붙일 때는 <code>VITE_API_BASE</code> 만 주면 목이 꺼진다. 이 사이트의 예제 앱들은 <code>VITE_MOCK=true</code> 로 빌드해 브라우저 안에서 목이 돌아간다.
            </Callout>
          </section>

          <section id="release">
            <h2>릴리스와 업그레이드</h2>
            <p>PR 마다 버전을 올리고 CHANGELOG 세 칸을 채운다 — 바뀐 것 / 화면 변화 / 앱에서 할 일. 앱 담당자는 세 번째 칸만 읽어도 된다. CI 가 시각 회귀(예제 앱 화면을 기준 스크린샷과 비교)와 React 18 호환을 검사하고, main 에 합쳐지면 태그가 찍힌다.</p>
            <Flow steps={['PR + release:bump', 'check · visual · react18', 'merge → v태그', '앱 리포에 업그레이드 PR', '/se:upgrade 가 전/후 diff']} />
            <p>버전 의미: patch = 화면 변화 없음 · minor = 추가 또는 화면 변화, 코드 수정 불필요 · major = 앱 코드를 고쳐야 함. 깨지는 변경은 한 minor 동안 옛 방식을 남기고 경고한다.</p>
          </section>
        </Prose>
      </DocLayout>
    </PageBody>
  )
}
