// @mui/material → @se/ui. 매핑표에 있는 것만 바꾸고, 나머지 import 는 남기고 TODO.
import { TONE, addTodo, attr, collectLocalNames, drop, ensureImport, pruneImports, renameAttr, renameElement, str } from './lib.js'

// MUI 이름 → [se 이름, prop 변환]
const MAP = {
  Button: ['Button', (j, open) => {
    let variant = 'secondary'
    const v = str(open, 'variant'); const c = str(open, 'color')
    if (v === 'contained') variant = 'primary'
    if (v === 'text') variant = 'ghost'
    if (c === 'error') variant = 'danger'
    drop(open, ['variant', 'color', 'disableElevation', 'sx'])
    open.attributes.unshift(j.jsxAttribute(j.jsxIdentifier('variant'), j.stringLiteral(variant)))
  }],
  TextField: ['Input', (j, open, p) => { if (attr(open, 'label')) addTodo(j, p, 'TextField label → <label> 또는 FormLabel 로'); drop(open, ['variant', 'label', 'fullWidth', 'size', 'sx', 'helperText', 'margin']) }],
  Checkbox: ['Checkbox', (j, open) => { renameAttr(j, open, 'onChange', 'onCheckedChange'); drop(open, ['sx', 'color', 'size']) }],
  Switch: ['Switch', (j, open) => { renameAttr(j, open, 'onChange', 'onCheckedChange'); drop(open, ['sx', 'color', 'size']) }],
  Chip: ['Badge', (j, open) => { const c = str(open, 'color'); drop(open, ['size', 'variant', 'color', 'sx']); const tone = TONE[c]; if (tone) open.attributes.unshift(j.jsxAttribute(j.jsxIdentifier('tone'), j.stringLiteral(tone))); const l = attr(open, 'label'); if (l) { addTodo(j, open, 'Chip label → children 으로'); } }],
  Alert: ['Alert', (j, open, p) => { const s = str(open, 'severity'); drop(open, ['severity', 'sx']); open.attributes.unshift(j.jsxAttribute(j.jsxIdentifier('tone'), j.stringLiteral(TONE[s] ?? 'info'))); if (!attr(open, 'title')) addTodo(j, p, 'Alert 는 title 이 필수 — 첫 문장을 title 로') }],
  Dialog: ['Dialog', (j, open) => { drop(open, ['fullWidth', 'maxWidth', 'sx']) }],
  DialogTitle: ['DialogTitle', () => {}],
  DialogContent: ['DialogBody', () => {}],
  DialogContentText: ['DialogDescription', () => {}],
  DialogActions: ['DialogFooter', () => {}],
  Divider: ['Separator', () => {}],
  Tooltip: ['Tooltip', (j, open, p) => addTodo(j, p, 'Tooltip → TooltipTrigger asChild + TooltipContent 구조로')],
  Skeleton: ['Skeleton', (j, open) => drop(open, ['variant', 'width', 'height', 'animation', 'sx'])],
}
const TODO_ONLY = { Table: 'DataTable(3상태) 또는 Table 프리미티브', Snackbar: 'toast()', Drawer: 'Sheet', Select: 'Select(options) 또는 Combobox', Tabs: 'Tabs(items,value,onChange)', Autocomplete: 'Combobox', Menu: 'DropdownMenu', Card: '카드 남발 금지 — 필요하면 div.rounded-lg.border.border-line.bg-surface', Box: 'div + 토큰 클래스', Typography: '시맨틱 태그 + 타입 스케일 클래스', Grid: 'grid/flex + gap', Stack: 'flex + gap', Paper: 'div.bg-surface.border.border-line' }


export default function transform(file, api) {
  const j = api.jscodeshift
  const root = j(file.source)
  const imports = root.find(j.ImportDeclaration).filter((p) => /^@mui\/material(\/|$)/.test(p.node.source.value))
  if (!imports.size()) return null
  const local = collectLocalNames(imports) // 로컬 이름 → MUI 이름
  const need = new Set()
  root.find(j.JSXElement).forEach((p) => {
    const open = p.node.openingElement
    if (open.name.type !== 'JSXIdentifier') return
    const mui = local.get(open.name.name); if (!mui) return
    const m = MAP[mui]
    if (m) {
      const [to, fix] = m
      fix(j, open, p)
      renameElement(j, p, to, need)
    } else if (TODO_ONLY[mui]) addTodo(j, p, `MUI ${mui} → ${TODO_ONLY[mui]}`)
  })
  const leftover = pruneImports(j, imports, (name) => Boolean(MAP[name]))
  if (leftover.length) addTodo(j, root.find(j.Program).get('body', 0), `아직 MUI 인 것: ${leftover.join(', ')} — se-migrator 로`)
  ensureImport(j, root, [...need])
  return root.toSource()
}
