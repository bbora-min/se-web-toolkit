import { describe, expect, it } from 'vitest'
import jscodeshift from 'jscodeshift'
import { readFileSync } from 'node:fs'
import { TRANSFORMS, mapPalette, rewriteClasses, TW_PALETTE, COLOR_UTILS, CLASS_HELPERS } from '../src/index.js'

const j = jscodeshift.withParser('tsx')
const api = { jscodeshift: j, j, stats: () => {}, report: () => {} }
const run = (name, source) => TRANSFORMS[name].run({ path: 'x.tsx', source }, api, {}) ?? source

describe('tailwind-palette', () => {
  it('팔레트 → 토큰, 액센트 위 흰 글자 → on-accent', () => {
    expect(rewriteClasses('bg-blue-600 text-white hover:bg-blue-700').text).toBe('bg-info text-on-info hover:bg-info')
    expect(rewriteClasses('bg-indigo-600 text-white').text).toBe('bg-accent text-on-accent')
    expect(rewriteClasses('text-gray-500 border-gray-200 bg-gray-50').text).toBe('text-muted border-line bg-canvas')
    expect(rewriteClasses('bg-red-50 text-red-600').text).toBe('bg-danger-soft text-danger')
    expect(mapPalette('bg', 'blue', '300')).toBeNull()
  })
  it('className·cn() 안을 바꾸고 못 바꾼 색은 TODO 로', () => {
    const out = run('tailwind-palette', `const a = <div className="bg-slate-100 text-gray-900 bg-blue-300">x</div>\nconst b = cn('text-red-600', ok && 'bg-green-500')`)
    expect(out).toContain('className="bg-surface-2 text-ink bg-blue-300"')
    expect(out).toMatch(/cn\("text-danger", ok && "bg-success"\)/)
    expect(out).toContain('TODO(se-adopt)')
    expect(out).toContain('bg-blue-300')
  })
  it('바꿀 게 없으면 null', () => {
    expect(TRANSFORMS['tailwind-palette'].run({ path: 'x.tsx', source: 'const a = <div className="bg-surface" />' }, api, {})).toBeNull()
  })
})

describe('raw-controls', () => {
  it('button/input/textarea/select 치환 + import', () => {
    const out = run('raw-controls', `export function F() {\n  return <form><button type="submit" className="bg-blue-600 px-3 rounded">저장</button><input type="text" value={v} /><textarea rows={3} /><select value={s}><option value="a">A</option><option value="b">B</option></select></form>\n}`)
    expect(out).toContain('<Button variant="primary" type="submit">저장</Button>')
    expect(out).toContain('<Input type="text" value={v} />')
    expect(out).toContain('<Textarea rows={3} />')
    expect(out).toMatch(/<Select[\s\S]*?value=\{s\}[\s\S]*?options=\{\[/)
    expect(out).toMatch(/import \{ Button, Input, Textarea, Select \} from ["']@se\/ui["']/)
  })
  it('table 은 TODO 만', () => {
    const out = run('raw-controls', `const t = <table><tbody /></table>`)
    expect(out).toContain('TODO(se-adopt): table')
    expect(out).toContain('<table>')
  })
})

describe('mui', () => {
  it('Button variant 매핑·import 정리·남은 것 TODO', () => {
    const out = run('mui', `import { Button, TextField, Table } from '@mui/material'\nconst a = <><Button variant="contained" color="primary">저장</Button><Button color="error">삭제</Button><TextField label="이름" /><Table /></>`)
    expect(out).toContain('<Button variant="primary">저장</Button>')
    expect(out).toContain('<Button variant="danger">삭제</Button>')
    expect(out).toContain('<Input />')
    expect(out).toMatch(/import \{ Table \} from ["']@mui\/material["']/)
    expect(out).toMatch(/from ["']@se\/ui["']/)
    expect(out).toContain('아직 MUI 인 것: Table')
    expect(out).toContain('MUI Table → DataTable')
  })
})

describe('antd', () => {
  it('Button type·Tag color·message → toast', () => {
    const out = run('antd', `import { Button, Tag, message, Input } from 'antd'\nconst a = <><Button type="primary" size="small">저장</Button><Button danger>삭제</Button><Tag color="red">실패</Tag><Input.TextArea rows={2} /></>\nmessage.success('완료')`)
    expect(out).toContain('<Button variant="primary" size="sm">저장</Button>')
    expect(out).toContain('<Button variant="danger">삭제</Button>')
    expect(out).toContain('<Badge tone="danger">실패</Badge>')
    expect(out).toContain('<Textarea rows={2} />')
    expect(out).toContain("toast.success('완료')")
    expect(out).not.toMatch(/from ["']antd["']/)
  })
})

describe('린트 규칙과 같은 목록', () => {
  it('팔레트·유틸·클래스 헬퍼가 @se/eslint-plugin no-raw-color 와 일치한다', () => {
    const rule = readFileSync(new URL('../../eslint-plugin/src/rules/no-raw-color.js', import.meta.url), 'utf8')
    const pal = /TW_PALETTE = '\(\?:([^)]+)\)'/.exec(rule)[1]
    const util = /UTIL = '\(\?:([^']+)'/.exec(rule)[1].replace(/\)$/, '')
    const helpers = /CLASS_HELPERS = new Set\(\[([^\]]+)\]\)/.exec(rule)[1].replace(/['\s]/g, '').split(',')
    expect(pal.split('|').sort()).toEqual(TW_PALETTE.split('|').sort())
    // 린트는 border(?:-[xytrbl])?·ring(?:-offset)? 로 묶어 쓴다 — 풀어서 비교
    const expand = (s) => s.replace('border(?:-[xytrbl])?', 'border|border-[xytrbl]').replace('ring(?:-offset)?', 'ring|ring-offset').split('|').sort()
    expect(expand(util)).toEqual(COLOR_UTILS.split('|').sort())
    expect(helpers.sort()).toEqual([...CLASS_HELPERS].sort())
  })
})
