/** 첫 화면의 예시 도메인. /se:spec 이 실제 도메인으로 바꾼다 */
export type ItemState = 'active' | 'paused' | 'error'

export interface Item {
  id: string
  name: string
  state: ItemState
  owner: string
  updatedAt: string
  count: number
}
