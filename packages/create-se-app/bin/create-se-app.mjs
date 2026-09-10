#!/usr/bin/env node
/**
 * create-se-app — templates/app-vite-react(컴파일되는 진짜 앱)를 복사하고 아이덴티티·이름·포트만 구조적으로 바꾼다.
 * 텍스트 플레이스홀더 치환은 하지 않는다 — 템플릿은 그 자체로 워크스페이스에서 타입체크·린트된다.
 *
 *   node packages/create-se-app/bin/create-se-app.mjs incident-desk --name "Incident Desk" --hue 325 --signature stage-rail
 *
 * 옵션: --name --mark --hue --signature --neutral --density --tone --port --dir --subtitle
 * 지금은 툴킷 모노레포 안에서만 동작한다 (@se/* 는 아직 npm 에 배포되지 않았다).
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkRegistry, createTheme, hueDistance, IMPLEMENTED_SIGNATURES, SIGNATURES, statusHues } from '@se/tokens'

const here = dirname(fileURLToPath(import.meta.url))
const TEMPLATE = resolve(here, '..', '..', '..', 'templates', 'app-vite-react')
const TEMPLATE_ID = 'app-vite-react'
const TEMPLATE_NAME = 'SE App'
const TEMPLATE_PORT = 5170

function parseArgs(argv) {
  const out = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const [k, inline] = a.slice(2).split('=')
      out[k] = inline ?? (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true')
    } else out._.push(a)
  }
  return out
}

/** 위로 올라가며 툴킷 모노레포 루트(pnpm-workspace.yaml + packages/tokens)를 찾는다 */
function findWorkspaceRoot(from) {
  let d = resolve(from)
  for (;;) {
    if (existsSync(join(d, 'pnpm-workspace.yaml')) && existsSync(join(d, 'packages', 'tokens'))) return d
    const up = dirname(d)
    if (up === d) return null
    d = up
  }
}

/**
 * 의미 색·형제 모두에서 가장 멀리 떨어진 hue.
 * 의미 색과 30° 이상 떨어진 후보는 createTheme 의 18° 규칙과 대비 규칙을 항상 통과한다(tokens 테스트가 전 hue를 검증) — 여기서 다시 돌리지 않는다.
 */
function suggestHue(siblingHues) {
  const avoid = [...Object.values(statusHues()), ...siblingHues]
  let best = 200
  let bestGap = -1
  for (let h = 0; h < 360; h += 5) {
    const gap = Math.min(...avoid.map((a) => hueDistance(h, a)))
    if (gap > bestGap) {
      best = h
      bestGap = gap
    }
  }
  return best
}

const editJson = (file, fn) => {
  const d = JSON.parse(readFileSync(file, 'utf8'))
  fn(d)
  writeFileSync(file, JSON.stringify(d, null, 2) + '\n')
}
const editText = (file, pairs) => {
  let s = readFileSync(file, 'utf8')
  for (const [from, to] of pairs) {
    if (!s.includes(from)) throw new Error(`템플릿이 바뀌었습니다: ${relative(TEMPLATE, file)} 에 "${from}" 이 없습니다 — create-se-app 도 같이 고치십시오`)
    s = s.split(from).join(to)
  }
  writeFileSync(file, s)
}

export function main(argv = process.argv.slice(2), { cwd = process.cwd(), log = console.log } = {}) {
  const args = parseArgs(argv)
  const id = args._[0]
  if (!id || !/^[a-z][a-z0-9-]{1,39}$/.test(id)) {
    throw new Error(`사용법: create-se-app <id> [--name "표시 이름"] [--hue 0-360] [--signature ${IMPLEMENTED_SIGNATURES.join('|')}] [--neutral cool|warm|neutral|accent] [--density compact|comfortable] [--tone terse|friendly|procedural] [--mark AB] [--port 5173] [--subtitle "환경 · 팀"] [--dir 경로]\n  id는 kebab-case (예: incident-desk)`)
  }
  if (!existsSync(TEMPLATE)) throw new Error(`템플릿을 찾을 수 없습니다: ${TEMPLATE}`)
  const workspace = findWorkspaceRoot(cwd)
  const dir = resolve(cwd, args.dir ?? (workspace ? join(workspace, 'examples', id) : id))
  if (existsSync(dir) && readdirSync(dir).length) throw new Error(`${dir} 가 비어 있지 않습니다`)
  // 생성 위치가 워크스페이스 안(examples/*)일 때만 workspace:* 링크와 레지스트리 등록
  const inWorkspace = Boolean(workspace) && dirname(dir) === join(workspace, 'examples')

  const registryPath = workspace ? join(workspace, 'identities', 'registry.json') : null
  const registry = registryPath && existsSync(registryPath) ? JSON.parse(readFileSync(registryPath, 'utf8')) : { services: [] }
  const siblingHues = registry.services.map((s) => s.hue)
  const hue = args.hue !== undefined ? Number(args.hue) : suggestHue(siblingHues)
  if (!Number.isFinite(hue) || hue < 0 || hue > 360) throw new Error('--hue 는 0–360 사이 숫자')
  const signature = args.signature ?? 'status-strip'
  if (!SIGNATURES.includes(signature)) throw new Error(`signature는 ${SIGNATURES.join(' | ')} 중 하나`)
  if (!IMPLEMENTED_SIGNATURES.includes(signature)) throw new Error(`${signature}는 아직 @se/ui에 구현되지 않았습니다. 지금 쓸 수 있는 것: ${IMPLEMENTED_SIGNATURES.join(' | ')}`)
  const name = args.name ?? id.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ')
  const identity = {
    id,
    name,
    mark: { type: 'monogram', text: args.mark ?? id.split('-').map((w) => w[0].toUpperCase()).join('').slice(0, 2) },
    accent: { hue },
    neutralBias: args.neutral ?? 'neutral',
    signature,
    density: args.density ?? 'comfortable',
    displayFont: 'pretendard',
    chart: 'accent-sequential',
    tone: args.tone ?? 'terse',
  }
  createTheme(identity) // 대비·의미 색 규칙 — 실패하면 여기서 던진다
  const issues = checkRegistry([...registry.services, { id, name, hue, signature }]).filter((i) => i.a === id || i.b === id)
  const clash = issues.find((i) => i.level === 'error')
  if (clash) throw new Error(`${clash.message}. 예: --hue ${suggestHue(siblingHues)}`)
  const sameSig = issues.find((i) => i.level === 'warn')
  const port = Number(args.port ?? TEMPLATE_PORT + 3 + registry.services.length)
  const subtitle = args.subtitle ?? 'internal tool'

  // 복사 → 구조적 편집. 실패하면 디렉터리를 지우고 레지스트리는 건드리지 않는다
  mkdirSync(dir, { recursive: true })
  try {
    cpSync(TEMPLATE, dir, { recursive: true, filter: (src) => !/[\\/](node_modules|dist|playwright-report|test-results)$/.test(src) })
    if (inWorkspace) rmSync(join(dir, '.github'), { recursive: true, force: true }) // 중첩 워크플로는 GitHub가 무시한다
    editJson(join(dir, 'package.json'), (pkg) => {
      pkg.name = id
      pkg.description = `${name} — SE Web Toolkit으로 만든 내부 도구`
      if (!inWorkspace) for (const sec of ['dependencies', 'devDependencies']) for (const k of Object.keys(pkg[sec] ?? {})) if (pkg[sec][k] === 'workspace:*') pkg[sec][k] = '^0.1.0'
    })
    writeFileSync(join(dir, 'se.identity.json'), JSON.stringify({ $schema: 'node_modules/@se/tokens/identity.schema.json', ...identity }, null, 2) + '\n')
    editText(join(dir, 'index.html'), [[`<title>${TEMPLATE_NAME}</title>`, `<title>${name}</title>`]])
    editText(join(dir, 'vite.config.ts'), [[`port: ${TEMPLATE_PORT}`, `port: ${port}`]])
    editText(join(dir, 'playwright.config.ts'), [[`localhost:${TEMPLATE_PORT}`, `localhost:${port}`]])
    editText(join(dir, 'src', 'app', 'Shell.tsx'), [[`const SUBTITLE = 'internal tool'`, `const SUBTITLE = ${JSON.stringify(subtitle)}`]])
    for (const f of ['CLAUDE.md', 'README.md', 'docs/spec.md']) editText(join(dir, f), [[`# ${TEMPLATE_NAME}`, `# ${name}`]])
    editText(join(dir, 'README.md'), [[`localhost:${TEMPLATE_PORT}`, `localhost:${port}`], ['`status-strip` · hue 205°', `\`${signature}\` · hue ${hue}°`]])
  } catch (e) {
    rmSync(dir, { recursive: true, force: true })
    throw e
  }
  if (inWorkspace && registryPath) {
    registry.services.push({ id, name, hue, signature, neutralBias: identity.neutralBias, path: relative(workspace, dir) })
    writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n')
  }

  log(`✓ ${name} 생성 → ${dir}`)
  log(`  아이덴티티: hue ${hue}°${args.hue === undefined ? '(의미 색·형제와 가장 먼 값)' : ''} · ${signature} · ${identity.neutralBias} · ${identity.density} · ${identity.tone}${sameSig ? `\n  ! ${sameSig.message} (--signature)` : ''}`)
  if (!inWorkspace) log(`  ! 워크스페이스 밖 — @se/* 는 아직 npm 에 배포되지 않아 pnpm install 이 실패합니다. 지금은 툴킷 모노레포의 examples/ 에 만드십시오`)
  log(`\n다음:\n  ${inWorkspace ? `pnpm install   # 워크스페이스에 링크\n  pnpm --filter ${id} dev` : `cd ${dir}\n  pnpm install && pnpm dev`}   # http://localhost:${port}\n  Claude Code에서 /se:identity → /se:spec → /se:page 로 첫 화면을 만드십시오.`)
  return { dir, identity, port, inWorkspace }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main()
  } catch (e) {
    console.error('✗', e.message)
    process.exit(1)
  }
}
