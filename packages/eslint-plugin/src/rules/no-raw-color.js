import { collectStrings } from '../util.js'

const TW_PALETTE = '(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)'
const UTIL = '(?:bg|text|border(?:-[xytrbl])?|ring(?:-offset)?|inset-ring|outline|placeholder|fill|stroke|from|to|via|decoration|divide|shadow|accent|caret)'
// 각 패턴은 그룹 1에 "문제의 값"만 잡는다 — 메시지와 allow 비교에 그것만 쓴다
const PATTERNS = [
  // URL 조각('/path#abc')·id 참조는 제외: 앞에 단어문자나 '/'가 오면 색이 아니다
  { re: /(?<![\w/])(#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8}))\b/i, why: 'hex 색' },
  { re: /\b((?:rgba?|hsla?|oklch|oklab)\()/i, why: '색 함수' },
  // 변형 접두(hover:, md:), 중요(!), 음수(-) 뒤에 와도 잡는다
  { re: new RegExp(`(?:^|[^\\w-])((?:!|-)*${UTIL}-${TW_PALETTE}-\\d{2,3})(?![\\w-])`), why: 'Tailwind 기본 팔레트' },
  { re: new RegExp(`(?:^|[^\\w-])((?:!|-)*${UTIL}-\\[#[0-9a-f]{3,8}\\])`, 'i'), why: '임의값 색' },
]
/** className을 만드는 것으로 아는 헬퍼만 인자를 검사한다 — useQuery(…)·navigate(…) 같은 호출은 보지 않는다 */
const CLASS_HELPERS = new Set(['cn', 'clsx', 'cva', 'twMerge', 'tv', 'classnames'])
const COLOR_ATTRS = new Set(['className', 'class', 'fill', 'stroke', 'color', 'stopColor'])
const CLASS_VAR = /class|cls|variant|styles?$/i
const allowCache = new WeakMap()

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: { description: '색은 토큰 클래스(bg-canvas, text-ink, bg-accent …)만. hex·rgb·Tailwind 기본 팔레트 금지' },
    schema: [{ type: 'object', properties: { allow: { type: 'array', items: { type: 'string' }, description: '정규식 문자열 — 일치하는 값은 허용' } }, additionalProperties: false }],
    messages: { raw: '{{why}} "{{match}}" — 토큰 클래스를 쓰십시오 (bg-canvas · text-ink · text-muted · border-line · bg-accent · text-danger …). 서비스 색은 se.identity.json이 정합니다.' },
  },
  create(ctx) {
    const opt = ctx.options[0] ?? {}
    let allow = allowCache.get(opt)
    if (!allow) allowCache.set(opt, (allow = (opt.allow ?? []).map((s) => new RegExp(s))))
    const isHelper = (node) => node.type === 'CallExpression' && node.callee.type === 'Identifier' && CLASS_HELPERS.has(node.callee.name)
    const check = (node) => {
      for (const { text, node: n } of collectStrings(node, [], isHelper)) {
        for (const p of PATTERNS) {
          const m = p.re.exec(text)
          if (m && !allow.some((a) => a.test(m[1]))) {
            ctx.report({ node: n, messageId: 'raw', data: { why: p.why, match: m[1] } })
            break
          }
        }
      }
    }
    return {
      JSXAttribute(node) {
        const name = node.name?.name
        if (COLOR_ATTRS.has(name)) check(node.value)
        // style={{ color: '#fff', background: 'rgb(...)' }}
        if (name === 'style' && node.value?.expression?.type === 'ObjectExpression') for (const p of node.value.expression.properties) if (p.type === 'Property') check(p.value)
      },
      // const cls = cn('bg-red-500') / const rowClass = `text-slate-900 ${x}`
      VariableDeclarator(node) {
        if (!node.init) return
        if (isHelper(node.init)) check(node.init)
        else if (node.id.type === 'Identifier' && CLASS_VAR.test(node.id.name) && ['Literal', 'TemplateLiteral', 'ArrayExpression', 'ObjectExpression'].includes(node.init.type)) check(node.init)
      },
    }
  },
}
