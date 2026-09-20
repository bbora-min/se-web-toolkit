/**
 * 홈 — 툴킷이 무엇인지 한 문장, 세 역할, 예제 앱 넷, 최근 바뀐 것.
 * 골격: 랜딩(읽고 고르는 화면). 여백을 넓게, 첫 화면엔 문장 하나와 버튼 둘. 표는 없다.
 */
import { ArrowRight, ArrowUpRight, Blocks, Bot, Layers } from 'lucide-react'
import { Link } from 'react-router'
import { Button, Chip, PageBody, SectionHeader, ServiceMark } from '@se/ui'
import { APPS } from '../lib/apps'
import { ARCHETYPES } from '../lib/archetypes'
import { CHANGELOG, GITHUB, appUrl } from '../lib/links'
import { Shot } from '../components/Shot'

const ROLES = [
  { icon: <Blocks />, title: '짓는 재료', lead: '토큰과 컴포넌트', body: '색·간격·글꼴은 토큰으로만, 표·폼·다이얼로그·차트·캔버스는 @se/ui 컴포넌트로. 라이트·다크·밀도가 한 번에 따라온다.', items: ['@se/tokens', '@se/ui', '@se/charts', '@se/canvas'], mono: true },
  { icon: <Bot />, title: '규칙을 아는 조수', lead: 'Claude Code 플러그인', body: '스킬이 컴포넌트와 디자인 규칙을 알고, 명령이 화면을 원본에서 베껴 만들고, 훅이 저장할 때마다 린트로 막는다.', items: ['/se:new', '/se:page', '/se:review', '/se:upgrade'], mono: true },
  { icon: <Layers />, title: '베끼는 원본', lead: '예제 앱 넷 · 골격 열 개', body: '화면은 백지에서 시작하지 않는다. 원장·보드·문서·대화… 골격마다 실제로 돌아가는 원본 화면이 있고, 플러그인은 그걸 복사해 변형한다.', items: ARCHETYPES.map((a) => a.name), mono: false },
]

export function HomePage() {
  return (
    <PageBody className="gap-20 pb-24">
      <section className="flex flex-col items-start gap-6 pt-16">
        <Chip>
          v{__RELEASE__.version}
          {__RELEASE__.date ? <span className="text-muted"> · {__RELEASE__.date}</span> : null}
        </Chip>
        <h1 className="max-w-3xl break-keep font-display text-[2.75rem] font-semibold leading-[1.1] tracking-[-0.03em] text-ink">
          사내 엔지니어링 도구를 위한 디자인 시스템, <span className="text-accent-fg">그리고 그걸 아는 Claude.</span>
        </h1>
        <p className="max-w-2xl break-keep text-lg leading-relaxed text-muted">
          잡 모니터, 데이터 카탈로그, 배포 데스크 같은 내부 도구를 같은 재료로 짓되 서로 다른 얼굴로. 아이덴티티 한 장이 색과 톤을, 골격 하나가 화면의 구조를 정하고, Claude Code 플러그인이 그 규칙대로 대신 그린다.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" asChild><Link to="/start">시작하기 <ArrowRight /></Link></Button>
          <Button size="lg" variant="secondary" asChild><Link to="/archetypes">골격 열 개 보기</Link></Button>
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-3">
        {ROLES.map((r) => (
          <div key={r.title} className="flex flex-col gap-3">
            <span className="grid size-9 place-items-center rounded-md bg-accent-soft text-accent-fg [&_svg]:size-[18px]">{r.icon}</span>
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-lg font-semibold text-ink">{r.title}</h2>
              <p className="text-xs font-medium uppercase tracking-wider text-muted">{r.lead}</p>
            </div>
            <p className="break-keep text-sm leading-relaxed text-ink/80">{r.body}</p>
            <p className={r.mono ? 'font-mono text-[12px] leading-relaxed text-muted' : 'text-[13px] leading-relaxed text-muted'}>{r.items.join(' · ')}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink">예제 앱 넷</h2>
          <p className="text-md text-muted">같은 툴킷, 아이덴티티 한 장으로 다른 얼굴. 전부 브라우저 안의 목(MSW)으로 돌아가니 그냥 열어 보면 된다.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {APPS.map((a) => (
            <article key={a.id} className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-line-strong">
              <a href={appUrl(a.id)} target="_blank" rel="noreferrer" aria-label={`${a.name} 열기`}>
                <Shot src={a.shot} alt={`${a.name} 첫 화면`} />
              </a>
              <div className="flex items-start gap-3">
                <ServiceMark hue={a.hue} size="md">{a.monogram}</ServiceMark>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <h3 className="font-display text-md font-semibold text-ink">{a.name}</h3>
                  <p className="text-sm text-muted">{a.tagline}</p>
                  <p className="font-mono text-[11px] text-muted">{a.identity}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {a.archetypes.map((n) => <Chip key={n} asChild><Link to={`/archetypes#${ARCHETYPES.find((x) => x.name === n)?.id ?? ''}`}>{n}</Link></Chip>)}
              </div>
              <div className="flex items-center gap-1 border-t border-line pt-3">
                <Button size="sm" asChild><a href={appUrl(a.id)} target="_blank" rel="noreferrer">열기 <ArrowUpRight /></a></Button>
                <Button size="sm" variant="ghost" asChild><a href={`${GITHUB}/tree/main/${a.dir}`} target="_blank" rel="noreferrer">코드</a></Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {__RELEASE__.changed.length ? (
        <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface-2/60 p-6">
          <SectionHeader title={`최근 바뀐 것 — ${__RELEASE__.version}`} actions={<Button variant="link" size="sm" asChild><a href={CHANGELOG} target="_blank" rel="noreferrer">CHANGELOG <ArrowUpRight /></a></Button>} />
          <ul className="flex flex-col gap-2 text-sm leading-relaxed text-ink/85">
            {__RELEASE__.changed.map((c) => <li key={c} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />{c}</li>)}
          </ul>
        </section>
      ) : null}
    </PageBody>
  )
}
