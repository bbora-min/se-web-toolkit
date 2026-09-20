import type { AskMessage, AskThread, AskThreadSummary, Dataset } from '../api/types'

/**
 * 데이터 질의 어시스턴트 목 — 질문에서 데이터셋 이름·키워드를 찾아 사실(소유·신선도·컬럼)로 답을 만든다.
 * 실제 백엔드는 LLM + 카탈로그 검색이고 SSE 로 흘려 준다. 여기서는 형태만: 답 텍스트 + 출처 목록.
 */
const rel = (iso: string, now: number) => {
  const h = Math.round((now - Date.parse(iso)) / 3600_000)
  return h < 1 ? '1시간 안에' : h < 24 ? `${h}시간 전에` : `${Math.round(h / 24)}일 전에`
}
const cite = (d: Dataset) => ({ id: d.id, label: d.name, href: `/datasets/${d.id}` })

export function answer(text: string, datasets: Dataset[], now = Date.now()): { text: string; citations: AskMessage['citations'] } {
  const q = text.toLowerCase()
  const hits = datasets.filter((d) => q.includes(d.name.toLowerCase()) || q.includes(d.name.split('.')[1]!.toLowerCase()))
  if (hits.length) {
    const d = hits[0]!
    const pii = d.columns.filter((c) => c.pii).map((c) => c.name)
    // 출처 번호와 본문 [n] 이 같은 목록에서 나온다
    const related = datasets.filter((x) => d.related.includes(x.id)).slice(0, 2)
    const fresh = d.freshness === 'fresh' ? '최신이에요' : d.freshness === 'stale' ? 'SLA 를 넘겨 지연 중이에요' : '오류 상태예요'
    const body = [
      `${d.name} 은 ${d.team} 팀(${d.owner})이 소유하고, SLA 는 ${d.slaHours}시간이에요. 마지막 갱신은 ${rel(d.updatedAt, now)} 있었고 지금 ${fresh} [1].`,
      `행 ${d.rows.toLocaleString()}개, 컬럼 ${d.columns.length}개. ${pii.length ? `PII 컬럼(${pii.join(', ')})이 있어 외부 리포트엔 해시 값을 쓰세요.` : 'PII 컬럼은 없어요.'} ${d.description}`,
      q.includes('조인') || q.includes('join')
        ? `조인은 ${d.domain === 'dim' ? '유효 구간을 조건에 넣어야 해요 — id 로만 조인하면 이력 행이 곱해져요.' : '파티션 키 dt 를 먼저 좁히고 하세요.'}\n\n\`\`\`sql\nSELECT *\nFROM ${d.name} t\n${d.domain === 'dim' ? "WHERE t.valid_from <= '2026-09-01'\n  AND (t.valid_to IS NULL OR '2026-09-01' < t.valid_to)" : 'WHERE t.dt = CURRENT_DATE() - 1'}\nLIMIT 100\n\`\`\``
        : `바로 써 보려면:\n\n\`\`\`sql\n${d.sampleQuery}\n\`\`\``,
      related.length ? `함께 보는 테이블: ${related.map((x, i) => `${x.name} [${i + 2}]`).join(', ')}.` : '',
    ].filter(Boolean)
    return { text: body.join('\n\n'), citations: [cite(d), ...related.map(cite)] }
  }
  if (q.includes('pii') || q.includes('개인정보')) {
    const list = datasets.filter((d) => d.tags.includes('pii') || d.columns.some((c) => c.pii)).slice(0, 5)
    return {
      text: `PII 가 있는 데이터셋은 ${datasets.filter((d) => d.tags.includes('pii')).length}개예요. 자주 쓰는 것부터:\n\n${list.map((d, i) => `${i + 1}. ${d.name} — ${d.columns.filter((c) => c.pii).map((c) => c.name).join(', ') || 'pii 태그'} [${i + 1}]`).join('\n')}\n\n외부로 나가는 리포트엔 해시된 값을 쓰고, 조인 키로만 쓰세요. 규칙은 events·dim 도메인 가이드에 있어요.`,
      citations: list.map(cite),
    }
  }
  if (q.includes('조회') || q.includes('많이') || q.includes('인기')) {
    const top = [...datasets].sort((a, b) => b.queries30d.reduce((x, y) => x + y, 0) - a.queries30d.reduce((x, y) => x + y, 0)).slice(0, 5)
    return {
      text: `최근 30일 조회가 많은 데이터셋이에요.\n\n${top.map((d, i) => `${i + 1}. ${d.name} — ${d.queries30d.reduce((x, y) => x + y, 0).toLocaleString()}회, ${d.freshness === 'fresh' ? '최신' : '지연'} [${i + 1}]`).join('\n')}\n\n대시보드는 대부분 fct 를 봐요. 숫자가 다르면 fct.orders_daily 부터 확인하세요.`,
      citations: top.map(cite),
    }
  }
  const guide = datasets.find((d) => d.domain === 'fct')
  return {
    text: `질문을 데이터셋 이름이나 도메인으로 좁혀 주시면 사실(소유·SLA·컬럼)로 답할 수 있어요. 예: "fct.orders_daily 는 언제 갱신돼?", "events 에서 PII 컬럼은?".\n\n도메인별 규약은 도메인 가이드에 정리돼 있어요 [1].`,
    citations: guide ? [{ id: 'guide-fct', label: '도메인 가이드 · fct', href: '/domains/fct' }] : [],
  }
}

export function seedThreads(datasets: Dataset[], now = Date.now()): AskThread[] {
  const mk = (id: string, title: string, q: string, hoursAgo: number): AskThread => {
    const a = answer(q, datasets, now)
    const at = new Date(now - hoursAgo * 3600_000).toISOString()
    return { id, title, updatedAt: at, messages: [{ id: `${id}-u`, role: 'user', text: q, at }, { id: `${id}-a`, role: 'assistant', text: a.text, citations: a.citations, at: new Date(Date.parse(at) + 4000).toISOString() }] }
  }
  return [
    mk('t1', 'fct.orders_daily 갱신 시각', 'fct.orders_daily 는 언제 갱신돼? 조인은 어떻게 해?', 2),
    mk('t2', 'PII 컬럼 있는 테이블', 'PII 컬럼이 있는 events 테이블은?', 26),
    mk('t3', '조회 많은 데이터셋', '최근 30일 조회가 가장 많은 데이터셋은?', 70),
  ]
}

export const summary = (t: AskThread): AskThreadSummary => ({ id: t.id, title: t.title, updatedAt: t.updatedAt })
