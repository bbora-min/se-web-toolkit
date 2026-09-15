// antd → @se/ui. Button·Input·Tag·Alert·Switch·Checkbox·message 는 바꾸고, Table·Modal·Form 은 TODO.
import { TONE, addTodo, attr, collectLocalNames, drop, ensureImport, has, pruneImports, renameAttr, renameElement, str } from './lib.js'

// antd 고유 색 이름 → 톤 (공통 심각도 이름은 TONE)
const ANTD_TONE = { ...TONE, red: 'danger', volcano: 'danger', orange: 'warning', gold: 'warning', green: 'success', blue: 'info', geekblue: 'info', purple: 'accent', processing: 'info' }

const MAP = {
  Button: ['Button', (j, open) => {
    const t = str(open, 'type')
    let variant = t === 'primary' ? 'primary' : t === 'link' || t === 'text' ? 'ghost' : 'secondary'
    if (has(open, 'danger')) variant = 'danger'
    drop(open, ['type', 'danger', 'ghost', 'shape', 'block'])
    const size = str(open, 'size'); drop(open, ['size'])
    open.attributes.unshift(j.jsxAttribute(j.jsxIdentifier('variant'), j.stringLiteral(variant)))
    if (size === 'small') open.attributes.push(j.jsxAttribute(j.jsxIdentifier('size'), j.stringLiteral('sm')))
    if (size === 'large') open.attributes.push(j.jsxAttribute(j.jsxIdentifier('size'), j.stringLiteral('lg')))
  }],
  Input: ['Input', (j, open) => drop(open, ['allowClear', 'size', 'bordered'])],
  Tag: ['Badge', (j, open) => { const c = str(open, 'color'); drop(open, ['color', 'bordered']); const tone = { red: 'danger', volcano: 'danger', orange: 'warning', gold: 'warning', green: 'success', blue: 'info', geekblue: 'info', purple: 'accent', error: 'danger', warning: 'warning', success: 'success', processing: 'info' }[c]; if (tone) open.attributes.unshift(j.jsxAttribute(j.jsxIdentifier('tone'), j.stringLiteral(tone))) }],
  Alert: ['Alert', (j, open, p) => { const t = str(open, 'type'); const msg = attr(open, 'message'); drop(open, ['type', 'showIcon', 'closable', 'banner']); if (msg) { msg.name = j.jsxIdentifier('title') } else addTodo(j, p, 'Alert 는 title 이 필수'); const d = attr(open, 'description'); if (d) addTodo(j, p, 'Alert description → children 으로'); open.attributes.unshift(j.jsxAttribute(j.jsxIdentifier('tone'), j.stringLiteral(TONE[t] ?? 'info'))) }],
  Switch: ['Switch', (j, open) => { renameAttr(j, open, 'onChange', 'onCheckedChange'); drop(open, ['size', 'checkedChildren', 'unCheckedChildren']) }],
  Checkbox: ['Checkbox', (j, open) => renameAttr(j, open, 'onChange', 'onCheckedChange')],
  Divider: ['Separator', (j, open) => drop(open, ['orientation', 'dashed', 'plain'])],
  Tooltip: ['Tooltip', (j, open, p) => addTodo(j, p, 'Tooltip title → TooltipTrigger asChild + TooltipContent 구조로')],
  Skeleton: ['Skeleton', (j, open) => drop(open, ['active', 'paragraph', 'title'])],
}
const TODO_ONLY = { Table: 'DataTable(columns/data, 3상태)', Modal: 'Dialog 또는 ConfirmDialog', Drawer: 'Sheet', Select: 'Select(options) 또는 Combobox', Tabs: 'Tabs(items,value,onChange)', Form: 'Form(react-hook-form + zod)', Card: '카드 남발 금지 — div.rounded-lg.border.border-line.bg-surface', Space: 'flex + gap', Row: 'grid/flex', Col: 'grid/flex', Typography: '시맨틱 태그 + 타입 스케일', Spin: 'Skeleton(형태 유지)', Badge: 'Badge 또는 StatusBadge', Dropdown: 'DropdownMenu', Popover: 'Popover', DatePicker: 'DateRangePicker', Pagination: 'DataTable 내장', Breadcrumb: 'PageHeader description 또는 뒤로 링크', Empty: 'EmptyState(다음 행동 버튼)', Result: 'ErrorState/EmptyState', notification: 'toast()' }

export default function transform(file, api) {
  const j = api.jscodeshift
  const root = j(file.source)
  const imports = root.find(j.ImportDeclaration).filter((p) => /^antd(\/|$)/.test(p.node.source.value))
  if (!imports.size()) return null
  const local = collectLocalNames(imports)
  const need = new Set()

  root.find(j.JSXElement).forEach((p) => {
    const open = p.node.openingElement
    let name = null
    if (open.name.type === 'JSXIdentifier') name = local.get(open.name.name)
    else if (open.name.type === 'JSXMemberExpression' && open.name.object.type === 'JSXIdentifier' && local.get(open.name.object.name) === 'Input' && open.name.property.name === 'TextArea') {
      renameElement(j, p, 'Textarea', need); return
    }
    if (!name) return
    const m = MAP[name]
    if (m) { const [to, fix] = m; fix(j, open, p); renameElement(j, p, to, need) }
    else if (TODO_ONLY[name]) addTodo(j, p, `antd ${name} → ${TODO_ONLY[name]}`)
  })
  // message.success('…') → toast.success('…')
  const msgLocal = [...local.entries()].find(([, v]) => v === 'message')?.[0]
  if (msgLocal) {
    root.find(j.CallExpression, { callee: { type: 'MemberExpression', object: { name: msgLocal } } }).forEach((p) => {
      const prop = p.node.callee.property.name
      if (['success', 'error', 'warning', 'info'].includes(prop)) { p.node.callee.object = j.identifier('toast'); need.add('toast') }
      else addTodo(j, p, `message.${prop} → toast`)
    })
  }
  const leftover = pruneImports(j, imports, (name) => Boolean(MAP[name]) || name === 'message' || name === 'Input')
  if (leftover.length) addTodo(j, root.find(j.Program).get('body', 0), `아직 antd 인 것: ${leftover.join(', ')} — se-migrator 로`)
  ensureImport(j, root, [...need])
  return root.toSource()
}
