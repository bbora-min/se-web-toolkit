// 변환 목록 — 순서가 곧 `all` 의 실행 순서 (라이브러리 치환 → raw 컨트롤 → 팔레트 색)
import mui from './mui.js'
import antd from './antd.js'
import rawControls from './raw-controls.js'
import tailwindPalette from './tailwind-palette.js'

export const TRANSFORMS = {
  mui: { run: mui, why: '@mui/material → @se/ui (Button·TextField·Checkbox·Switch·Chip·Alert·Dialog·Divider·Tooltip·Skeleton)' },
  antd: { run: antd, why: 'antd → @se/ui (Button·Input·TextArea·Tag·Alert·Switch·Checkbox·Divider·Tooltip·Skeleton·message)' },
  'raw-controls': { run: rawControls, why: 'raw <button> <input> <textarea> <select> → Button·Input·Textarea·Select, <table> 은 TODO' },
  'tailwind-palette': { run: tailwindPalette, why: 'Tailwind 기본 팔레트 클래스 → 토큰 클래스 (bg-blue-600 → bg-accent …)' },
}
export { mapPalette, rewriteClasses, TODO_RE, TW_PALETTE, COLOR_UTILS, CLASS_HELPERS } from './lib.js'
