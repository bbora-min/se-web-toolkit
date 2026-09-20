import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { seTokens } from '@se/tokens/vite'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../..', import.meta.url))
/** 버전·최근 변경은 손으로 적지 않는다 — 루트 package.json 과 CHANGELOG 맨 위 항목에서 빌드 때 읽는다 */
function release() {
  const version = (JSON.parse(readFileSync(`${root}/package.json`, 'utf8')) as { version: string }).version
  const log = readFileSync(`${root}/CHANGELOG.md`, 'utf8')
  const m = log.match(/^## (\S+) — (\S+)\n\n\*\*바뀐 것\*\*\n([\s\S]*?)\n\n\*\*/m)
  const changed = m ? m[3]!.split('\n').filter((l) => l.startsWith('- ')).map((l) => l.slice(2).replace(/\*\*/g, '').replace(/`/g, '').trim()).filter(Boolean) : []
  return { version, date: m?.[2] ?? '', changed: changed.slice(0, 3) }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), seTokens()],
  define: { __RELEASE__: JSON.stringify(release()) },
  // 예제 앱의 기준 스크린샷(e2e/__snapshots__)을 그대로 그림으로 쓴다 — CI 가 갱신하니 늘 최신 화면이다
  server: { port: 5178, fs: { allow: ['../..'] } },
})
