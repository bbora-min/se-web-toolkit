import { attrStrings, jsxName } from '../util.js'

/**
 * 두 primary가 "동시에 보일 수 있는가".
 * 같은 ConditionalExpression의 consequent/alternate에 갈라져 있으면 서로 배타적이다 (a ? <A/> : <B/>).
 * 각 노드에서 조상 ConditionalExpression마다 어느 가지에 있는지 기록해 비교한다.
 */
function branchMap(node) {
  const map = new Map()
  let child = node
  let p = node.parent
  while (p) {
    if (p.type === 'ConditionalExpression' && (p.consequent === child || p.alternate === child)) map.set(p, p.consequent === child ? 'c' : 'a')
    child = p
    p = p.parent
  }
  return map
}
function exclusive(a, b) {
  for (const [cond, side] of a) {
    const other = b.get(cond)
    if (other && other !== side) return true
  }
  return false
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'suggestion',
    docs: { description: '한 파일(화면)에 동시에 보이는 variant="primary" Button은 하나. 삼항의 양쪽 가지처럼 배타적인 것은 하나로 센다' },
    schema: [{ type: 'object', properties: { max: { type: 'integer', minimum: 1 } }, additionalProperties: false }],
    messages: { many: '이 primary 버튼은 같은 화면의 다른 primary({{other}}행)와 동시에 보입니다. 주 액션은 하나 — 나머지는 secondary/ghost로.' },
  },
  create(ctx) {
    const max = ctx.options[0]?.max ?? 1
    const found = []
    return {
      JSXOpeningElement(node) {
        if (jsxName(node.name) !== 'Button') return
        const values = attrStrings(node.attributes.find((a) => a.type === 'JSXAttribute' && a.name.name === 'variant'))
        if (values.includes('primary')) found.push({ node, branches: branchMap(node) })
      },
      'Program:exit'() {
        if (found.length <= max) return
        // 각 primary에 대해 "동시에 보일 수 있는" 다른 primary 수를 센다
        for (let i = 0; i < found.length; i++) {
          const visible = found.filter((o, j) => j !== i && !exclusive(found[i].branches, o.branches))
          if (visible.length >= max) {
            ctx.report({ node: found[i].node, messageId: 'many', data: { other: visible.map((o) => o.node.loc.start.line).join(', ') } })
          }
        }
      },
    }
  },
}
