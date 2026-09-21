/**
 * 소유자 — 누가 무엇을 맡고 있고, 맡은 것이 건강한가. 팀으로 묶은 카드 격자.
 *
 * 디자인 플랜
 *  골격       : 목록의 변형(카드 격자). 사람은 스무 명 남짓 — 표보다 카드가 읽기 좋고, 팀 헤더가 구조를 준다.
 *  목적       : "이 테이블 누구한테 물어보지" · "우리 팀이 맡은 것 중 지연된 게 있나".
 *  첫 시선    : 지연(stale) 숫자가 0이 아닌 카드.
 *  주 액션    : 카드 → 데이터셋 목록(소유자 필터).
 *  정보 계층  : 팀 헤더 → 카드(아바타 · 이름 · 숫자 4 · 30일 조회 스파크라인 · 도메인).
 *  밀도       : comfortable. 카드 3열.
 *  3상태      : 카드 스켈레톤 6 / "아직 소유자가 없어요" / 원인 + 다시 시도.
 *  톤         : friendly.
 */
import * as React from 'react'
import { Link } from 'react-router'
import { Avatar, Button, EmptyState, ErrorState, PageBody, PageHeader, SectionHeader, Skeleton, Sparkline, cn, formatCompact } from '@se/ui'
import { useOwners } from '../../api/datasets'
import type { OwnerSummary } from '../../api/types'

function Num({ label, value, tone }: { label: string; value: number; tone?: 'warning' | 'info' }) {
  return (
    <span className="flex flex-col">
      <span className={cn('tnum text-lg font-semibold leading-tight', tone === 'warning' && value > 0 ? 'text-warning' : tone === 'info' && value > 0 ? 'text-info' : 'text-ink')}>{value}</span>
      <span className="text-[11px] text-muted">{label}</span>
    </span>
  )
}

export function OwnersPage() {
  const owners = useOwners()
  const teams = React.useMemo(() => {
    const m = new Map<string, OwnerSummary[]>()
    for (const o of owners.data?.items ?? []) m.set(o.team, [...(m.get(o.team) ?? []), o])
    return [...m.entries()]
  }, [owners.data])

  return (
    <PageBody className="gap-8">
      <PageHeader title="소유자" description="누가 어떤 데이터셋을 맡고 있는지, 맡은 것이 제때 갱신되는지 봐요. 카드를 누르면 그 사람의 데이터셋만 보여요." />
      {owners.isPending ? (
        <div className="grid gap-3 md:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-36 rounded-lg" />)}</div>
      ) : owners.isError ? (
        <ErrorState title="소유자를 불러오지 못했어요" description={owners.error.message} action={<Button onClick={() => owners.refetch()}>다시 시도</Button>} />
      ) : teams.length === 0 ? (
        <EmptyState title="아직 소유자가 없어요" description="데이터셋에 owner 가 채워지면 여기에 모여요." />
      ) : (
        teams.map(([team, people]) => (
          <section key={team} className="flex flex-col gap-3">
            <SectionHeader title={team} note={`${people.length}명 · 데이터셋 ${people.reduce((a, p) => a + p.datasets, 0)}개`} />
            <div className="grid gap-3 md:grid-cols-3">
              {people.map((o) => (
                <Link key={o.name} to={`/datasets?owner=${encodeURIComponent(o.name)}`} className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-4 transition-colors hover:border-line-strong">
                  <span className="flex items-center gap-3">
                    <Avatar name={o.name} size="md" />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate font-medium text-ink">{o.name}</span>
                      <span className="truncate text-xs text-muted">{o.domains.join(' · ')}</span>
                    </span>
                  </span>
                  <span className="grid grid-cols-4 gap-2">
                    <Num label="데이터셋" value={o.datasets} />
                    <Num label="갱신 지연" value={o.stale} tone="warning" />
                    <Num label="PII" value={o.pii} tone="info" />
                    <Num label="인증됨" value={o.certified} />
                  </span>
                  <span className="flex items-center justify-between gap-2 text-[11px] text-muted">
                    <span>30일 조회 {formatCompact(o.queries30d.reduce((a, b) => a + b, 0))}</span>
                    <Sparkline data={o.queries30d} width={96} height={20} />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </PageBody>
  )
}
