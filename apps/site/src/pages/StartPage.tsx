/**
 * 시작하기 — 두 갈래(Claude Code 로 · 직접). 문서 골격: Prose 본문 + 오른쪽 목차.
 * 명령은 손으로 적되 저장소 README·플러그인 README 와 같은 문장이어야 한다.
 */
import { ArrowUpRight } from 'lucide-react'
import { Button, Callout, DocHeader, DocLayout, PageBody, Prose, TableOfContents, type TocItem } from '@se/ui'
import { PLUGIN_README, README } from '../lib/links'

const TOC: TocItem[] = [
  { id: 'claude', label: 'Claude Code로 (권장)', level: 2 },
  { id: 'commands', label: '명령 한눈에', level: 3 },
  { id: 'new', label: '새 앱을 직접', level: 2 },
  { id: 'adopt', label: '있는 앱에 붙이기', level: 2 },
  { id: 'repo', label: '툴킷 저장소 자체를', level: 2 },
]

const COMMANDS = [
  ['/se:new <id>', '어느 폴더에서든 템플릿 생성 → 아이덴티티 인터뷰 → 설치 → 첫 실행'],
  ['/se:identity', '아이덴티티 슬롯 8개를 2–3안으로 정하고 검증·레지스트리 등록'],
  ['/se:spec <요구사항>', '요구사항 → 화면 명세(docs/spec.md)'],
  ['/se:page <화면>', '골격 고르기 → 원본 복사·변형 → 목 → 3상태 → lint → 스크린샷'],
  ['/se:api <spec>', 'OpenAPI·설명 → 타입 클라이언트·훅, 목을 실제 형태로'],
  ['/se:review', '스크린샷 → 디자인 비평·코드 리뷰 에이전트 → 수정 → 재촬영'],
  ['/se:audit', '준수율 리포트 — 환경·규칙·화면·디자인 점수'],
  ['/se:adopt [0-5]', '기존 프로젝트에 점진 도입. 단계마다 PR 하나'],
  ['/se:deploy', 'Dockerfile·nginx·CI 점검, 빌드'],
  ['/se:upgrade', '@se/* 를 새 태그로 — CHANGELOG "앱에서 할 일" 반영 → 검사 → 전/후 스크린샷'],
]

export function StartPage() {
  return (
    <PageBody className="pb-24">
      <DocLayout toc={<TableOfContents items={TOC} />}>
        <DocHeader title="시작하기" summary="툴킷은 npm 에 올리기 전까지 git 태그로 설치된다. 저장소를 클론할 필요는 없다. Claude Code 가 있으면 첫 번째 갈래, 없으면 두 번째." />
        <Prose>
          <section id="claude">
            <h2>Claude Code로 (권장)</h2>
            <p>플러그인을 설치하면 스킬 둘(<code>se-ui</code>·<code>se-design</code>)이 컴포넌트와 디자인 규칙을 알고, 명령이 화면을 원본에서 베껴 만든다. 저장할 때마다 훅이 린트로 규칙 위반을 막는다.</p>
            <pre><code>{`/plugin marketplace add bbora-min/se-web-toolkit
/plugin install se@se-web-toolkit

/se:new incident-desk     # 새 앱: 템플릿 → 아이덴티티 인터뷰 → 설치 → 실행
/se:page 인시던트 목록      # 화면 하나: 골격 고르기 → 원본 복사 → 목 → 3상태`}</code></pre>
            <Callout tone="info" title="터미널에서도 된다">
              <code>claude plugin marketplace add bbora-min/se-web-toolkit && claude plugin install se@se-web-toolkit</code>. 새 버전은 <code>claude plugin update se@se-web-toolkit</code> 뒤 <code>/se:upgrade</code>.
            </Callout>
            <h3 id="commands">명령 한눈에</h3>
            <ul>
              {COMMANDS.map(([cmd, what]) => <li key={cmd}><code>{cmd}</code> — {what}</li>)}
            </ul>
          </section>

          <section id="new">
            <h2>새 앱을 직접</h2>
            <p>플러그인 없이도 같은 템플릿을 쓸 수 있다. Node 22 와 pnpm 9 가 있으면 어느 폴더에서든.</p>
            <pre><code>{`pnpm dlx "github:bbora-min/se-web-toolkit#path:packages/create-se-app" incident-desk \\
  --name "Incident Desk" --hue 20 --signature status-strip --shell sidebar --tone terse
cd incident-desk && pnpm install && pnpm dev`}</code></pre>
            <p>생긴 것: Vite + React 앱, <code>se.identity.json</code> 한 장, 쉘과 첫 화면(원장), 목(MSW), 시각 회귀 e2e, 린트 설정. <code>@se/*</code> 는 최신 태그에 고정된다.</p>
          </section>

          <section id="adopt">
            <h2>있는 앱에 붙이기</h2>
            <p>시각 변화 0 인 기반 PR 하나로 시작한다. 그 뒤 트래픽 많은 페이지부터 한 장씩 옮긴다(<code>/se:adopt</code> 가 이 순서를 그대로 진행한다).</p>
            <pre><code>{`T=$(git ls-remote --refs --tags --sort=-v:refname https://github.com/bbora-min/se-web-toolkit "v*" | head -1 | sed 's#.*/##')
pnpm add "github:bbora-min/se-web-toolkit#$T&path:packages/tokens" \\
         "github:bbora-min/se-web-toolkit#$T&path:packages/ui"
pnpm add -D "github:bbora-min/se-web-toolkit#$T&path:packages/eslint-plugin" tailwindcss @tailwindcss/vite`}</code></pre>
            <ol>
              <li>Vite 플러그인에 <code>seTokens()</code>·<code>tailwindcss()</code>, 진입점에 <code>import 'virtual:se-theme.css'</code></li>
              <li>앱 CSS 를 다섯 줄로: <code>@import 'tailwindcss'</code> · <code>@import '@se/tokens/tailwind.css'</code> · <code>@import '@se/ui/styles.css'</code> · <code>@source '../node_modules/@se/ui/src'</code></li>
              <li>루트에 <code>ThemeProvider</code>·<code>TooltipProvider</code>·<code>Toaster</code></li>
              <li><code>se.identity.json</code> 을 쓰고 레지스트리에 등록 — 형제와 hue 30° 이상, 같은 쉘 배치는 둘까지</li>
            </ol>
            <Callout tone="warning" title="공존">
              기존 CSS·Tailwind 3 와 겹치는 동안의 순서(기본 팔레트 복원 → v3 값 명시 → 레거시를 utilities 레이어로)는 플러그인의 <code>adopt/references/coexist.md</code> 에 있다.
            </Callout>
          </section>

          <section id="repo">
            <h2>툴킷 저장소 자체를</h2>
            <p>컴포넌트를 고치거나 골격을 더하려면 저장소를 받는다. 스크립트 하나가 Node · pnpm · 설치 · 검사 · 플러그인 등록 · 예제 앱 실행까지 한다(sudo 없음).</p>
            <pre><code>{`git clone https://github.com/bbora-min/se-web-toolkit && cd se-web-toolkit
./scripts/setup.sh --dev     # Job Monitor 5173 · Dataset Explorer 5174 · Release Desk 5175
pnpm storybook               # 6006
pnpm --filter se-home dev    # 5177 · 이 사이트는 pnpm --filter se-site dev (5178)`}</code></pre>
            <p>규칙: 패키지나 플러그인을 바꾸면 <code>pnpm release:bump x.y.z</code> 로 버전을 한 번에 올리고 CHANGELOG 세 칸(바뀐 것 / 화면 변화 / 앱에서 할 일)을 채운다. CI 가 시각 회귀와 React 18 호환을 검사하고, main 에 합쳐지면 태그가 찍힌다.</p>
            <p>
              <Button variant="secondary" size="sm" asChild><a href={README} target="_blank" rel="noreferrer">README <ArrowUpRight /></a></Button>{' '}
              <Button variant="secondary" size="sm" asChild><a href={PLUGIN_README} target="_blank" rel="noreferrer">플러그인 README <ArrowUpRight /></a></Button>
            </p>
          </section>
        </Prose>
      </DocLayout>
    </PageBody>
  )
}
