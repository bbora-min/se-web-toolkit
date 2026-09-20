// 원본: examples/dataset-explorer/src/mocks/domains.ts (자동 복사 — 수정하지 말 것, pnpm gen:skill-docs)
import type { Dataset, DocSection, DomainDoc, DomainSummary } from '../api/types'

/** 도메인별 문서 — 실제 앱에선 위키·마크다운 저장소가 준다. 구조화된 블록으로 두면 화면이 타이포만 책임진다 */
const TITLE: Record<string, string> = {
  events: '이벤트 스트림 — 앱·웹 행동 로그',
  dim: '차원 테이블 — 사용자·상품·매장의 이력',
  fct: '팩트 테이블 — 리포트의 기준 소스',
  raw: '원본 적재 — 손대기 전의 데이터',
  ml: 'ML 피처 — 학습·추론용 테이블',
  finance: '정산·회계 원장',
}
const SUMMARY: Record<string, string> = {
  events: '클라이언트 SDK 가 보낸 이벤트를 dt 파티션으로 일별 적재해요. 세션·사용자 단위 분석의 출발점이고, 집계는 fct 로 가요.',
  dim: 'SCD Type 2 로 이력을 관리해요. 현재 레코드는 valid_to 가 NULL 인 행이에요.',
  fct: '대시보드·주간 리포트가 이 테이블을 봐요. 숫자가 다르면 여기서부터 확인해요.',
  raw: '외부 시스템에서 그대로 받은 데이터예요. 스키마가 자주 바뀌니 직접 쿼리보다 fct·dim 을 권해요.',
  ml: '피처 스토어에서 내려온 학습 세트와 임베딩이에요. 학습 시점의 스냅샷이라 최신 값이 아닐 수 있어요.',
  finance: '정산·회계 원장이에요. 접근 권한이 필요하고, 숫자를 바꾸는 쿼리는 감사 대상이에요.',
}
const OWNER_TEAM: Record<string, [string, string]> = {
  events: ['data-platform', 'bora'], dim: ['data-platform', 'jihoon'], fct: ['analytics', 'minseo'], raw: ['data-platform', 'bora'], ml: ['ml-infra', 'seoyeon'], finance: ['finance-eng', 'taeho'],
}

function sections(domain: string, ds: Dataset[]): DocSection[] {
  const first = ds[0]
  const dsIds = ds.map((d) => d.id)
  const [team] = OWNER_TEAM[domain] ?? ['data-platform']
  const convention: Record<string, string[]> = {
    events: ['파티션은 `dt`(이벤트 발생일, KST). 적재는 매시 정각 + 20분에 직전 시간 분량이 들어와요.', '`properties` 는 이벤트별 자유 속성(JSON). 자주 쓰는 키는 컬럼으로 승격돼요 — 승격 요청은 데이터 플랫폼 채널로.', '`user_id` 는 PII 예요. 외부로 나가는 리포트엔 해시된 값을 쓰세요.'],
    dim: ['현재 값은 `valid_to IS NULL`. 특정 시점의 값은 `valid_from <= t AND (valid_to IS NULL OR t < valid_to)`.', '키가 바뀌지 않는 속성(id·created_at)은 첫 행에서, 바뀌는 속성은 유효 구간의 행에서 읽어요.', '`email` 은 PII 예요. 조인 키로만 쓰고 SELECT 하지 마세요.'],
    fct: ['매일 06:00 KST 에 전날 분이 확정돼요. 그 전엔 부분 집계라 숫자가 움직여요.', '통화는 전부 KRW 정수. 환율 변환은 `finance.settlements` 기준.', '재적재(backfill)는 파티션 단위로만. 이력은 데이터셋 상세의 "최근 변경"에 남아요.'],
    raw: ['스키마 보증이 없어요. 컬럼이 늘거나 타입이 바뀔 수 있어요 — 대시보드가 raw 를 직접 보면 깨져요.', '보존 기간은 90일. 그 뒤엔 fct·dim 에 남은 것만 있어요.'],
    ml: ['학습 세트는 `snapshot_dt` 로 버전이 갈려요. 같은 실험은 같은 snapshot 을 쓰세요.', '임베딩 차원은 모델마다 달라요(`dim` 컬럼). 서로 다른 모델의 벡터를 섞어 쓰지 마세요.'],
    finance: ['접근은 `finance-reader` 권한이 필요해요. 신청은 보안팀.', '원장은 append-only. 정정은 반대 분개로 들어가요 — 행을 UPDATE 하지 않아요.'],
  }
  const caution: Record<string, { tone: 'info' | 'warning'; title: string; text: string }> = {
    events: { tone: 'info', title: '집계는 fct 에서', text: '세션·전환율 같은 집계는 fct.funnel_daily 가 이미 갖고 있어요. 이벤트를 직접 집계하면 정의가 갈려요.' },
    dim: { tone: 'warning', title: '조인은 유효 구간으로', text: '`dim.users` 를 id 로만 조인하면 이력 행이 곱해져요. 반드시 valid_from/valid_to 조건을 넣으세요.' },
    fct: { tone: 'info', title: '확정 전 숫자', text: '오늘 06:00 이전에 어제 숫자를 보면 부분 집계예요. 리포트는 확정 후에.' },
    raw: { tone: 'warning', title: '직접 쿼리를 권하지 않아요', text: '스키마가 예고 없이 바뀌어요. 필요한 값이 fct·dim 에 없으면 데이터 플랫폼에 요청하세요.' },
    ml: { tone: 'info', title: '스냅샷이에요', text: '피처 값은 학습 시점의 것이에요. 서비스의 최신 값은 온라인 피처 스토어에서.' },
    finance: { tone: 'warning', title: '감사 대상', text: '이 도메인의 쿼리는 전부 감사 로그에 남아요. 개인 분석용 복사본을 만들지 마세요.' },
  }
  const query: Record<string, string> = {
    events: `-- 어제 하루, 이벤트별 사용자 수\nSELECT event_name, COUNT(DISTINCT user_id) AS users\nFROM events.clicks_v3\nWHERE dt = CURRENT_DATE() - 1\nGROUP BY 1\nORDER BY 2 DESC`,
    dim: `-- 특정 시점의 사용자 속성\nSELECT id, name, country\nFROM dim.users\nWHERE valid_from <= '2026-09-01'\n  AND (valid_to IS NULL OR '2026-09-01' < valid_to)`,
    fct: `-- 최근 7일 매장별 매출\nSELECT dt, store_id, SUM(revenue_krw) AS revenue\nFROM fct.orders_daily\nWHERE dt >= CURRENT_DATE() - 7\nGROUP BY 1, 2`,
    raw: `-- 스키마 확인부터\nSELECT column_name, data_type\nFROM raw.INFORMATION_SCHEMA.COLUMNS\nWHERE table_name = 'payment_webhooks'`,
    ml: `-- 같은 스냅샷의 학습 세트\nSELECT *\nFROM ml.ranking_train_set\nWHERE snapshot_dt = '2026-09-14'`,
    finance: `-- 월별 정산 합계 (권한 필요)\nSELECT DATE_TRUNC(settled_at, MONTH) AS month, SUM(amount_krw)\nFROM finance.settlements\nGROUP BY 1`,
  }
  return [
    { id: 'overview', title: '개요', blocks: [{ type: 'p', text: SUMMARY[domain] ?? `${domain} 도메인의 테이블이에요.` }, { type: 'p', text: `이 도메인에는 데이터셋 ${ds.length}개가 있고, ${team} 팀이 소유해요. 신선도가 지연이나 오류인 테이블은 상세 화면의 "최근 변경"을 먼저 보세요.` }] },
    { id: 'rules', title: '적재 규약과 사용 규칙', blocks: [{ type: 'ul', items: convention[domain] ?? ['아직 적힌 규약이 없어요. 소유 팀에 물어보세요.'] }, { type: 'callout', ...(caution[domain] ?? { tone: 'info', title: '규약 확인', text: '이 도메인의 규약은 소유 팀 채널에서 확인하세요.' }) }] },
    { id: 'dictionary', title: '데이터 사전', blocks: [{ type: 'p', text: '이름을 누르면 데이터셋 상세(스키마·계보·쿼리)로 가요. 표의 신선도는 지금 값이에요.' }, { type: 'datasets', ids: dsIds }, ...(first ? [{ type: 'columns' as const, dataset: first.id }] : [])] },
    { id: 'queries', title: '자주 쓰는 쿼리', blocks: [{ type: 'code', lang: 'sql', code: query[domain] ?? `SELECT *\nFROM ${domain}.${first?.name.split('.')[1] ?? 'table'}\nLIMIT 100` }, { type: 'p', text: '결과를 대시보드에 붙이려면 쿼리 자체가 아니라 fct 의 집계 테이블을 참조하세요.' }] },
    { id: 'contact', title: '문의', blocks: [{ type: 'p', text: `데이터 정의·스키마 변경 요청은 ${team} 채널로, 권한은 보안팀으로. 긴급한 신선도 문제는 온콜에게.` }] },
  ]
}

export function domainSummaries(datasets: Dataset[]): DomainSummary[] {
  const ids = [...new Set(datasets.map((d) => d.domain))]
  return ids.map((id) => ({ id, name: id, title: TITLE[id] ?? id, count: datasets.filter((d) => d.domain === id).length }))
}

export function domainDoc(id: string, datasets: Dataset[], now = Date.now()): DomainDoc | null {
  const ds = datasets.filter((d) => d.domain === id)
  if (!ds.length) return null
  const [ownerTeam, owner] = OWNER_TEAM[id] ?? ['data-platform', 'bora']
  return {
    id,
    name: id,
    title: TITLE[id] ?? id,
    summary: SUMMARY[id] ?? '',
    ownerTeam,
    owner,
    updatedAt: new Date(now - (3 + salt(id)) * 86400_000).toISOString(),
    watchers: 4 + salt(id) * 3,
    sections: sections(id, ds),
    datasets: ds,
  }
}
const salt = (s: string) => s.length % 5
