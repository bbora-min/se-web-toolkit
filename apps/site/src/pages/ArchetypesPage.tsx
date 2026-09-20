/**
 * 골격 열 개 — 화면 단위의 첫 결정. 골격마다 원본 화면·재료·세상의 대표를 한 줄씩.
 * 문서처럼 세로로 읽는다. 줄마다 왼쪽 글, 오른쪽 원본 스크린샷. 원본 링크는 실제로 돌아가는 앱의 그 화면으로 간다.
 */
import { ArrowUpRight } from 'lucide-react'
import { Button, Chip, PageBody, PageHeader } from '@se/ui'
import { ARCHETYPES } from '../lib/archetypes'
import { DESIGN_DOC, appUrl } from '../lib/links'
import { Shot } from '../components/Shot'

export function ArchetypesPage() {
  return (
    <PageBody className="gap-12 pb-24">
      <PageHeader
        title="골격 열 개"
        description="골격은 서비스가 아니라 화면마다 고른다. 같은 서비스 안에 원장도, 문서도, 대화도 있다. 열 개 전부 실제로 돌아가는 원본 화면이 있고 /se:page 는 그걸 복사해 변형한다."
        actions={<Button variant="secondary" size="sm" asChild><a href={`${DESIGN_DOC}#6-골격`} target="_blank" rel="noreferrer">설계 문서 <ArrowUpRight /></a></Button>}
      />
      <nav aria-label="골격" className="flex flex-wrap gap-1.5">
        {ARCHETYPES.map((a) => <Chip key={a.id} asChild><a href={`#${a.id}`}>{a.name}</a></Chip>)}
      </nav>
      <ol className="flex flex-col gap-14">
        {ARCHETYPES.map((a, i) => (
          <li key={a.id} id={a.id} className="grid scroll-mt-20 gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-start">
            <div className="flex flex-col gap-4">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[12px] text-muted">{String(i + 1).padStart(2, '0')}</span>
                <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink">{a.name}</h2>
                <span className="text-sm text-muted">{a.en}</span>
              </div>
              <p className="break-keep text-md leading-relaxed text-ink">{a.when}</p>
              <dl className="grid grid-cols-[5rem_1fr] gap-x-3 gap-y-2 text-sm">
                <dt className="text-muted">생김새</dt><dd className="text-ink/85">{a.shape}</dd>
                <dt className="text-muted">재료</dt><dd className="font-mono text-[12px] leading-relaxed text-ink/85">{a.parts.join(' · ')}</dd>
                <dt className="text-muted">세상의 대표</dt><dd className="text-ink/85">{a.refs.join(' · ')}</dd>
                <dt className="text-muted">원본</dt>
                <dd className="flex flex-wrap items-center gap-2 text-ink/85">
                  {a.appName} <span className="font-mono text-[12px] text-muted">{a.path}</span>
                  <Button variant="link" size="sm" className="h-auto p-0" asChild><a href={appUrl(a.app, a.path)} target="_blank" rel="noreferrer">열기 <ArrowUpRight /></a></Button>
                </dd>
                <dt className="text-muted">부터</dt><dd className="font-mono text-[12px] text-muted">{a.since}</dd>
              </dl>
            </div>
            <a href={appUrl(a.app, a.path)} target="_blank" rel="noreferrer" aria-label={`${a.name} 원본 열기`}>
              <Shot src={a.shot} alt={`${a.appName} ${a.path}`} />
            </a>
          </li>
        ))}
      </ol>
    </PageBody>
  )
}
