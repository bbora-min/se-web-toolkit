/** JSX 요소 이름을 문자열로 (MemberExpression은 "a.b") */
export function jsxName(node) {
  if (!node) return ''
  if (node.type === 'JSXIdentifier') return node.name
  if (node.type === 'JSXMemberExpression') return `${jsxName(node.object)}.${node.property.name}`
  return ''
}

/**
 * 노드에서 정적 문자열들을 모은다 — Literal, TemplateLiteral의 quasis, 배열·조건식, 그리고
 * `isCall(node)`가 true인 호출(cn/clsx 등)의 인자. 그 밖의 호출은 들어가지 않는다.
 */
export function collectStrings(node, out = [], isCall = (/** @type {any} */ _n) => true) {
  if (!node) return out
  const rec = (n) => collectStrings(n, out, isCall)
  switch (node.type) {
    case 'Literal':
      if (typeof node.value === 'string') out.push({ text: node.value, node })
      break
    case 'TemplateLiteral':
      for (const q of node.quasis) if (q.value.cooked) out.push({ text: q.value.cooked, node: q })
      for (const e of node.expressions) rec(e)
      break
    case 'JSXExpressionContainer':
      rec(node.expression)
      break
    case 'CallExpression':
      if (isCall(node)) for (const a of node.arguments) rec(a)
      break
    case 'ArrayExpression':
      for (const e of node.elements) rec(e)
      break
    case 'ConditionalExpression':
      rec(node.consequent)
      rec(node.alternate)
      break
    case 'LogicalExpression':
      rec(node.right)
      break
    case 'ObjectExpression':
      // cn({ 'bg-red-500': active }) — 키가 클래스
      for (const p of node.properties) if (p.type === 'Property') rec(p.key)
      break
  }
  return out
}

/**
 * JSX 속성 값이 가질 수 있는 정적 문자열들.
 *   variant="primary" → ['primary'],  variant={'primary'} → ['primary'],
 *   variant={ok ? 'primary' : 'ghost'} → ['primary','ghost'],  variant={x} → []
 */
export function attrStrings(attr) {
  const v = attr?.value
  if (!v) return []
  const out = []
  const walk = (n) => {
    if (!n) return
    if (n.type === 'Literal' && typeof n.value === 'string') out.push(n.value)
    else if (n.type === 'TemplateLiteral' && n.expressions.length === 0) out.push(n.quasis[0]?.value.cooked ?? '')
    else if (n.type === 'JSXExpressionContainer') walk(n.expression)
    else if (n.type === 'ConditionalExpression') { walk(n.consequent); walk(n.alternate) }
    else if (n.type === 'LogicalExpression') { walk(n.left); walk(n.right) }
  }
  walk(v)
  return out
}
