// 사이트의 온보딩 문서(시작하기·동작 원리)가 원본과 어긋나지 않았는지 — CI `check` 잡이 돌린다.
//  원본: plugin/skills/*/SKILL.md · packages/tokens/identity.schema.json · templates/app-vite-react · packages/eslint-plugin/src/rules · plugin/skills/se-ui/references/patterns
//  대조 대상: apps/site/src/lib/onboarding.ts(순수 데이터) · apps/site/src/lib/archetypes.ts(텍스트로 읽는다 — PNG import 때문)
// 실패하면 스킬이 바뀐 것이다: onboarding.ts 와 해당 페이지 문장을 같이 고친다.
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { ADOPT_STAGES, COMMANDS, INTERVIEW_QUESTIONS, PAGE_STEP_TITLES, RULES, SLOTS, TEMPLATE_TREE } from '../apps/site/src/lib/onboarding'
import type { TreeNode } from '../apps/site/src/components/diagrams'

const root = join(import.meta.dirname, '..')
const read = (p: string) => readFileSync(join(root, p), 'utf8')
const problems: string[] = []
const fail = (msg: string) => problems.push(msg)
const same = (label: string, got: string[], want: string[]) => {
  const g = [...got].sort(), w = [...want].sort()
  if (g.join('|') !== w.join('|')) fail(`${label}\n    사이트: ${g.join(', ')}\n    원본:   ${w.join(', ')}`)
}

// 1. 명령 — 스킬 description 의 인용("/se:new <id>" 또는 '/se:adopt [0-5]')
const skillCmds = readdirSync(join(root, 'plugin/skills'))
  .map((d) => read(`plugin/skills/${d}/SKILL.md`).match(/^description:.*?['"](\/se:[a-z]+)/ms)?.[1])
  .filter((x): x is string => Boolean(x))
same('명령 목록이 plugin/skills 와 다릅니다', COMMANDS.map(([c]) => c.split(' ')[0]!), skillCmds)

// 2. /se:new 인터뷰 문항 수
const interview = Number(read('plugin/skills/new/SKILL.md').match(/인터뷰 (\d+)문항/)?.[1])
if (interview !== INTERVIEW_QUESTIONS) fail(`인터뷰 문항 수: 사이트 ${INTERVIEW_QUESTIONS} · new/SKILL.md ${interview}`)

// 3. /se:page 절차 단계 수
const pageSteps = (read('plugin/skills/page/SKILL.md').split('## 절차')[1] ?? '').split('\n## ')[0]!.split('\n').filter((l) => /^\d+\. /.test(l)).length
if (pageSteps !== PAGE_STEP_TITLES.length) fail(`/se:page 단계 수: 사이트 ${PAGE_STEP_TITLES.length} · page/SKILL.md ${pageSteps}`)

// 4. /se:adopt 단계 수
const adopt = read('plugin/skills/adopt/SKILL.md').split('\n').filter((l) => /^\| \*\*\d/.test(l)).length
if (adopt !== ADOPT_STAGES.length) fail(`/se:adopt 단계 수: 사이트 ${ADOPT_STAGES.length} · adopt/SKILL.md ${adopt}`)

// 5. 템플릿 파일 트리 — 잎 노드가 실제로 있어야 한다
const walk = (nodes: TreeNode[], base: string) => {
  for (const n of nodes) {
    const p = join(base, n.name)
    if (n.children) walk(n.children, p)
    else if (!existsSync(join(root, 'templates/app-vite-react', p))) fail(`템플릿에 없는 파일이 트리에 있습니다: ${p}`)
  }
}
walk(TEMPLATE_TREE, '')

// 6. 린트 규칙 이름
same('린트 규칙이 packages/eslint-plugin/src/rules 와 다릅니다', RULES.map(([n]) => n), readdirSync(join(root, 'packages/eslint-plugin/src/rules')).map((f) => f.replace(/\.js$/, '')))

// 7. 아이덴티티 항목·허용값
const schema = JSON.parse(read('packages/tokens/identity.schema.json')) as { properties: Record<string, { enum?: string[] }> }
const schemaKeys = Object.keys(schema.properties).filter((k) => !['$schema', 'id', 'name', 'chart'].includes(k))
same('아이덴티티 항목이 identity.schema.json 과 다릅니다', SLOTS.map(([k]) => k.split('.')[0]!), schemaKeys)
for (const [k, values] of SLOTS) {
  const e = schema.properties[k]?.enum
  if (e) same(`아이덴티티 '${k}' 허용값이 스키마와 다릅니다`, values.split(' · '), e)
}

// 8. 골격 — 패턴 문서가 있고, 원본 라우트가 앱에 있다
const arch = read('apps/site/src/lib/archetypes.ts')
const APP_DIR: Record<string, string> = { 'job-monitor': 'reference-app', 'dataset-explorer': 'dataset-explorer', 'release-desk': 'release-desk', 'se-home': 'se-home' }
const items = [...arch.matchAll(/\{ id: '([^']+)'.*?app: '([^']+)'.*?path: '([^']+)'.*?pattern: '([^']+)'/gs)]
if (items.length !== 10) fail(`골격이 10개가 아닙니다: ${items.length}`)
for (const [, id, app, path, pattern] of items) {
  if (!existsSync(join(root, `plugin/skills/se-ui/references/patterns/${pattern}.md`))) fail(`골격 '${id}' 의 패턴 문서가 없습니다: patterns/${pattern}.md`)
  const routes = read(`examples/${APP_DIR[app!]}/src/app/App.tsx`)
  const first = '/' + (path!.split('?')[0]!.split('/')[1] ?? '')
  if (!routes.includes(`path="${first}`) && !(first === '/' && routes.includes('<Route index'))) fail(`골격 '${id}' 의 원본 라우트 ${path} 가 ${APP_DIR[app!]} 의 App.tsx 에 없습니다`)
}

if (problems.length) {
  console.error(`✗ 사이트 온보딩 문서가 원본과 어긋납니다 (${problems.length}):\n` + problems.map((p) => `  - ${p}`).join('\n'))
  console.error('  → apps/site/src/lib/onboarding.ts · archetypes.ts 와 시작하기·동작 원리 페이지를 고치십시오')
  process.exit(1)
}
console.log(`✓ 사이트 온보딩 문서 — 명령 ${COMMANDS.length} · 단계 ${PAGE_STEP_TITLES.length}/${ADOPT_STAGES.length} · 템플릿 트리 · 규칙 ${RULES.length} · 아이덴티티 항목 ${SLOTS.length} · 골격 ${items.length} 일치`)
