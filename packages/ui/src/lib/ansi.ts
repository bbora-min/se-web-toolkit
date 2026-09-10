/**
 * 최소 ANSI SGR 파서 — 로그 뷰어용. 색(30–37, 90–97), 굵게(1), 흐리게(2), 리셋(0/39/22).
 * 배경색·256색·트루컬러는 무시(로그에서 거의 안 씀).
 */
export interface AnsiSpan {
  text: string
  color?: 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white' | 'gray'
  bold?: boolean
  dim?: boolean
}

const COLORS: Record<number, AnsiSpan['color']> = {
  30: 'black', 31: 'red', 32: 'green', 33: 'yellow', 34: 'blue', 35: 'magenta', 36: 'cyan', 37: 'white',
  90: 'gray', 91: 'red', 92: 'green', 93: 'yellow', 94: 'blue', 95: 'magenta', 96: 'cyan', 97: 'white',
}
const RE = /\x1b\[([0-9;]*)m/g

export function parseAnsi(line: string): AnsiSpan[] {
  const out: AnsiSpan[] = []
  let state: Omit<AnsiSpan, 'text'> = {}
  let last = 0
  for (const m of line.matchAll(RE)) {
    const idx = m.index ?? 0
    if (idx > last) out.push({ text: line.slice(last, idx), ...state })
    for (const code of (m[1] || '0').split(';').map(Number)) {
      if (code === 0) state = {}
      else if (code === 1) state = { ...state, bold: true }
      else if (code === 2) state = { ...state, dim: true }
      else if (code === 22) state = { ...state, bold: false, dim: false }
      else if (code === 39) state = { ...state, color: undefined }
      else if (COLORS[code]) state = { ...state, color: COLORS[code] }
    }
    last = idx + m[0].length
  }
  if (last < line.length) out.push({ text: line.slice(last), ...state })
  return out.length ? out : [{ text: '' }]
}

export function stripAnsi(line: string): string {
  return line.replace(RE, '')
}
