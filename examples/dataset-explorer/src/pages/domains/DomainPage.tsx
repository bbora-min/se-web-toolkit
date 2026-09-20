/**
 * 도메인 가이드 — 문서(document) 골격의 원본. 좌측 트리(도메인 → 데이터셋) · 중앙 본문 · 우측 목차.
 *
 * 디자인 플랜
 *  골격       : 문서. 같은 앱의 데이터셋 목록(원장)·상세(DetailPage)와 달리 "읽는 화면"이다 — 타이포와 여백이 전부. 크롬(제목 바·필터·표)은 없다.
 *  목적       : 이 도메인의 테이블을 쓰기 전에 알아야 할 것(적재 규약 · 사용 규칙 · 데이터 사전 · 자주 쓰는 쿼리)을 한 문서로.
 *  첫 시선    : 제목 → 요약 문장 → 주의 상자(있으면). 그다음 데이터 사전 표.
 *  주 액션    : 없음(읽는 화면). "편집 제안"은 ghost. 사전의 데이터셋 이름이 상세로 가는 링크.
 *  정보 계층  : 트리(어디에 있나) → 머리(무엇인가) → 절(개요 → 규칙 → 사전 → 쿼리 → 문의) → 목차(어디쯤인가).
 *  밀도       : 본문 65자, 행간 1.7, 절 간격 40. 콘텐츠 폭 1120 그대로(220 + 본문 + 200).
 *  액센트     : 트리의 활성 항목, 목차의 현재 절, 본문 링크. 본문 안의 색은 그것뿐.
 *  3상태      : 머리·본문 스켈레톤 / "아직 작성된 가이드가 없어요" + 첫 절 쓰기 / 원인 + 다시 시도.
 *  톤         : friendly.
 */
import { Pencil } from 'lucide-react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router'
import { Badge, Button, Callout, DocHeader, DocLayout, EmptyState, ErrorState, Prose, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableOfContents, TableRow, TreeNav, formatAbsolute, formatCompact, formatRelative, toast, type TreeItem } from '@se/ui'
import { useDomain, useDomains } from '../../api/domains'
import type { DocBlock, DomainDoc } from '../../api/types'
import { FreshnessBadge } from '../datasets/freshness'

export function DomainPage() {
  const { domain } = useParams()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const domains = useDomains()
  const doc = useDomain(domain)

  // /domains 로 오면 첫 도메인으로
  if (!domain) {
    const first = domains.data?.items[0]?.id
    return first ? <Navigate to={`/domains/${first}${params.size ? `?${params}` : ''}`} replace /> : <div className="pt-6"><Skeleton className="h-8 w-64" /></div>
  }

  const tree: TreeItem[] = (domains.data?.items ?? []).map((d) => ({
    id: d.id,
    label: <span className="font-mono">{d.name}</span>,
    hint: d.count,
    href: `/domains/${d.id}`,
    children: (d.id === domain ? doc.data?.datasets ?? [] : []).map((ds) => ({ id: `ds:${ds.id}`, label: <span className="font-mono text-xs">{ds.name.split('.')[1]}</span>, href: `/datasets/${ds.id}` })),
  }))
  const d = doc.data
  const toc = d?.sections.map((s) => ({ id: s.id, label: s.title }))

  return (
    <DocLayout
      aside={
        domains.isPending ? (
          <div className="flex flex-col gap-2 pt-1">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-6" />)}</div>
        ) : (
          <TreeNav aria-label="도메인" items={tree} activeId={domain} onSelect={(it) => navigate(it.href ?? '/domains')} />
        )
      }
      toc={toc?.length ? <TableOfContents items={toc} /> : null}
    >
      {doc.isError ? (
        <ErrorState title="가이드를 불러오지 못했어요" description={doc.error.message} action={<Button onClick={() => doc.refetch()}>다시 시도</Button>} />
      ) : !d ? (
        <div className="flex flex-col gap-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          <DocHeader
            eyebrow={<span>도메인 가이드 · <span className="font-mono">{d.name}</span></span>}
            title={d.title}
            summary={d.summary}
            meta={
              <>
                <span>소유 <span className="text-ink">{d.ownerTeam}</span> · {d.owner}</span>
                <span title={formatAbsolute(d.updatedAt)}>{formatRelative(d.updatedAt)} 갱신</span>
                <span>감시 {d.watchers}명</span>
                <span>데이터셋 {d.datasets.length}개</span>
              </>
            }
            actions={<Button variant="ghost" size="sm" onClick={() => toast('편집 제안은 곧 열려요', { description: '지금은 데이터 플랫폼 채널로 알려 주세요' })}><Pencil /> 편집 제안</Button>}
          />
          {d.sections.length === 0 ? (
            <EmptyState title="아직 작성된 가이드가 없어요" description="이 도메인의 적재 규약과 사용 규칙을 첫 절로 적으면 여기에 나타나요." action={<Button asChild><Link to="/datasets">데이터셋 보기</Link></Button>} />
          ) : (
            <Prose>
              {d.sections.map((s) => (
                <section key={s.id} id={s.id}>
                  <h2>{s.title}</h2>
                  {s.blocks.map((b, i) => <Block key={i} block={b} doc={d} />)}
                </section>
              ))}
            </Prose>
          )}
        </>
      )}
    </DocLayout>
  )
}

/** 본문 블록 — 구조화된 문서(백엔드가 준다)를 Prose 요소로. 데이터 사전 표는 데이터셋·컬럼 정보에서 그린다 */
function Block({ block: b, doc }: { block: DocBlock; doc: DomainDoc }) {
  switch (b.type) {
    case 'p':
      return <p>{b.text}</p>
    case 'ul':
      return <ul>{b.items.map((t, i) => <li key={i}>{t}</li>)}</ul>
    case 'code':
      return <pre><code>{b.code}</code></pre>
    case 'callout':
      return <Callout tone={b.tone} title={b.title}>{b.text}</Callout>
    case 'datasets': {
      const rows = doc.datasets.filter((ds) => b.ids.includes(ds.id))
      return (
        <div className="se-prose-table">
          <Table>
            <TableHeader><TableRow><TableHead>데이터셋</TableHead><TableHead>신선도</TableHead><TableHead className="text-right">행</TableHead><TableHead>소유자</TableHead><TableHead className="text-right">SLA</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.map((ds) => (
                <TableRow key={ds.id}>
                  <TableCell><Link to={`/datasets/${ds.id}`} className="font-mono">{ds.name}</Link>{ds.tags.includes('pii') ? <Badge tone="warning" className="ml-2">pii</Badge> : null}</TableCell>
                  <TableCell><FreshnessBadge value={ds.freshness} /></TableCell>
                  <TableCell className="text-right tnum">{formatCompact(ds.rows)}</TableCell>
                  <TableCell>{ds.owner}</TableCell>
                  <TableCell className="text-right tnum">{ds.slaHours}시간</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )
    }
    case 'columns': {
      const ds = doc.datasets.find((x) => x.id === b.dataset)
      if (!ds) return null
      return (
        <div className="se-prose-table">
          <p className="!mb-2 text-xs text-muted"><Link to={`/datasets/${ds.id}`} className="font-mono">{ds.name}</Link> 의 컬럼 {ds.columns.length}개</p>
          <Table>
            <TableHeader><TableRow><TableHead>컬럼</TableHead><TableHead>타입</TableHead><TableHead>NULL</TableHead><TableHead>설명</TableHead></TableRow></TableHeader>
            <TableBody>
              {ds.columns.map((c) => (
                <TableRow key={c.name}>
                  <TableCell><span className="font-mono">{c.name}</span>{c.pii ? <Badge tone="warning" className="ml-2">pii</Badge> : null}</TableCell>
                  <TableCell className="font-mono text-xs text-muted">{c.type}</TableCell>
                  <TableCell className="text-muted">{c.nullable ? `허용 · ${Math.round(c.nullRate * 100)}%` : '불가'}</TableCell>
                  <TableCell>{c.description ?? <span className="text-muted">—</span>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )
    }
  }
}
