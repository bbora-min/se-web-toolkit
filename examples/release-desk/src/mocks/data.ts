import { CHECKLIST_TEMPLATE, PEOPLE, SERVICES, type Release, type StageId } from '../api/types'

let seed = 20260911
function rnd() {
  seed = (seed * 1664525 + 1013904223) % 4294967296
  return seed / 4294967296
}
const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(rnd() * xs.length)]!

const TITLES = [
  '결제 재시도 큐 도입', '검색 인덱스 v3 마이그레이션', '알림 템플릿 다국어 지원', '대시보드 응답 캐시', 'OAuth 토큰 갱신 버그 수정',
  '감사 로그 보존 기간 연장', '요금제 변경 플로우 개편', 'gRPC 타임아웃 조정', '스케줄러 리더 선출 개선', '이미지 업로드 크기 제한 완화',
  '주문 취소 웹훅 재전송', '세션 만료 처리 통일', 'S3 export 병렬화', '데이터셋 태그 일괄 편집', '노드 드레인 자동화',
]
const STAGE_DIST: StageId[] = ['draft', 'review', 'review', 'staging', 'staging', 'approval', 'approval', 'approval', 'deploy', 'done', 'done', 'done']
const BLOCKS = ['스테이징 E2E 2건 실패', '보안 검토 대기', 'DB 마이그레이션 락 경합', '승인자 부재']

export function makeReleases(count = 28): Release[] {
  const now = Date.now()
  const out: Release[] = []
  for (let i = 0; i < count; i++) {
    const service = pick(SERVICES)
    const stage = pick(STAGE_DIST)
    const type = rnd() < 0.15 ? 'hotfix' : rnd() < 0.25 ? 'maintenance' : 'feature'
    const risk = type === 'hotfix' ? 'high' : rnd() < 0.55 ? 'low' : rnd() < 0.7 ? 'medium' : 'high'
    const owner = pick(PEOPLE)
    const major = 4, minor = 12 + Math.floor(rnd() * 8), patch = Math.floor(rnd() * 6)
    const version = type === 'hotfix' ? `v${major}.${minor}.${patch + 1}` : `v${major}.${minor + 1}.0${rnd() < 0.3 ? '-rc' + (1 + Math.floor(rnd() * 3)) : ''}`
    const createdAt = new Date(now - Math.floor(rnd() * 14) * 86400_000 - rnd() * 3600_000 * 8).toISOString()
    const offset = stage === 'done' ? -Math.floor(rnd() * 7) - 1 : Math.floor(rnd() * 10)
    const from = new Date(now + offset * 86400_000)
    from.setHours(10, 0, 0, 0)
    const to = new Date(from.getTime() + 8 * 3600_000)
    const approverCount = risk === 'high' ? 3 : 2
    const approvers = [...PEOPLE].filter((p) => p.name !== owner.name).sort(() => rnd() - 0.5).slice(0, approverCount).map((p, j) => {
      const decided = stage === 'done' || stage === 'deploy' ? true : stage === 'approval' ? rnd() < 0.5 : false
      const rejected = decided && stage === 'approval' && j === 0 && rnd() < 0.2
      return {
        ...p,
        decision: (decided ? (rejected ? 'rejected' : 'approved') : 'pending') as 'pending' | 'approved' | 'rejected',
        comment: rejected ? '롤백 절차가 구체적이지 않습니다. 단계별로 적어 주세요.' : decided && rnd() < 0.4 ? '확인했습니다.' : undefined,
        at: decided ? new Date(now - rnd() * 86400_000 * 2).toISOString() : undefined,
      }
    })
    const blocked = stage !== 'done' && stage !== 'draft' && rnd() < 0.22 ? pick(BLOCKS) : undefined
    const stageIdx = ['draft', 'review', 'staging', 'approval', 'deploy', 'done'].indexOf(stage)
    const checklist = CHECKLIST_TEMPLATE.map((c) => ({ ...c, done: stageIdx >= 3 ? true : rnd() < 0.5 }))
    const timeline = [
      { at: createdAt, who: owner.name, what: `${version} 초안 작성`, kind: 'create' as const },
      ...['review', 'staging', 'approval', 'deploy', 'done'].slice(0, stageIdx).map((s, k) => ({
        at: new Date(Date.parse(createdAt) + (k + 1) * 86400_000 * 1.3).toISOString(),
        who: k % 2 ? 'yuna' : owner.name,
        what: `${['코드 검토', '스테이징 검증', '승인', '배포', '완료'][k]} 단계로 이동`,
        kind: 'stage' as const,
      })),
      ...approvers.filter((a) => a.decision !== 'pending').map((a) => ({ at: a.at!, who: a.name, what: a.decision === 'approved' ? '승인' : `반려 — ${a.comment}`, kind: a.decision === 'approved' ? ('approve' as const) : ('reject' as const) })),
    ].sort((a, b) => a.at.localeCompare(b.at))
    out.push({
      id: `rel_${(3000 + i).toString(36)}${Math.floor(rnd() * 1e5).toString(36)}`,
      version,
      service,
      title: TITLES[i % TITLES.length]!,
      type,
      risk,
      stage,
      owner: owner.name,
      team: owner.team,
      approvers,
      windowFrom: from.toISOString(),
      windowTo: to.toISOString(),
      createdAt,
      changes: ['핵심 경로 리팩터링', '설정 키 2개 추가 (RETRY_MAX, RETRY_BACKOFF_MS)', '관측 지표 3종 추가', '문서 갱신'].slice(0, 2 + Math.floor(rnd() * 3)),
      checklist,
      rollback: '이전 태그로 재배포 (약 4분). 마이그레이션은 하위 호환이라 되돌리지 않음.',
      blocked,
      timeline,
      notifySlack: rnd() < 0.7,
    })
  }
  return out.sort((a, b) => a.windowFrom.localeCompare(b.windowFrom))
}
