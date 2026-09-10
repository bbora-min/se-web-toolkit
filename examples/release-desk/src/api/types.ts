export type StageId = 'draft' | 'review' | 'staging' | 'approval' | 'deploy' | 'done'
export type ReleaseType = 'feature' | 'hotfix' | 'maintenance'
export type Risk = 'low' | 'medium' | 'high'
export type Decision = 'pending' | 'approved' | 'rejected'

export interface Approver {
  name: string
  team: string
  decision: Decision
  comment?: string
  at?: string
}
export interface ChecklistItem {
  id: string
  label: string
  done: boolean
  required: boolean
}
export interface TimelineEvent {
  at: string
  who: string
  what: string
  kind: 'stage' | 'approve' | 'reject' | 'comment' | 'create' | 'deploy'
}
export interface Release {
  id: string
  version: string
  service: string
  title: string
  type: ReleaseType
  risk: Risk
  stage: StageId
  owner: string
  team: string
  approvers: Approver[]
  /** ISO 날짜 — 배포 창 */
  windowFrom: string
  windowTo: string
  createdAt: string
  changes: string[]
  checklist: ChecklistItem[]
  rollback: string
  /** 막힘 사유 */
  blocked?: string
  timeline: TimelineEvent[]
  notifySlack: boolean
}

export interface ReleaseDraft {
  service: string
  version: string
  title: string
  type: ReleaseType
  description: string
  changes: string
  risk: Risk
  checklist: string[]
  rollback: string
  windowFrom: string
  windowTo: string
  approvers: string[]
  notifySlack: boolean
}

export const STAGES: Array<{ id: StageId; label: string }> = [
  { id: 'draft', label: '초안' },
  { id: 'review', label: '코드 검토' },
  { id: 'staging', label: '스테이징 검증' },
  { id: 'approval', label: '승인' },
  { id: 'deploy', label: '배포' },
  { id: 'done', label: '완료' },
]
export const SERVICES = ['job-monitor', 'dataset-explorer', 'release-desk', 'api-gateway', 'billing', 'notification'] as const
export const PEOPLE: Array<{ name: string; team: string }> = [
  { name: 'bora', team: 'platform' },
  { name: 'jihoon', team: 'platform' },
  { name: 'minseo', team: 'analytics' },
  { name: 'seoyeon', team: 'ml-infra' },
  { name: 'taeho', team: 'finance-eng' },
  { name: 'yuna', team: 'sre' },
  { name: 'dohyun', team: 'security' },
]
export const CHECKLIST_TEMPLATE = [
  { id: 'tests', label: 'CI 테스트 통과', required: true },
  { id: 'migration', label: 'DB 마이그레이션 검토 (있는 경우)', required: false },
  { id: 'flags', label: '피처 플래그로 감쌈', required: false },
  { id: 'rollback', label: '롤백 절차 확인', required: true },
  { id: 'notice', label: '이해관계자 공지', required: true },
]
