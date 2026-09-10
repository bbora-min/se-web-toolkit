/**
 * 브랜드 코어 — 모든 SE 서비스에서 동일한 값.
 * 여기 있는 값은 se.identity.json으로 바꿀 수 없다.
 */
export const brand = {
  font: {
    sans: '"Pretendard Variable", Pretendard, "Noto Sans KR", -apple-system, "Segoe UI", system-ui, sans-serif',
    mono: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  },
  /** 타입 스케일 (px). 이 8단계 밖의 크기는 쓰지 않는다. 2xl=페이지 제목, 3xl=히어로 숫자 */
  text: { xs: 12, sm: 13, base: 14, md: 16, lg: 20, xl: 24, '2xl': 28, '3xl': 36 },
  leading: { tight: 1.25, snug: 1.4, normal: 1.6 },
  /** 반경 패밀리. 모서리는 세 가지뿐 */
  radius: { sm: 4, md: 6, lg: 10, full: 9999 },
  shadow: {
    /** 떠 있는 것(팝오버·드로어)에만 */
    /** 카드·컨트롤의 아주 미세한 존재감 */
    xs: '0 1px 2px rgb(20 30 40 / .05)',
    raised: '0 1px 2px rgb(20 30 40 / .06), 0 6px 16px rgb(20 30 40 / .07)',
    overlay: '0 12px 40px rgb(20 30 40 / .16)',
  },
  motion: {
    fast: '150ms',
    normal: '200ms',
    ease: 'cubic-bezier(.2,.0,.0,1)',
  },
  /** 밀도별 치수(px). 내부 도구는 compact가 기본 */
  density: {
    compact: { control: 30, row: 34, gap: 8, pad: 16 },
    comfortable: { control: 36, row: 44, gap: 12, pad: 24 },
  },
  /**
   * 의미 색 — 액센트와 분리된다. 어떤 서비스든 "실패"는 같은 빨강이어야 한다.
   * [light, dark] 순.
   */
  status: {
    success: { fg: ['#2E7D4F', '#5BC08A'], soft: ['#E6F3EC', '#183A28'] },
    warning: { fg: ['#B7791F', '#E0A64A'], soft: ['#FBF1DE', '#3D2E12'] },
    danger: { fg: ['#C03A2B', '#E5705F'], soft: ['#FAE6E3', '#3F1B17'] },
    info: { fg: ['#2F6FD1', '#6E9FF0'], soft: ['#E5EEFB', '#17284A'] },
  },
  /** 작업 상태색 — 배치·잡·파이프라인 모니터링에서 반복되는 어휘 */
  job: {
    pending: 'warning',
    running: 'info',
    succeeded: 'success',
    failed: 'danger',
    cancelled: 'neutral',
  },
} as const

export type StatusKey = keyof typeof brand.status
export type JobState = keyof typeof brand.job
