import { jsxName } from '../util.js'

/** 파일이 원격 데이터를 다루는가 — 이 신호가 있으면 loading·error까지 요구한다. 정적 표는 empty만 */
const QUERY_SIGNAL = /\b(?:isPending|isLoading|isError|isFetching|useQuery|useInfiniteQuery|useSWR)\b/

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'suggestion',
    docs: { description: 'DataTable에는 empty 상태가, 원격 데이터를 그리는 표에는 loading·error까지 있어야 한다' },
    schema: [],
    messages: { missing: 'DataTable에 {{missing}} 상태가 없습니다. 목록은 빈 상태(다음 행동)를, 원격 데이터면 로딩(스켈레톤)·에러(원인+재시도)까지 가집니다.' },
  },
  create(ctx) {
    const remote = QUERY_SIGNAL.test(ctx.sourceCode.text)
    const REQUIRED = remote ? ['loading', 'error', 'empty'] : ['empty']
    return {
      JSXOpeningElement(node) {
        if (jsxName(node.name) !== 'DataTable') return
        const attrs = new Set()
        for (const a of node.attributes) {
          if (a.type === 'JSXAttribute') attrs.add(a.name.name)
          else if (a.argument.type === 'ObjectExpression') {
            // <DataTable {...{ columns, data, loading }} /> — 인라인 객체는 키를 볼 수 있다
            for (const p of a.argument.properties) if (p.type === 'Property' && p.key.type === 'Identifier') attrs.add(p.key.name)
          } else return // {...props} 처럼 정적으로 알 수 없으면 판단하지 않는다
        }
        const missing = REQUIRED.filter((r) => !attrs.has(r))
        if (missing.length) ctx.report({ node, messageId: 'missing', data: { missing: missing.join(' · ') } })
      },
    }
  },
}
