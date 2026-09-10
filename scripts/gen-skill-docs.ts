/**
 * @se/ui · @se/charts 의 TSDoc과 props를 읽어 플러그인 스킬 레퍼런스를 생성한다.
 *   pnpm gen:skill-docs          → plugin/skills/se-ui/references/components/*.md
 *   pnpm gen:skill-docs --check  → 커밋된 문서와 다르면 exit 1 (CI)
 * 손으로 쓴 patterns/·recipes/ 는 건드리지 않는다.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, rmSync } from 'node:fs'
import { join, resolve, relative } from 'node:path'
import { withCustomConfig } from 'react-docgen-typescript'

const root = resolve(import.meta.dirname, '..')
const OUT = join(root, 'plugin/skills/se-ui/references/components')
const check = process.argv.includes('--check')

const SOURCES: Array<{ pkg: string; index: string; dir: string; group: string; prefix: string }> = [
  { pkg: '@se/ui', index: 'packages/ui/src/index.ts', dir: 'packages/ui/src/components', group: '컴포넌트', prefix: '' },
  { pkg: '@se/ui', index: 'packages/ui/src/index.ts', dir: 'packages/ui/src/patterns', group: '패턴', prefix: '' },
  { pkg: '@se/ui', index: 'packages/ui/src/index.ts', dir: 'packages/ui/src/signatures', group: '시그니처', prefix: '' },
  { pkg: '@se/charts', index: 'packages/charts/src/index.ts', dir: 'packages/charts/src', group: '차트', prefix: 'charts-' },
]

/** 패키지 index.ts가 내보내는 이름만 문서화한다 — 내부 헬퍼(ChartTooltip 등)는 스킬에 노출하지 않는다 */
function exportedNames(indexFile: string): Set<string> {
  const text = readFileSync(join(root, indexFile), 'utf8')
  const names = new Set<string>()
  for (const m of text.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const part of m[1]!.split(',')) {
      const name = part.replace(/\btype\b/, '').trim().split(/\s+as\s+/).pop()?.trim()
      if (name) names.add(name)
    }
  }
  return names
}

const parser = withCustomConfig(join(root, 'packages/ui/tsconfig.json'), {
  savePropValueAsString: true,
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  propFilter: (prop) => {
    if (prop.parent?.fileName.includes('node_modules')) return false // React/Radix 기본 props 제외
    return true
  },
})

function md(s: string) {
  return s.replace(/\|/g, '\\|').replace(/\n+/g, ' ').trim()
}

let changed = 0
const generated = new Set<string>()
const index: string[] = []

for (const src of SOURCES) {
  const dir = join(root, src.dir)
  if (!existsSync(dir)) continue
  const exported = exportedNames(src.index)
  for (const file of readdirSync(dir).filter((f) => /\.tsx?$/.test(f)).sort()) {
    const base = src.prefix + file.replace(/\.tsx?$/, '')
    const full = join(dir, file)
    const docs = parser.parse(full).filter((d) => /^[A-Z]/.test(d.displayName) && exported.has(d.displayName))
    if (!docs.length) continue
    const text = readFileSync(full, 'utf8')
    // 파일 맨 앞의 블록 주석만 "파일 의도"로 본다 (import 앞). prop JSDoc이 잡히지 않게
    const head = text.trimStart().startsWith('/**') ? (text.match(/^\s*\/\*\*([\s\S]*?)\*\//)?.[1]?.replace(/^\s*\*\s?/gm, '').trim() ?? '') : ''
    const lines: string[] = [`# ${docs.map((d) => d.displayName).join(' · ')}`, '', `\`import { ${docs.map((d) => d.displayName).join(', ')} } from '${src.pkg}'\` — ${src.group} · \`${relative(root, full)}\``, '']
    if (head) lines.push(head, '')
    for (const d of docs) {
      const props = Object.values(d.props)
      if (docs.length > 1) lines.push(`## ${d.displayName}`, '')
      if (d.description) lines.push(d.description, '')
      if (!props.length) {
        lines.push('_props 없음 (HTML 속성 그대로)_', '')
        continue
      }
      lines.push('| prop | 타입 | 기본 | 설명 |', '|---|---|---|---|')
      for (const p of props.sort((a, b) => Number(!a.required) - Number(!b.required) || a.name.localeCompare(b.name))) {
        const type = p.type.name.length > 90 ? p.type.name.slice(0, 87) + '…' : p.type.name
        lines.push(`| \`${p.name}\`${p.required ? ' **필수**' : ''} | \`${md(type)}\` | ${p.defaultValue ? `\`${md(String(p.defaultValue.value))}\`` : ''} | ${md(p.description)} |`)
      }
      lines.push('')
    }
    const out = join(OUT, `${base}.md`)
    const body = lines.join('\n')
    generated.add(`${base}.md`)
    const summary = (docs[0]!.description || head).split('\n')[0]!.slice(0, 90)
    index.push(`- [${docs.map((d) => d.displayName).join(' · ')}](components/${base}.md) — ${src.group}${summary ? ' · ' + summary : ''}`)
    if (check) {
      if (!existsSync(out) || readFileSync(out, 'utf8') !== body) {
        console.error(`✗ 문서가 코드와 다릅니다: ${relative(root, out)}`)
        changed++
      }
    } else {
      mkdirSync(OUT, { recursive: true })
      writeFileSync(out, body)
    }
  }
}

/** 스킬이 "복사해서 변형하라"고 가리키는 원본 — 플러그인이 툴킷 저장소 없이도 자급자족하도록 동봉한다 */
const EXAMPLES: Array<[string, string]> = [
  ['examples/reference-app/src/pages/jobs/JobsPage.tsx', 'reference-app/JobsPage.tsx'],
  ['examples/reference-app/src/pages/jobs/JobDetailSheet.tsx', 'reference-app/JobDetailSheet.tsx'],
  ['examples/reference-app/src/pages/overview/OverviewPage.tsx', 'reference-app/OverviewPage.tsx'],
  ['examples/reference-app/src/app/Shell.tsx', 'reference-app/Shell.tsx'],
  ['examples/reference-app/src/mocks/handlers.ts', 'reference-app/mocks-handlers.ts'],
  ['examples/reference-app/src/api/jobs.ts', 'reference-app/api-jobs.ts'],
  ['examples/dataset-explorer/src/pages/datasets/DatasetsPage.tsx', 'dataset-explorer/DatasetsPage.tsx'],
  ['examples/dataset-explorer/src/pages/datasets/DatasetPage.tsx', 'dataset-explorer/DatasetPage.tsx'],
  ['examples/release-desk/src/pages/releases/ReleasesPage.tsx', 'release-desk/ReleasesPage.tsx'],
  ['examples/release-desk/src/pages/releases/ReleasePage.tsx', 'release-desk/ReleasePage.tsx'],
  ['examples/release-desk/src/pages/releases/NewReleasePage.tsx', 'release-desk/NewReleasePage.tsx'],
  ['examples/release-desk/src/pages/releases/DecisionDialog.tsx', 'release-desk/DecisionDialog.tsx'],
  ['examples/release-desk/src/pages/releases/bits.tsx', 'release-desk/bits.tsx'],
  ['examples/release-desk/src/pages/settings/SettingsPage.tsx', 'release-desk/SettingsPage.tsx'],
]
const EX_OUT = join(OUT, '..', 'examples')
for (const [src, dst] of EXAMPLES) {
  const from = join(root, src)
  const to = join(EX_OUT, dst)
  const body = `// 원본: ${src} (자동 복사 — 수정하지 말 것, pnpm gen:skill-docs)\n` + readFileSync(from, 'utf8')
  if (check) {
    if (!existsSync(to) || readFileSync(to, 'utf8') !== body) {
      console.error(`✗ 예제 동봉본이 코드와 다릅니다: ${relative(root, to)}`)
      changed++
    }
  } else {
    mkdirSync(join(to, '..'), { recursive: true })
    writeFileSync(to, body)
  }
}

// 사라진 컴포넌트의 문서 제거 + 인덱스
if (!check) {
  for (const f of readdirSync(OUT)) if (!generated.has(f)) rmSync(join(OUT, f))
  const exportedCount = index.reduce((n, line) => n + (line.match(/^- \[(.+?)\]/)?.[1]?.split(' · ').length ?? 0), 0)
  writeFileSync(join(OUT, '..', 'INDEX.md'), `# 컴포넌트 레퍼런스 (자동 생성 — 수정하지 말 것, \`pnpm gen:skill-docs\`)\n\n파일 ${index.length}개 · 내보내는 컴포넌트 ${exportedCount}개\n\n${index.join('\n')}\n`)
  console.log(`✓ ${generated.size}개 문서 + 예제 ${EXAMPLES.length}개 → ${relative(root, join(OUT, '..'))}`)
} else {
  const idx = join(OUT, '..', 'INDEX.md')
  if (!existsSync(idx)) changed++
  if (changed) {
    console.error(`\n${changed}개 불일치. \`pnpm gen:skill-docs\` 를 실행해 커밋하십시오.`)
    process.exit(1)
  }
  console.log('✓ 스킬 문서가 코드와 일치합니다')
}
