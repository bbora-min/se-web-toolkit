// 릴리스 규칙 검사 — 버전은 한 값, 코드가 바뀌면 버전과 CHANGELOG 도 바뀌어야 한다
//   버전의 기준은 루트 package.json. packages/*·plugin.json·marketplace.json 이 전부 같아야 한다.
//   PR 에서 packages/·templates/·plugin/ 이 바뀌었으면 main 보다 큰 버전이어야 하고, 그 태그가 아직 없어야 하며, CHANGELOG.md 에 "## <버전>" 항목이 있어야 한다.
import { readFileSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { PKGS } from './lib/packages.mjs'

const read = (p) => JSON.parse(readFileSync(p, 'utf8'))
const sh = (cmd) => execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
const version = read('package.json').version
const failures = []
const semver = (v) => v.split('.').map(Number)
const gt = (a, b) => { const [x, y] = [semver(a), semver(b)]; for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i]; return false }

for (const p of PKGS) {
  const v = read(`packages/${p}/package.json`).version
  if (v !== version) failures.push(`packages/${p} ${v} ≠ 루트 ${version}`)
}
const plugin = read('plugin/.claude-plugin/plugin.json').version
const market = read('.claude-plugin/marketplace.json')
const mv = market.plugins.find((x) => x.name === 'se')?.version
if (plugin !== version) failures.push(`plugin.json ${plugin} ≠ ${version}`)
if (mv !== version || market.metadata?.version !== version) failures.push(`marketplace.json ${mv}/${market.metadata?.version} ≠ ${version}`)

// 코드 변경 → 버전·CHANGELOG 필수 (main 과 비교할 수 있을 때만)
const base = process.env.RELEASE_BASE ?? 'origin/main'
let changed = []
try {
  const mergeBase = sh(`git merge-base HEAD ${base}`)
  changed = sh(`git diff --name-only ${mergeBase} HEAD`).split('\n').filter(Boolean)
  // 출하되는 것 전부: packages/<pkg>/ 아래(테스트·README·tsconfig 제외), templates/, plugin/
  const releasable = changed.filter((f) => (new RegExp(`^packages/(${PKGS.join('|')})/`).test(f) && !/\/(test|tests)\/|\/README\.md$|tsconfig.*\.json$/.test(f)) || /^(templates|plugin)\//.test(f))
  if (releasable.length) {
    let mainVersion = null
    try { mainVersion = JSON.parse(sh(`git show ${mergeBase}:package.json`)).version } catch {}
    if (mainVersion && !gt(version, mainVersion)) failures.push(`코드가 바뀌었는데 버전(${version})이 main(${mainVersion})보다 크지 않습니다 — pnpm release:bump <새 버전>\n    바뀐 파일: ${releasable.slice(0, 5).join(', ')}${releasable.length > 5 ? ' …' : ''}`)
    const changelog = existsSync('CHANGELOG.md') ? readFileSync('CHANGELOG.md', 'utf8') : ''
    if (!new RegExp(`^## ${version.replace(/\./g, '\\.')}( |$)`, 'm').test(changelog)) failures.push(`CHANGELOG.md 에 "## ${version}" 항목이 없습니다 — 바뀐 것 / 화면 변화 / 앱에서 할 일 세 칸을 적으십시오`)
    // 같은 버전을 두 PR 이 올리는 경우: 먼저 merge 된 쪽이 태그를 찍었으면 나머지는 다시 올려야 한다
    try {
      const tag = sh(`git ls-remote --refs --tags origin v${version}`)
      if (tag) failures.push(`태그 v${version} 이 이미 있습니다 — 다른 PR 이 먼저 그 버전으로 merge 됐습니다. 버전을 다시 올리십시오`)
    } catch { console.warn('! origin 에 닿을 수 없어 태그 존재 검사는 건너뜁니다') }
  }
} catch {
  console.warn(`! ${base} 를 찾을 수 없어 변경 대비 검사는 건너뜁니다 (버전 일치만 확인)`)
}

if (failures.length) {
  console.error('✗ 릴리스 규칙 위반:\n  ' + failures.join('\n  '))
  process.exit(1)
}
console.log(`✓ 릴리스 ${version} — 패키지 ${PKGS.length}개 · 플러그인 · 마켓플레이스 일치${changed.length ? ` (변경 ${changed.length}파일 검사)` : ''}`)
