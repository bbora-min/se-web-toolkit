// Tailwind 기본 팔레트(bg-blue-600 …) → 토큰 클래스(bg-accent …). className 문자열·템플릿·cn()/clsx() 인자 안에서.
import { CLASS_HELPERS as HELPERS, addTodo, rewriteClasses } from './lib.js'

export default function transform(file, api) {
  const j = api.jscodeshift
  const root = j(file.source)
  let changed = 0
  const left = new Set()

  const visit = (path) => {
    const node = path.node
    if (node.type === 'StringLiteral' || node.type === 'Literal') {
      if (typeof node.value !== 'string') return
      const r = rewriteClasses(node.value)
      r.left.forEach((l) => left.add(l))
      if (r.text !== node.value) { node.value = r.text; changed++ }
    } else if (node.type === 'TemplateLiteral') {
      for (const q of node.quasis) {
        const r = rewriteClasses(q.value.raw)
        r.left.forEach((l) => left.add(l))
        if (r.text !== q.value.raw) { q.value.raw = r.text; q.value.cooked = r.text; changed++ }
      }
    }
  }

  // className="…" / className={…}
  root.find(j.JSXAttribute, { name: { name: (n) => n === 'className' || n === 'class' } }).forEach((p) => {
    const v = p.node.value
    if (!v) return
    if (v.type === 'StringLiteral' || v.type === 'Literal') visit(p.get('value'))
    else if (v.type === 'JSXExpressionContainer') j(p.get('value', 'expression')).find(j.Node).forEach((q) => visit(q))
  })
  // cn('…', cond && '…') 등 클래스 헬퍼
  root.find(j.CallExpression, { callee: { type: 'Identifier' } }).filter((p) => HELPERS.has(p.node.callee.name)).forEach((p) => {
    j(p.get('arguments')).find(j.Node).forEach((q) => visit(q))
  })

  if (left.size) {
    const first = root.find(j.Program).get('body', 0)
    addTodo(j, first, `토큰으로 못 옮긴 색: ${[...left].slice(0, 6).join(' ')}${left.size > 6 ? ' …' : ''} — tokens.md 를 보고 직접`)
    changed++
  }
  return changed ? root.toSource() : null
}
