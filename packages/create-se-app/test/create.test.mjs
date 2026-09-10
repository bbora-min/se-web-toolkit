import { describe, expect, it } from 'vitest'
import { existsSync, mkdtempSync, readFileSync, readdirSync, symlinkSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { hueDistance, MIN_HUE_DISTANCE, statusHues } from '@se/tokens'
import { main } from '../bin/create-se-app.mjs'

const quiet = { log: () => {} }
const tmp = () => mkdtempSync(join(tmpdir(), 'cse-'))

describe('create-se-app', () => {
  it('템플릿을 복사하고 이름·아이덴티티·포트를 구조적으로 바꾼다', () => {
    const { dir, identity, inWorkspace } = main(['incident-desk', '--hue', '350', '--signature', 'stage-rail', '--tone', 'friendly', '--port', '5199', '--subtitle', 'prod · sre'], { cwd: tmp(), ...quiet })
    expect(inWorkspace).toBe(false)
    expect(identity.name).toBe('Incident Desk')
    expect(identity.mark.text).toBe('ID')
    const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
    expect(pkg.name).toBe('incident-desk')
    expect(pkg.dependencies['@se/ui']).toBe('github:bbora-min/se-web-toolkit#path:packages/ui') // 워크스페이스 밖 → git
    expect(pkg.devDependencies['@se/eslint-plugin']).toBe('github:bbora-min/se-web-toolkit#path:packages/eslint-plugin')
    expect(readFileSync(join(dir, 'index.html'), 'utf8')).toContain('<title>Incident Desk</title>')
    expect(readFileSync(join(dir, 'vite.config.ts'), 'utf8')).toContain('port: 5199')
    expect(readFileSync(join(dir, 'playwright.config.ts'), 'utf8')).toContain('localhost:5199')
    expect(readFileSync(join(dir, 'src/app/Shell.tsx'), 'utf8')).toContain(`const SUBTITLE = "prod · sre"`)
    expect(readFileSync(join(dir, 'CLAUDE.md'), 'utf8')).toMatch(/^# Incident Desk/)
    const idj = JSON.parse(readFileSync(join(dir, 'se.identity.json'), 'utf8'))
    expect(idj.accent.hue).toBe(350)
    expect(idj.signature).toBe('stage-rail')
    expect(existsSync(join(dir, 'public/mockServiceWorker.js'))).toBe(true)
    expect(existsSync(join(dir, 'node_modules'))).toBe(false)
  })
  it('의미 색과 가까운 hue는 거부한다', () => {
    expect(() => main(['x-app', '--hue', '30'], { cwd: tmp(), ...quiet })).toThrow(/danger/)
  })
  it('잘못된 id·signature·미구현 signature를 거부한다', () => {
    expect(() => main(['BadName'], { cwd: tmp(), ...quiet })).toThrow(/kebab-case/)
    expect(() => main(['ok-app', '--signature', 'confetti'], { cwd: tmp(), ...quiet })).toThrow(/signature/)
    expect(() => main(['ok-app', '--signature', 'timeline-ribbon'], { cwd: tmp(), ...quiet })).toThrow(/구현되지 않았습니다/)
  })
  it('실패하면 디렉터리를 남기지 않는다', () => {
    const cwd = tmp()
    expect(() => main(['fail-app', '--hue', '30'], { cwd, ...quiet })).toThrow()
    expect(existsSync(join(cwd, 'fail-app'))).toBe(false)
  })
  it('hue를 주지 않으면 의미 색에서 가장 먼 값을 고른다', () => {
    const { identity } = main(['auto-app'], { cwd: tmp(), ...quiet })
    for (const s of Object.values(statusHues())) expect(hueDistance(identity.accent.hue, s)).toBeGreaterThanOrEqual(MIN_HUE_DISTANCE)
  })
  it('비어 있지 않은 디렉터리는 거부한다', () => {
    const cwd = tmp()
    main(['first-app'], { cwd, ...quiet })
    expect(readdirSync(join(cwd, 'first-app')).length).toBeGreaterThan(0)
    expect(() => main(['first-app'], { cwd, ...quiet })).toThrow(/비어 있지 않습니다/)
  })
})

describe('bin 실행', () => {
  it('심볼릭 링크(node_modules/.bin)로 실행해도 동작한다', () => {
    const cwd = tmp()
    const real = fileURLToPath(new URL('../bin/create-se-app.mjs', import.meta.url))
    const link = join(cwd, 'create-se-app-link.mjs')
    symlinkSync(real, link)
    const out = execFileSync(process.execPath, [link, 'link-app', '--port', '5190'], { cwd, encoding: 'utf8' })
    expect(out).toContain('Link App 생성')
    expect(existsSync(join(cwd, 'link-app', 'package.json'))).toBe(true)
  })
})
