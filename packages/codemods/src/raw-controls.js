// raw <button> <input> <textarea> → @se/ui Button · Input · Textarea. <select>·<table> 는 데이터 모델이 필요해 TODO 만.
import { addTodo, attr, ensureImport, renameElement, rewriteClasses, str as strAttr } from './lib.js'

const TEXT_INPUT = new Set([undefined, 'text', 'search', 'email', 'number', 'password', 'url', 'tel'])

export default function transform(file, api) {
  const j = api.jscodeshift
  const root = j(file.source)
  const need = new Set()
  let changed = 0

  const rename = (path, to) => { renameElement(j, path, to, need); changed++ }

  root.find(j.JSXElement).forEach((p) => {
    const open = p.node.openingElement
    if (open.name.type !== 'JSXIdentifier') return
    const tag = open.name.name
    if (tag === 'button') {
      // 색 판정은 팔레트 변환과 같은 표로 — bg-blue-600 도 bg-violet-600 도 같은 결과
      const cls = rewriteClasses(strAttr(open, 'className') ?? '').text
      const isPrimary = strAttr(open, 'type') === 'submit' || /(?:^|\s)bg-(accent|info|primary)(?=\s|$)/.test(cls)
      const isDanger = /(?:^|\s)(bg|text)-danger(?=\s|$)/.test(cls)
      rename(p, 'Button')
      if (!attr(open, 'variant')) open.attributes.unshift(j.jsxAttribute(j.jsxIdentifier('variant'), j.stringLiteral(isDanger ? 'danger' : isPrimary ? 'primary' : 'secondary')))
      // 팔레트 색은 Button 이 정한다 — 색 클래스는 떼어낸다
      const c = attr(open, 'className')
      if (c && c.value && c.value.type === 'StringLiteral') {
        const kept = c.value.value.split(/\s+/).filter((k) => !/^(hover:|focus:|active:)?(bg|text|border|px|py|p|pt|pb|pl|pr|font|rounded|shadow|h|w)(-|$)/.test(k)).join(' ')
        if (kept) c.value.value = kept
        else open.attributes = open.attributes.filter((a) => a !== c)
      }
    } else if (tag === 'input') {
      const type = strAttr(open, 'type')
      if (TEXT_INPUT.has(type)) rename(p, 'Input')
      else if (type === 'checkbox') { rename(p, 'Checkbox'); addTodo(j, p, 'checkbox → Checkbox: checked/onCheckedChange 로, 라벨은 CheckboxField') }
      else if (type === 'radio') addTodo(j, p, 'radio → RadioGroup/RadioGroupItem 로 묶어서')
    } else if (tag === 'textarea') {
      rename(p, 'Textarea')
    } else if (tag === 'select') {
      const opts = p.node.children.filter((c) => c.type === 'JSXElement' && c.openingElement.name.name === 'option')
      const literal = opts.length && opts.every((o) => strAttr(o.openingElement, 'value') !== undefined && o.children.length === 1 && o.children[0].type === 'JSXText')
      if (literal) {
        const arr = j.arrayExpression(opts.map((o) => j.objectExpression([
          j.property('init', j.identifier('value'), j.stringLiteral(strAttr(o.openingElement, 'value'))),
          j.property('init', j.identifier('label'), j.stringLiteral(o.children[0].value.trim())),
        ])))
        open.attributes.push(j.jsxAttribute(j.jsxIdentifier('options'), j.jsxExpressionContainer(arr)))
        p.node.children = []
        open.selfClosing = true
        p.node.closingElement = null
        rename(p, 'Select')
      } else {
        addTodo(j, p, 'select → Select(options=[{value,label}]) 또는 항목이 많으면 Combobox')
      }
    } else if (tag === 'table') {
      addTodo(j, p, 'table → 데이터면 DataTable(3상태), 정적이면 Table 프리미티브')
      changed++
    }
  })

  if (need.size) ensureImport(j, root, [...need])
  return changed ? root.toSource() : null
}
