import { describe, it } from 'vitest'
import { RuleTester } from 'eslint'
import tsParser from '@typescript-eslint/parser'
import plugin from '../src/index.js'

const tester = new RuleTester({
  languageOptions: { parser: tsParser, parserOptions: { ecmaFeatures: { jsx: true }, ecmaVersion: 2022, sourceType: 'module' } },
})
// vitest 안에서 RuleTester를 쓰기 위한 어댑터
RuleTester.describe = describe
RuleTester.it = it
RuleTester.itOnly = it.only

describe('no-raw-color', () => {
  tester.run('no-raw-color', plugin.rules['no-raw-color'], {
    valid: [
      '<div className="bg-canvas text-ink border-line" />',
      '<div className={cn("bg-accent text-on-accent", active && "bg-accent-soft")} />',
      '<div className="text-white bg-black" />',
      '<div className="bg-chart-3 text-success-soft" />',
      { code: '<div className="bg-gray-100" />', options: [{ allow: ['gray-100'] }] },
      "navigate('/releases#abc')",
      "const q = useQuery({ queryKey: ['bg-red-500'] })",
      '<a href="/docs#1a2b3c" />',
      "const label = 'text-gray-500'",
      { code: '<div className="hover:bg-gray-100" />', options: [{ allow: ['^bg-gray-100$'] }] },
      "const x = { title: 'PR #1234 머지' }",
      "toast('x', { description: 'hex #cafe' })",
    ],
    invalid: [
      { code: '<div className="bg-red-500" />', errors: [{ messageId: 'raw' }] },
      { code: '<div className={cn("p-2", "text-blue-600")} />', errors: [{ messageId: 'raw' }] },
      { code: '<div style={{ color: "#1B6B85" }} />', errors: [{ messageId: 'raw' }] },
      { code: '<div className="bg-[#ff0000]" />', errors: [{ messageId: 'raw' }] },
      { code: 'const cls = `text-slate-900 ${x}`', errors: [{ messageId: 'raw' }] },
      { code: '<svg fill="rgb(0,0,0)" />', errors: [{ messageId: 'raw' }] },
      { code: "const rowClass = 'bg-emerald-50'", errors: [{ messageId: 'raw' }] },
      { code: "const c = cn({ 'text-red-600': bad })", errors: [{ messageId: 'raw' }] },
      { code: '<div className="!bg-red-500" />', errors: [{ messageId: 'raw', data: { why: 'Tailwind 기본 팔레트', match: '!bg-red-500' } }] },
      { code: '<div className="md:hover:text-red-500" />', errors: [{ messageId: 'raw', data: { why: 'Tailwind 기본 팔레트', match: 'text-red-500' } }] },
      { code: '<div className="border-x-red-500" />', errors: [{ messageId: 'raw' }] },
      { code: '<div className="placeholder-zinc-400" />', errors: [{ messageId: 'raw' }] },
      { code: "const classes = ['bg-blue-500']", errors: [{ messageId: 'raw' }] },
    ],
  })
})

describe('no-raw-control', () => {
  tester.run('no-raw-control', plugin.rules['no-raw-control'], {
    valid: ['<Button>확인</Button>', '<Input />', '<input type="hidden" />', '<input type="file" />', "<input type={'hidden'} />", { code: '<button />', options: [{ allow: ['button'] }] }],
    invalid: [
      { code: '<button onClick={f}>x</button>', errors: [{ messageId: 'raw' }] },
      { code: '<input value={v} />', errors: [{ messageId: 'raw' }] },
      { code: '<select><option /></select>', errors: [{ messageId: 'raw' }] },
      { code: '<table><tr /></table>', errors: [{ messageId: 'raw' }] },
    ],
  })
})

describe('import-from-ui', () => {
  tester.run('import-from-ui', plugin.rules['import-from-ui'], {
    valid: ["import { Button } from '@se/ui'", "import { BarChart } from '@se/charts'", "import * as React from 'react'"],
    invalid: [
      { code: "import * as Dialog from '@radix-ui/react-dialog'", errors: [{ messageId: 'blocked' }] },
      { code: "export { toast } from 'sonner'", errors: [{ messageId: 'blocked' }] },
      { code: "export * from '@radix-ui/react-popover'", errors: [{ messageId: 'blocked' }] },
      { code: "const m = await import('recharts')", errors: [{ messageId: 'blocked' }] },
      { code: "const r = require('cmdk')", errors: [{ messageId: 'blocked' }] },
      { code: "import { toast } from 'sonner'", errors: [{ messageId: 'blocked' }] },
      { code: "import { BarChart } from 'recharts'", errors: [{ messageId: 'blocked' }] },
    ],
  })
})

describe('single-accent', () => {
  tester.run('single-accent', plugin.rules['single-accent'], {
    valid: [
      '<div><Button variant="primary">저장</Button><Button>취소</Button></div>',
      '<Button variant="ghost" />',
      // 삼항의 양쪽 — 동시에 보이지 않는다
      '<div>{last ? <Button variant="primary">등록</Button> : <Button variant="primary">다음</Button>}</div>',
      '<div>{a ? <Button variant="primary">A</Button> : b ? <Button variant="primary">B</Button> : null}</div>',
    ],
    invalid: [
      { code: '<div><Button variant="primary">A</Button><Button variant="primary">B</Button></div>', errors: [{ messageId: 'many' }, { messageId: 'many' }] },
      // && 는 배타적이지 않다
      { code: '<div><Button variant="primary">A</Button>{x && <Button variant="primary">B</Button>}</div>', errors: [{ messageId: 'many' }, { messageId: 'many' }] },
      // 표현식 값도 센다
      { code: '<div><Button variant="primary">A</Button><Button variant={ok ? \'primary\' : \'ghost\'}>B</Button></div>', errors: [{ messageId: 'many' }, { messageId: 'many' }] },
    ],
  })
})

describe('page-states', () => {
  tester.run('page-states', plugin.rules['page-states'], {
    valid: [
      'const q = useQuery(); <DataTable columns={c} data={d} loading={l} error={e} empty={x} />',
      '<DataTable {...props} />',
      'const q = useQuery(); <DataTable {...{ columns, data, loading, error, empty }} />',
      // 정적 표는 empty만
      '<DataTable columns={c} data={rows} empty={x} />',
    ],
    invalid: [
      { code: 'const q = useQuery(); <DataTable columns={c} data={d} loading={l} />', errors: [{ messageId: 'missing', data: { missing: 'error · empty' } }] },
      { code: '<DataTable columns={c} data={rows} />', errors: [{ messageId: 'missing', data: { missing: 'empty' } }] },
    ],
  })
})
