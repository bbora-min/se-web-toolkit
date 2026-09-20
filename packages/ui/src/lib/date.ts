/** 로컬 날짜 유틸 — "YYYY-MM-DD" 를 UTC 로 오해하지 않는다(`new Date('2026-09-15')` 는 UTC 자정이라 서쪽 시간대에서 하루 밀린다) */

/** Date → "YYYY-MM-DD" (로컬) */
export const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** "YYYY-MM-DD" → 로컬 자정 Date. 시각이 붙은 ISO 면 그대로 파싱 */
export function parseLocal(s: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return new Date(s)
}

/** ISO 또는 "YYYY-MM-DD" → 그날의 "YYYY-MM-DD" (로컬) */
export const dayOf = (s: string) => ymd(parseLocal(s))

export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

/** "YYYY-MM-DD" 가 실제 날짜인가 (2026-02-30 같은 것을 거른다) */
export function isValidYmd(s: string | null | undefined): s is string {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  return ymd(parseLocal(s)) === s
}
