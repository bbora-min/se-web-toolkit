// GitHub Pages 한 사이트로 조립: / 사이트(apps/site) · /storybook/ · /apps/<id>/ 예제 앱(브라우저 목 포함)
// 사용: PAGES_BASE=/se-web-toolkit/ node scripts/build-pages.mjs  → _site/  (로컬 미리보기: npx serve _site)
import { execSync } from 'node:child_process'
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'

const base = (process.env.PAGES_BASE ?? '/').replace(/^\/?/, '/').replace(/\/?$/, '/')
const APPS = [
  ['job-monitor', 'reference-app'],
  ['dataset-explorer', 'dataset-explorer'],
  ['release-desk', 'release-desk'],
  ['se-home', 'se-home'],
]
const out = '_site'
const run = (cmd, env = {}) => execSync(cmd, { stdio: 'inherit', env: { ...process.env, ...env } })

rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })

console.log(`\n▶ 사이트 (${base})`)
run(`pnpm --filter se-site exec vite build --base=${base}`)
cpSync('apps/site/dist', out, { recursive: true })

console.log('\n▶ Storybook')
run('pnpm build:storybook')
cpSync('apps/storybook/dist', `${out}/storybook`, { recursive: true })

for (const [id, pkg] of APPS) {
  console.log(`\n▶ ${id} (${base}apps/${id}/)`)
  run(`pnpm --filter ${pkg} exec vite build --base=${base}apps/${id}/`, { VITE_MOCK: 'true' })
  cpSync(`examples/${pkg}/dist`, `${out}/apps/${id}`, { recursive: true })
}

// 정적 호스팅엔 서버 라우팅이 없다 — 깊은 링크는 404.html 이 주소를 저장하고 그 앱의 루트로 보낸 뒤 restoreDeepLink() 가 되돌린다
writeFileSync(
  `${out}/404.html`,
  `<!doctype html><meta charset="utf-8"><title>SE Web Toolkit</title><script>
(function(){var b=${JSON.stringify(base)},p=location.pathname,m=p.match(new RegExp('^'+b.replace(/[.*+?^$()|[\\]\\\\]/g,'\\\\$&')+'apps/([^/]+)/'));
if(p.indexOf(b+'storybook/')===0){document.body.textContent='404';return}
try{sessionStorage.setItem('se:deep-link',location.href)}catch(e){}
location.replace(m?b+'apps/'+m[1]+'/':b)})()
</script>`,
)
writeFileSync(`${out}/.nojekyll`, '')
console.log(`\n✓ ${out}/ — ${['/', '/storybook/', ...APPS.map(([id]) => `/apps/${id}/`)].join(' · ')}`)
