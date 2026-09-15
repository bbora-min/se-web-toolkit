// 변환 공용 — import 보장, TODO 주석, 팔레트 → 토큰 매핑
const TODO = 'TODO(se-adopt)'

/** `import { name } from '@se/ui'` 가 없으면 넣는다 (있으면 지정자만 추가) */
export function ensureImport(j, root, names, source = '@se/ui') {
  const want = [...new Set(names)].filter(Boolean)
  if (!want.length) return
  const decl = root.find(j.ImportDeclaration, { source: { value: source } })
  if (decl.size()) {
    const node = decl.get().node
    const have = new Set(node.specifiers.filter((s) => s.type === 'ImportSpecifier').map((s) => s.imported.name))
    for (const n of want) if (!have.has(n)) node.specifiers.push(j.importSpecifier(j.identifier(n)))
    return
  }
  const imp = j.importDeclaration(want.map((n) => j.importSpecifier(j.identifier(n))), j.literal(source))
  const first = root.find(j.ImportDeclaration)
  if (first.size()) first.at(-1).insertAfter(imp)
  else root.get().node.program.body.unshift(imp)
}

/** 노드 앞에 TODO(se-adopt) 주석 (같은 문구는 한 번만) */
export function addTodo(j, path, why) {
  const text = ` ${TODO}: ${why} `
  let target = path
  while (target && !/Statement|Declaration$/.test(target.node.type)) target = target.parent
  const node = (target ?? path).node
  node.comments = node.comments ?? []
  if (node.comments.some((c) => c.value === text)) return
  node.comments.push(j.commentBlock(text, true, false))
}

const HUE = {
  red: 'danger', rose: 'danger',
  green: 'success', emerald: 'success', lime: 'success', teal: 'success',
  amber: 'warning', yellow: 'warning', orange: 'warning',
  blue: 'info', sky: 'info', cyan: 'info',
  indigo: 'accent', violet: 'accent', purple: 'accent', fuchsia: 'accent', pink: 'accent',
}
const GRAY = new Set(['slate', 'gray', 'zinc', 'neutral', 'stone'])
// 팔레트·유틸 목록은 @se/eslint-plugin 의 no-raw-color 와 같아야 한다 (test 가 대조한다)
export const TW_PALETTE = 'red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone'
export const COLOR_UTILS = 'bg|text|border|border-[xytrbl]|ring|ring-offset|inset-ring|outline|placeholder|fill|stroke|from|to|via|decoration|divide|shadow|accent|caret'
export const CLASS_HELPERS = new Set(['cn', 'clsx', 'cva', 'twMerge', 'tv', 'classnames'])
export const PALETTE_RE = new RegExp(`(?:^|(?<=\\s))((?:[a-z-]+:)*)(${COLOR_UTILS})-(${TW_PALETTE})-(\\d{2,3})(?=\\s|$)`, 'g')

/**
 * Tailwind 기본 팔레트 클래스 하나 → 토큰 클래스. 못 정하면 null.
 *   회색: 배경은 표면, 글자는 잉크/보조, 테두리는 라인. 의미 색: 진하면 글자·배경, 옅으면 -soft.
 *   보라·남색 계열은 보통 브랜드 색으로 쓰이므로 accent 로.
 */
export function mapPalette(util, palette, shade) {
  const s = Number(shade)
  const u = util.startsWith('border') ? 'border' : util
  if (GRAY.has(palette)) {
    if (u === 'bg') return s <= 50 ? 'bg-canvas' : s <= 200 ? 'bg-surface-2' : s >= 800 ? 'bg-ink' : null
    if (u === 'text') return s <= 300 ? 'text-muted' : s <= 600 ? 'text-muted' : 'text-ink'
    if (u === 'border' || u === 'divide' || u === 'ring' || u === 'outline') return s <= 200 ? `${util}-line` : `${util}-line-strong`
    if (u === 'placeholder') return 'placeholder-muted'
    if (u === 'fill' || u === 'stroke') return s <= 300 ? `${util}-line-strong` : `${util}-muted`
    return null
  }
  const tone = HUE[palette]
  if (!tone) return null
  if (u === 'bg') return s <= 100 ? `bg-${tone}-soft` : s >= 400 ? `bg-${tone}` : null
  if (u === 'text') return tone === 'accent' ? 'text-accent-fg' : `text-${tone}`
  if (u === 'border' || u === 'ring' || u === 'divide' || u === 'outline') return `${util}-${tone}`
  if (u === 'fill' || u === 'stroke') return `${util}-${tone}`
  return null
}

/** 문자열 안의 팔레트 클래스를 바꾼다. 못 바꾼 것은 그대로 두고 목록으로 돌려준다 */
export function rewriteClasses(text) {
  const left = []
  const out = text.replace(PALETTE_RE, (m, variants, util, palette, shade) => {
    const t = mapPalette(util, palette, shade)
    if (!t) { left.push(m); return m }
    return `${variants}${t}`
  })
  // 액센트 배경 위 흰 글자 → on-accent, 의미 색 배경 위 흰 글자 → on-<tone>
  const bgTone = /(?:^|\s)bg-(accent|danger|warning|success|info)(?=\s|$)/.exec(out)?.[1]
  const out2 = bgTone ? out.replace(/(?:^|(?<=\s))text-white(?=\s|$)/g, bgTone === 'accent' ? 'text-on-accent' : `text-on-${bgTone}`) : out
  return { text: out2, left }
}

// 주의: recast 는 바꾼 노드를 다시 찍을 때 큰따옴표를 쓴다(원래 따옴표는 유지 못 함). 실행 뒤 프로젝트 포매터를 돌린다
export const todoTag = TODO
export const TODO_RE = /TODO\(se-adopt\)/g

// ---- JSX 속성 헬퍼 (모든 변환이 공유)
export const attr = (open, n) => open.attributes.find((a) => a.type === 'JSXAttribute' && a.name.name === n)
export const str = (open, n) => { const a = attr(open, n); return a && a.value && (a.value.type === 'StringLiteral' || a.value.type === 'Literal') ? a.value.value : undefined }
export const has = (open, n) => Boolean(attr(open, n))
export const drop = (open, names) => { open.attributes = open.attributes.filter((a) => !(a.type === 'JSXAttribute' && names.includes(a.name.name))) }
export const renameAttr = (j, open, from, to) => { const a = attr(open, from); if (a) a.name = j.jsxIdentifier(to) }
/** 여는·닫는 태그 이름을 함께 바꾸고 import 필요 목록에 넣는다 */
export function renameElement(j, path, to, need) {
  path.node.openingElement.name = j.jsxIdentifier(to)
  if (path.node.closingElement) path.node.closingElement.name = j.jsxIdentifier(to)
  need?.add(to)
}
/** 심각도 → 의미 톤 (MUI severity/color, antd type/color 공통) */
export const TONE = { error: 'danger', warning: 'warning', success: 'success', info: 'info', primary: 'accent' }

/** 라이브러리 import 의 로컬 이름 → 라이브러리 이름 (default import 는 경로 마지막 조각) */
export function collectLocalNames(imports) {
  const local = new Map()
  imports.forEach((p) => {
    const src = p.node.source.value
    for (const s of p.node.specifiers) {
      if (s.type === 'ImportSpecifier') local.set(s.local.name, s.imported.name)
      else if (s.type === 'ImportDefaultSpecifier') local.set(s.local.name, src.split('/').pop())
    }
  })
  return local
}
/** 바꾼 이름은 import 에서 빼고, 남은 게 없으면 import 삭제. 남은 이름을 돌려준다 */
export function pruneImports(j, imports, isConverted) {
  const leftover = []
  imports.forEach((p) => {
    const src = p.node.source.value
    p.node.specifiers = p.node.specifiers.filter((s) => {
      const name = s.type === 'ImportSpecifier' ? s.imported.name : src.split('/').pop()
      if (isConverted(name)) return false
      leftover.push(name); return true
    })
    if (!p.node.specifiers.length) j(p).remove()
  })
  return [...new Set(leftover)]
}
