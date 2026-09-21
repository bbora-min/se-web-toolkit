/**
 * 시작하기 — 두 가지 방법(Claude Code로 · 직접). 문서 골격: Prose 본문 + 오른쪽 목차.
 * 명령은 손으로 적되 저장소 README·플러그인 README와 같은 문장이어야 한다.
 */
import { ArrowUpRight } from 'lucide-react'
import { Button, Callout, DocHeader, DocLayout, PageBody, Prose, TableOfContents, type TocItem } from '@se/ui'
import { PLUGIN_README, README } from '../lib/links'

const TOC: TocItem[] = [
  { id: 'claude', label: 'Claude Code로 시작하기 (권장)', level: 2 },
  { id: 'commands', label: '명령 한눈에', level: 3 },
  { id: 'new', label: '새 앱을 직접 만들기', level: 2 },
  { id: 'adopt', label: '기존 앱에 도입하기', level: 2 },
  { id: 'repo', label: '툴킷 저장소 개발하기', level: 2 },
]

const COMMANDS = [
  ['/se:new <id>', '어느 폴더에서든 템플릿 생성 → 아이덴티티 인터뷰 → 설치 → 첫 실행까지 진행합니다'],
  ['/se:identity', '아이덴티티 항목 8개를 2–3가지 안으로 제시해 정하고, 검증 후 레지스트리에 등록합니다'],
  ['/se:spec <요구사항>', '요구사항 문장을 화면 명세(docs/spec.md)로 바꿉니다'],
  ['/se:page <화면>', '골격 선택 → 원본 화면 복사·수정 → 목 데이터 → 3가지 상태 → 린트 → 스크린샷'],
  ['/se:api <spec>', 'OpenAPI 명세나 설명으로 타입 클라이언트·훅을 만들고, 목 데이터를 실제 응답 형태에 맞춥니다'],
  ['/se:review', '스크린샷을 찍어 디자인 비평·코드 리뷰 에이전트에 보내고, 수정 후 다시 촬영합니다'],
  ['/se:audit', '디자인 시스템 준수율 리포트 — 환경·규칙·화면·디자인 점수'],
  ['/se:adopt [0-5]', '기존 프로젝트에 단계적으로 도입합니다. 단계마다 PR 하나'],
  ['/se:deploy', 'Dockerfile·nginx·CI를 점검하고 빌드합니다'],
  ['/se:upgrade', '@se/* 패키지를 새 태그로 올립니다 — CHANGELOG의 "앱에서 할 일" 반영 → 검사 → 전/후 스크린샷 비교'],
]

export function StartPage() {
  return (
    <PageBody className="pb-24">
      <DocLayout toc={<TableOfContents items={TOC} />}>
        <DocHeader title="시작하기" summary="툴킷은 npm에 올리기 전까지 git 태그로 설치합니다. 저장소를 클론할 필요는 없습니다. Claude Code를 쓴다면 첫 번째 방법을, 아니라면 두 번째 방법을 따르세요." />
        <Prose>
          <section id="claude">
            <h2>Claude Code로 시작하기 (권장)</h2>
            <p>플러그인을 설치하면 스킬 두 개(<code>se-ui</code>·<code>se-design</code>)가 컴포넌트와 디자인 규칙을 알게 되고, 명령이 원본 화면을 바탕으로 새 화면을 만듭니다. 파일을 저장할 때마다 훅이 린트로 규칙 위반을 막습니다.</p>
            <pre><code>{`/plugin marketplace add bbora-min/se-web-toolkit
/plugin install se@se-web-toolkit

/se:new incident-desk     # 새 앱: 템플릿 → 아이덴티티 인터뷰 → 설치 → 실행
/se:page 인시던트 목록      # 화면 하나: 골격 선택 → 원본 복사 → 목 데이터 → 3가지 상태`}</code></pre>
            <Callout tone="info" title="터미널에서도 설치할 수 있습니다">
              <code>claude plugin marketplace add bbora-min/se-web-toolkit && claude plugin install se@se-web-toolkit</code>. 새 버전이 나오면 <code>claude plugin update se@se-web-toolkit</code> 후 <code>/se:upgrade</code>를 실행하세요.
            </Callout>
            <h3 id="commands">명령 한눈에 보기</h3>
            <ul>
              {COMMANDS.map(([cmd, what]) => <li key={cmd}><code>{cmd}</code> — {what}</li>)}
            </ul>
          </section>

          <section id="new">
            <h2>새 앱을 직접 만들기</h2>
            <p>플러그인 없이도 같은 템플릿을 쓸 수 있습니다. Node 22와 pnpm 9만 있으면 어느 폴더에서든 됩니다.</p>
            <pre><code>{`pnpm dlx "github:bbora-min/se-web-toolkit#path:packages/create-se-app" incident-desk \\
  --name "Incident Desk" --hue 20 --signature status-strip --shell sidebar --tone terse
cd incident-desk && pnpm install && pnpm dev`}</code></pre>
            <p>만들어지는 것: Vite + React 앱, <code>se.identity.json</code> 한 장, 앱 쉘과 첫 화면(목록), 목 데이터(MSW), 시각 회귀 테스트, 린트 설정. <code>@se/*</code> 패키지는 최신 태그에 고정됩니다.</p>
          </section>

          <section id="adopt">
            <h2>기존 앱에 도입하기</h2>
            <p>화면이 전혀 바뀌지 않는 기반 PR 하나로 시작합니다. 그다음 트래픽이 많은 페이지부터 한 장씩 옮깁니다(<code>/se:adopt</code>가 이 순서대로 진행합니다).</p>
            <pre><code>{`T=$(git ls-remote --refs --tags --sort=-v:refname https://github.com/bbora-min/se-web-toolkit "v*" | head -1 | sed 's#.*/##')
pnpm add "github:bbora-min/se-web-toolkit#$T&path:packages/tokens" \\
         "github:bbora-min/se-web-toolkit#$T&path:packages/ui"
pnpm add -D "github:bbora-min/se-web-toolkit#$T&path:packages/eslint-plugin" tailwindcss @tailwindcss/vite`}</code></pre>
            <ol>
              <li>Vite 플러그인에 <code>seTokens()</code>·<code>tailwindcss()</code>를 추가하고, 진입점에 <code>import 'virtual:se-theme.css'</code>를 넣습니다</li>
              <li>앱 CSS를 네 줄로 정리합니다: <code>@import 'tailwindcss'</code> · <code>@import '@se/tokens/tailwind.css'</code> · <code>@import '@se/ui/styles.css'</code> · <code>@source '../node_modules/@se/ui/src'</code></li>
              <li>루트 컴포넌트에 <code>ThemeProvider</code>·<code>TooltipProvider</code>·<code>Toaster</code>를 둡니다</li>
              <li><code>se.identity.json</code>을 작성하고 레지스트리에 등록합니다 — 다른 서비스와 색상(hue)이 30° 이상 떨어져야 하고, 같은 쉘 배치는 두 서비스까지만</li>
            </ol>
            <Callout tone="warning" title="기존 CSS와 함께 쓰는 동안">
              기존 CSS나 Tailwind 3과 겹치는 기간의 진행 순서(기본 팔레트 복원 → v3 값 명시 → 레거시 CSS를 utilities 레이어로)는 플러그인의 <code>adopt/references/coexist.md</code>에 정리되어 있습니다.
            </Callout>
          </section>

          <section id="repo">
            <h2>툴킷 저장소 개발하기</h2>
            <p>컴포넌트를 고치거나 골격을 추가하려면 저장소를 받습니다. 스크립트 하나가 Node · pnpm 설치, 의존성 설치, 검사, 플러그인 등록, 예제 앱 실행까지 처리합니다(sudo 불필요).</p>
            <pre><code>{`git clone https://github.com/bbora-min/se-web-toolkit && cd se-web-toolkit
./scripts/setup.sh --dev     # Job Monitor 5173 · Dataset Explorer 5174 · Release Desk 5175
pnpm storybook               # 6006
pnpm --filter se-home dev    # 5177 · 이 사이트는 pnpm site (5178)`}</code></pre>
            <p>규칙: 패키지나 플러그인을 바꾸면 <code>pnpm release:bump x.y.z</code>로 버전을 한 번에 올리고 CHANGELOG의 세 항목(바뀐 것 / 화면 변화 / 앱에서 할 일)을 채웁니다. CI가 시각 회귀와 React 18 호환을 검사하고, main에 합쳐지면 태그가 자동으로 붙습니다.</p>
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
