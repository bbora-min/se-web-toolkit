// GitHub Pages 한 사이트로 조립: / 사이트(apps/site) · /storybook/ · /apps/<id>/ 예제 앱(브라우저 목 포함)
// 사용: PAGES_BASE=/se-web-toolkit/ node scripts/build-pages.mjs  → _site/  (로컬 미리보기: npx serve _site)
import { execSync } from 'node:child_process'
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'

const base = (process.env.PAGES_BASE ?? '/').replace(/^\/?/, '/').replace(/\/?$/, '/')
const APPS = [
  ['job-monitor', 'reference-app'],
  ['dataset-explorer', 'dataset-explorer'],
  ['release-desk', 'release-desk'],
  ['se-home', 'se-home'],
]
const out = '_site'
// 깊은 링크 저장 키 — @se/ui restoreDeepLink 와 같은 값이어야 한다. 소스에서 읽어 어긋나면 빌드가 실패한다
const DEEP_LINK_KEY = readFileSync('packages/ui/src/lib/spa.ts', 'utf8').match(/DEEP_LINK_KEY = '([^']+)'/)?.[1]
if (!DEEP_LINK_KEY) throw new Error('packages/ui/src/lib/spa.ts 에서 DEEP_LINK_KEY 를 찾지 못했습니다')
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

// 정적 호스팅엔 서버 라우팅이 없다 — 깊은 링크는 404.html 이 주소를 저장하고 그 앱의 루트로 보낸 뒤 restoreDeepLink() 가 되돌린다.
// 아는 앱(APPS)과 사이트만 — 모르는 경로(옛 앱 id, storybook 안)는 404 로 남긴다(리다이렉트 무한 반복 방지)
writeFileSync(
  `${out}/404.html`,
  `<!doctype html><meta charset="utf-8"><title>SE Web Toolkit</title><body><script>
(function(){var b=${JSON.stringify(base)},apps=${JSON.stringify(APPS.map(([id]) => id))},p=location.pathname,root=null;
if(p.indexOf(b+'apps/')===0){var id=p.slice(b.length+5).split('/')[0];if(apps.indexOf(id)>=0)root=b+'apps/'+id+'/'}
else if(p.indexOf(b+'storybook/')!==0)root=b;
if(!root||root===p){document.body.textContent='404 — '+p;return}
try{sessionStorage.setItem(${JSON.stringify(DEEP_LINK_KEY)},location.href)}catch(e){}
location.replace(root)})()
</script>`,
)
writeFileSync(`${out}/.nojekyll`, '')
console.log(`\n✓ ${out}/ — ${['/', '/storybook/', ...APPS.map(([id]) => `/apps/${id}/`)].join(' · ')}`)
