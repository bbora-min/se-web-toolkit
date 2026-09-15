#!/usr/bin/env node
// 사용: se-upgrade [--dir <앱 폴더>] [--to v0.9.0] [--dry] [--no-install] [--json]
//   1) 현재 태그(package.json 의 @se/* 참조) ↔ 목표 태그(기본: 최신) 사이 CHANGELOG 의 "앱에서 할 일" 출력
//   2) 참조를 github:…#<태그>&path:packages/<pkg> 로 교체 (main 추적 #path: 도 태그 고정으로)
//   3) pnpm install → typecheck → lint (스크립트가 있을 때만)
//   스크린샷 diff·리뷰·PR 은 /se:upgrade 스킬(사람이 보는 부분)이 이어서 한다
import { execSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

export const REPO = 'bbora-min/se-web-toolkit'
const PKGS = ['ui', 'tokens', 'charts', 'eslint-plugin']
const REF_RE = /^github:bbora-min\/se-web-toolkit#(?:(v\d+\.\d+\.\d+)&)?path:packages\/([\w-]+)$/

const args = process.argv.slice(2)
const flag = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined }
const has = (n) => args.includes(n)
const sh = (cmd, cwd) => execSync(cmd, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()

/** 앱 루트: --dir 또는 cwd. 루트에 @se/ui 가 없으면 한 단계 아래(frontend/ 등)를 찾는다 */
export function findApp(start) {
  const hasUi = (d) => existsSync(join(d, 'package.json')) && /"@se\/ui"/.test(readFileSync(join(d, 'package.json'), 'utf8'))
  if (hasUi(start)) return start
  for (const d of ['frontend', 'web', 'app', 'client', 'ui']) if (hasUi(join(start, d))) return join(start, d)
  return null
}
export function currentTag(pkg) {
  const all = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) }
  const tags = new Set()
  for (const [k, v] of Object.entries(all)) if (k.startsWith('@se/')) { const m = REF_RE.exec(v); if (m) tags.add(m[1] ?? 'main') }
  return tags.size === 1 ? [...tags][0] : tags.size ? `혼합(${[...tags].join(',')})` : null
}
export function rewriteRefs(pkg, tag) {
  let n = 0
  for (const sec of ['dependencies', 'devDependencies']) {
    for (const [k, v] of Object.entries(pkg[sec] ?? {})) {
      if (!k.startsWith('@se/')) continue
      const m = REF_RE.exec(v); if (!m) continue
      const next = `github:${REPO}#${tag}&path:packages/${m[2]}`
      if (next !== v) { pkg[sec][k] = next; n++ }
    }
  }
  return n
}
const semver = (t) => t.replace(/^v/, '').split('.').map(Number)
const gt = (a, b) => { const [x, y] = [semver(a), semver(b)]; for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i]; return false }
/** CHANGELOG 에서 (from, to] 구간의 "앱에서 할 일" 만 */
export function todosBetween(changelog, from, to) {
  const out = []
  for (const sec of changelog.split(/^## /m).slice(1)) {
    const ver = 'v' + sec.split(/\s/)[0]
    if (!/^v\d+\.\d+\.\d+$/.test(ver)) continue
    if (!gt(ver, from === 'main' ? 'v0.0.0' : from) || gt(ver, to)) continue
    const m = /\*\*앱에서 할 일\*\*\n([\s\S]*?)(?=\n\*\*|\n## |$)/.exec(sec)
    const body = (m?.[1] ?? '').trim()
    if (body && !/^- 없음/.test(body)) out.push({ ver, body })
  }
  return out
}

async function main() {
  const start = resolve(flag('--dir') ?? process.cwd())
  const app = findApp(start)
  if (!app) { console.error(`✗ ${start} 에서 @se/ui 를 쓰는 package.json 을 찾지 못했습니다`); process.exit(1) }
  const pkgPath = join(app, 'package.json')
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
  const from = currentTag(pkg) ?? 'main'
  const latest = sh(`git ls-remote --refs --tags --sort=-v:refname https://github.com/${REPO} "v*"`).split('\n')[0]?.replace(/.*\//, '')
  const to = flag('--to') ?? latest
  if (!/^v\d+\.\d+\.\d+$/.test(to ?? '')) { console.error('✗ 목표 태그를 알 수 없습니다 (--to v0.9.0)'); process.exit(1) }
  const res = await fetch(`https://raw.githubusercontent.com/${REPO}/${to}/CHANGELOG.md`)
  const changelog = res.ok ? await res.text() : ''
  const todos = todosBetween(changelog, from, to)
  const json = has('--json')
  if (!json) {
    console.log(`앱: ${app}\n현재: ${from} → 목표: ${to}${from === to ? ' (이미 최신)' : ''}`)
    if (todos.length) { console.log('\n앱에서 할 일:'); for (const t of todos) console.log(`  [${t.ver}]\n${t.body.replace(/^/gm, '    ')}`) }
    else console.log('\n앱에서 할 일: 없음')
  }
  if (from === to && !has('--force')) { if (json) console.log(JSON.stringify({ app, from, to, changed: 0, todos })); return }
  const changed = rewriteRefs(pkg, to)
  if (has('--dry')) { if (json) console.log(JSON.stringify({ app, from, to, changed, todos, dry: true })); else console.log(`\n(dry) 참조 ${changed}개를 ${to} 로 바꿉니다`); return }
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  if (!json) console.log(`\n✎ package.json: @se/* 참조 ${changed}개 → ${to}`)
  const steps = []
  if (!has('--no-install')) {
    for (const [name, cmd] of [['install', 'pnpm install'], ['typecheck', 'pnpm run --if-present typecheck'], ['lint', 'pnpm run --if-present lint']]) {
      try { sh(cmd, app); steps.push({ name, ok: true }); if (!json) console.log(`✓ ${name}`) }
      catch (e) { steps.push({ name, ok: false, out: String(e.stdout ?? e.message).slice(-2000) }); if (!json) console.log(`✗ ${name}\n${String(e.stdout ?? e.message).slice(-1500)}`); break }
    }
  }
  if (json) console.log(JSON.stringify({ app, from, to, changed, todos, steps }))
  else console.log(`\n다음: 전/후 스크린샷 비교와 리뷰는 /se:upgrade 가, 플러그인은 claude plugin update se@se-web-toolkit`)
  if (steps.some((s) => !s.ok)) process.exit(2)
}
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) main().catch((e) => { console.error(e); process.exit(1) })
