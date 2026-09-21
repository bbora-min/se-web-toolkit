import { STAGES, type Release, type StageId } from '../api/types'

/** 현재 사용자 — 목·화면이 같은 값을 본다 (실제 앱은 세션에서) */
export const ME = 'bora'
export const ORDER: StageId[] = STAGES.map((s) => s.id)
export const nextStage = (stage: StageId): StageId | null => ORDER[ORDER.indexOf(stage) + 1] ?? null

/**
 * 다음 단계로 갈 수 없는 이유. null 이면 갈 수 있다.
 * 상세 화면의 "다음 단계" 버튼과 보드의 끌기·메뉴가 **같은 함수**를 본다 — 규칙이 두 곳에 있으면 갈라진다.
 */
/** 필수인데 안 된 체크리스트 수 */
export const requiredMissing = (r: Release) => r.checklist.filter((c) => c.required && !c.done).length

/** 내 승인 차례인가 — 승인 단계이고 내가 대기 중인 승인자 */
export const isMyTurn = (r: Release, me: string = ME) => r.stage === 'approval' && r.approvers.some((a) => a.name === me && a.decision === 'pending')

/** 지금 승인할 수 없는 이유. null 이면 승인 가능. 상세 화면·처리함·다이얼로그가 같은 함수를 본다 */
export function decisionBlocker(r: Release, me: string = ME): string | null {
  if (r.stage !== 'approval') return '승인 단계가 아닙니다'
  if (!r.approvers.some((a) => a.name === me && a.decision === 'pending')) return '귀하의 결정이 필요한 릴리스가 아닙니다'
  const missing = requiredMissing(r)
  if (missing > 0) return `필수 체크리스트 ${missing}건이 남아 승인할 수 없습니다. 담당자(${r.owner})에게 완료를 요청하십시오.`
  return null
}

export function advanceBlocker(r: Release, me: string = ME): string | null {
  if (r.stage === 'done') return '완료된 릴리스입니다'
  if (r.stage === 'approval') return '승인 단계는 승인자의 결정으로만 진행됩니다'
  if (r.owner !== me) return '담당자만 다음 단계로 진행할 수 있습니다'
  if (r.stage === 'staging' && requiredMissing(r) > 0) return '필수 체크리스트를 먼저 완료하십시오'
  return null
}
