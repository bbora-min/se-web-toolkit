import { attrStrings, jsxName } from '../util.js'

const MAP = {
  button: 'Button',
  input: 'Input (검색은 SearchInput, 체크는 Checkbox, 스위치는 Switch)',
  select: 'Select (항목이 8개 넘으면 Combobox)',
  textarea: 'Textarea',
  table: 'DataTable (정적 표는 Table 프리미티브)',
  dialog: 'Dialog / ConfirmDialog',
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: { description: '폼 컨트롤·표·다이얼로그는 @se/ui 컴포넌트로. raw HTML 컨트롤 금지' },
    schema: [{ type: 'object', properties: { allow: { type: 'array', items: { type: 'string' } } }, additionalProperties: false }],
    messages: { raw: '<{{tag}}> 대신 @se/ui의 {{alt}}을(를) 쓰십시오. 형태·상태·접근성이 거기서 통일됩니다.' },
  },
  create(ctx) {
    const allow = new Set(ctx.options[0]?.allow ?? [])
    return {
      JSXOpeningElement(node) {
        const tag = jsxName(node.name)
        if (!MAP[tag] || allow.has(tag)) return
        // <input type="hidden">, <input type="file">는 UI가 아니라 허용
        if (tag === 'input') {
          const types = attrStrings(node.attributes.find((a) => a.type === 'JSXAttribute' && a.name.name === 'type'))
          if (types.length && types.every((t) => t === 'hidden' || t === 'file')) return
        }
        ctx.report({ node, messageId: 'raw', data: { tag, alt: MAP[tag] } })
      },
    }
  },
}
