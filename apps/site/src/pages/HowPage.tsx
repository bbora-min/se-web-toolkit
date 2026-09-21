/**
 * 동작 원리 — 한 버전으로 움직이는 패키지들, 아이덴티티 한 장이 얼굴을 정하는 법, 골격이 구조를 정하는 법, 린트가 규칙을 지키는 법, 릴리스와 업그레이드.
 * 그림은 div 로 그린 작은 도식. 문서 골격.
 */
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { Callout, DocHeader, DocLayout, PageBody, Prose, TableOfContents, type TocItem } from '@se/ui'

const TOC: TocItem[] = [
  { id: 'packages', label: '버전 하나로 움직입니다', level: 2 },
  { id: 'identity', label: '아이덴티티 설정이 모습을 정합니다', level: 2 },
  { id: 'archetype', label: '골격이 구조를 정합니다', level: 2 },
  { id: 'rules', label: '규칙은 린트가 지킵니다', level: 2 },
  { id: 'states', label: '화면마다 세 가지 상태', level: 2 },
  { id: 'release', label: '릴리스와 업그레이드', level: 2 },
]

const PACKAGES = [
  ['@se/tokens', '색·간격·글꼴 토큰, 아이덴티티 스키마, Vite 플러그인(virtual:se-theme.css)'],
  ['@se/ui', '컴포넌트 · 화면 패턴(AppShell·ListDetail·Board·DocLayout·Chat 등) · 시그니처 5종'],
  ['@se/charts', 'recharts를 감싼 차트 — 토큰 색만 씁니다'],
  ['@se/canvas', 'xyflow를 감싼 캔버스 — 노드·선·DAG 자동 배치'],
  ['@se/eslint-plugin', '규칙 5개. 앱의 린트와 플러그인 훅이 같은 규칙을 씁니다'],
  ['create-se-app · @se/codemods · @se/upgrade', '새 앱 생성 · 기존 코드 자동 변환 · 버전 태그 갱신'],
  ['plugin/', 'Claude Code 플러그인 — 스킬·명령·에이전트·훅. references/ 문서는 코드에서 자동 생성됩니다'],
]

const SLOTS = [
  ['mark', '모노그램 2–3글자'],
  ['accent.hue', '0–360. 다른 서비스와 30° 이상 차이'],
  ['neutralBias', 'cool · warm · neutral · accent'],
  ['signature', 'status-strip · search-hero · stage-rail · timeline-ribbon · metric-marquee'],
  ['shell', 'sidebar · topnav · panes — 같은 배치는 두 서비스까지'],
  ['density', 'compact · comfortable'],
  ['displayFont', 'pretendard · ibm-plex-sans · noto-sans-kr · ibm-plex-mono'],
  ['tone', 'terse · friendly · procedural — 빈 화면·오류·알림의 말투'],
]

const RULES = [
  ['no-raw-color', '색은 토큰 클래스(bg-canvas · text-ink · bg-accent 등)만 씁니다. hex·rgb·Tailwind 기본 팔레트는 금지'],
  ['no-raw-control', '<button> <input> <select> <table> 대신 @se/ui 컴포넌트를 씁니다'],
  ['import-from-ui', '@radix-ui · cmdk · sonner · recharts · @xyflow를 앱에서 직접 import하지 않습니다'],
  ['page-states', '원격 데이터를 보여 주는 표에는 loading · empty · error 상태가 있어야 합니다'],
  ['single-accent', '한 화면에 동시에 보이는 primary 버튼은 하나뿐입니다'],
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
        <DocHeader title="동작 원리" summary="부품은 하나, 모습은 서비스마다, 구조는 화면마다 다릅니다. 그 사이를 규칙과 자동화가 이어 줍니다." />
        <Prose>
          <section id="packages">
            <h2>버전 하나로 움직입니다</h2>
            <p>패키지와 플러그인은 버전 하나를 공유합니다. 앱은 태그 하나(<code>v{__RELEASE__.version}</code>)를 가리키고, 올릴 때도 한 번에 올립니다. 그래서 "UI는 새 버전인데 스킬은 옛 버전" 같은 어긋남이 생기지 않습니다.</p>
            <ul>
              {PACKAGES.map(([name, what]) => <li key={name}><code>{name}</code> — {what}</li>)}
            </ul>
            <Flow steps={['@se/tokens', '@se/ui · charts · canvas', '앱', 'eslint-plugin이 검사', 'plugin이 같은 규칙으로 화면을 만듦']} />
          </section>

          <section id="identity">
            <h2>아이덴티티 설정이 모습을 정합니다</h2>
            <p><code>se.identity.json</code>의 항목 8개가 서비스의 색·마크·시그니처·쉘 배치·밀도·글꼴·말투를 정합니다. Vite 플러그인이 이를 CSS 변수로 풀어 주고, 컴포넌트는 그 변수만 읽습니다. 그래서 같은 코드가 서비스마다 다른 모습이 됩니다.</p>
            <ul>
              {SLOTS.map(([k, v]) => <li key={k}><code>{k}</code> — {v}</li>)}
            </ul>
            <p>같은 조직의 서비스들은 레지스트리(<code>identities/registry.json</code>)에 모입니다. 새 서비스는 색상(hue)이 30° 이상 떨어져야 하고, 같은 시그니처를 피하며, 같은 쉘 배치는 두 서비스까지만 허용됩니다. <code>pnpm check-identity</code>가 검사합니다.</p>
          </section>

          <section id="archetype">
            <h2>골격이 구조를 정합니다</h2>
            <p>아이덴티티는 겉모습입니다. 색만 바꾸면 세 서비스가 "사이드바 · 제목 · 필터 · 표"로 똑같아집니다. 그래서 화면마다 골격을 먼저 고릅니다 — 목록·허브·대시보드·보드·문서·처리함·콘솔·일정·캔버스·대화. 골격마다 실제로 동작하는 원본 화면이 있고, <code>/se:page</code>는 백지가 아니라 그 원본을 복사해 새 화면으로 바꿔 씁니다.</p>
            <Flow steps={['골격 선택', '원본 복사', '도메인에 맞게 수정', '목 데이터 · 3가지 상태', '린트 · 스크린샷', '디자인 비평 · 코드 리뷰']} />
            <p><Link to="/archetypes">화면 골격 10가지 보기 →</Link></p>
          </section>

          <section id="rules">
            <h2>규칙은 린트가 지킵니다</h2>
            <p>규칙은 문서가 아니라 ESLint 규칙으로 존재합니다. 앱의 <code>pnpm lint</code>와 플러그인의 저장 훅이 같은 규칙을 실행하므로, Claude가 작성한 코드든 사람이 작성한 코드든 같은 기준을 통과해야 합니다.</p>
            <ul>
              {RULES.map(([k, v]) => <li key={k}><code>{k}</code> — {v}</li>)}
            </ul>
          </section>

          <section id="states">
            <h2>화면마다 세 가지 상태</h2>
            <p>원격 데이터를 보여 주는 화면은 loading · empty · error 상태를 반드시 갖습니다. 문구의 말투는 아이덴티티의 <code>tone</code>을 따릅니다. 예제 앱은 주소에 <code>?__state=empty</code> · <code>?__state=error</code> · <code>?__state=slow</code>를 붙여 각 상태를 강제로 볼 수 있고, 시각 회귀 테스트가 그 화면까지 기준 스크린샷으로 남깁니다.</p>
            <Callout tone="info" title="목 데이터가 곧 API 계약">
              예제 앱의 목 데이터(MSW)는 실제 API 응답 형태를 그대로 따릅니다. 백엔드를 연결할 때는 <code>VITE_API_BASE</code>만 지정하면 목이 꺼집니다. 이 사이트의 예제 앱은 <code>VITE_MOCK=true</code>로 빌드해 브라우저 안에서 목이 동작합니다.
            </Callout>
          </section>

          <section id="release">
            <h2>릴리스와 업그레이드</h2>
            <p>PR마다 버전을 올리고 CHANGELOG의 세 항목을 채웁니다 — 바뀐 것 / 화면 변화 / 앱에서 할 일. 앱 담당자는 세 번째 항목만 읽어도 됩니다. CI가 시각 회귀(예제 앱 화면을 기준 스크린샷과 비교)와 React 18 호환을 검사하고, main에 합쳐지면 태그가 자동으로 붙습니다.</p>
            <Flow steps={['PR + release:bump', 'check · visual · react18', 'merge → 버전 태그', '앱 저장소에 업그레이드 PR', '/se:upgrade가 전/후 화면 비교']} />
            <p>버전의 의미: patch = 화면 변화 없음 · minor = 기능 추가 또는 화면 변화, 코드 수정 불필요 · major = 앱 코드를 고쳐야 함. 호환이 깨지는 변경은 한 minor 버전 동안 이전 방식을 남기고 경고합니다.</p>
          </section>
        </Prose>
      </DocLayout>
    </PageBody>
  )
}
