/** @type {Array<{ test: (s: string) => boolean; alt: string }>} */
const BLOCKED = [
  { test: (s) => s.startsWith('@radix-ui/'), alt: '@se/ui' },
  { test: (s) => s === 'cmdk', alt: '@se/ui (CommandPalette · Combobox)' },
  { test: (s) => s === 'sonner', alt: '@se/ui (toast · Toaster)' },
  { test: (s) => s === 'recharts', alt: '@se/charts' },
  { test: (s) => s === '@tanstack/react-table', alt: '@se/ui (DataTable)' },
  { test: (s) => s === '@tanstack/react-virtual', alt: '@se/ui (LogViewer)' },
]

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: { description: '기반 라이브러리(@radix-ui, cmdk, sonner, recharts …)를 앱에서 직접 import 하지 않는다 — 항상 @se/ui·@se/charts를 거친다' },
    schema: [],
    messages: { blocked: '"{{source}}"를 직접 쓰지 마십시오 → {{alt}}. 래퍼를 거쳐야 토큰·밀도·다크 모드가 붙습니다.' },
  },
  create(ctx) {
    const report = (sourceNode) => {
      const s = sourceNode?.value
      if (typeof s !== 'string') return
      const b = BLOCKED.find((x) => x.test(s))
      if (b) ctx.report({ node: sourceNode, messageId: 'blocked', data: { source: s, alt: b.alt } })
    }
    return {
      ImportDeclaration: (n) => report(n.source),
      ExportNamedDeclaration: (n) => n.source && report(n.source),
      ExportAllDeclaration: (n) => report(n.source),
      ImportExpression: (n) => report(n.source),
      CallExpression(n) {
        if (n.callee.type === 'Identifier' && n.callee.name === 'require') report(n.arguments[0])
      },
    }
  },
}
