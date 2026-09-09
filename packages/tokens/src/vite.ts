import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'
import { createTheme } from './createTheme'
import { themeToCss } from './css'

const VIRTUAL_ID = 'virtual:se-theme.css'
const RESOLVED_ID = '\0se-theme.css'

export interface SeTokensOptions {
  /** se.identity.json 경로. 기본: 프로젝트 루트 */
  identityFile?: string
}

/**
 * `import 'virtual:se-theme.css'` 한 줄로 아이덴티티 기반 CSS 변수를 주입한다.
 * se.identity.json을 바꾸면 HMR로 즉시 반영된다.
 */
export function seTokens(options: SeTokensOptions = {}): Plugin {
  let file = ''
  const build = () => {
    const raw = JSON.parse(readFileSync(file, 'utf8')) as unknown
    return themeToCss(createTheme(raw as Parameters<typeof createTheme>[0]))
  }
  return {
    name: 'se-tokens',
    configResolved(config) {
      file = resolve(config.root, options.identityFile ?? 'se.identity.json')
    },
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : null
    },
    load(id) {
      if (id !== RESOLVED_ID) return null
      this.addWatchFile(file)
      return build()
    },
    handleHotUpdate({ file: changed, server }) {
      if (changed !== file) return
      const mod = server.moduleGraph.getModuleById(RESOLVED_ID)
      if (mod) {
        server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      }
    },
  }
}
