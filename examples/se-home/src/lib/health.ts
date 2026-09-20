import type { Health } from '../api/types'

/** 서비스 상태 → 라벨·의미 색. 홈 카드·표·팔레트가 같은 것을 쓴다 */
export const HEALTH: Record<Health, { label: string; tone: 'success' | 'warning' | 'danger' }> = {
  ok: { label: '정상', tone: 'success' },
  degraded: { label: '저하', tone: 'warning' },
  down: { label: '장애', tone: 'danger' },
}
