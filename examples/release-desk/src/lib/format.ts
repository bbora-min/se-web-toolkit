const rtf = new Intl.RelativeTimeFormat('ko', { numeric: 'auto' })
const abs = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'medium', hour12: false })

/** "3분 전" — 표에선 상대 시간, title에 절대 시간을 함께 둔다 */
export function formatRelative(iso: string, now = Date.now()): string {
  const diff = (Date.parse(iso) - now) / 1000
  const a = Math.abs(diff)
  if (a < 60) return rtf.format(Math.round(diff), 'second')
  if (a < 3600) return rtf.format(Math.round(diff / 60), 'minute')
  if (a < 86400) return rtf.format(Math.round(diff / 3600), 'hour')
  return rtf.format(Math.round(diff / 86400), 'day')
}

export function formatAbsolute(iso: string): string {
  return abs.format(new Date(iso))
}

/** 초 → "1:04:12" 또는 "04:12" */
export function formatDuration(sec: number | null): string {
  if (sec == null) return '—'
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}
