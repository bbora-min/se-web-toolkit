import { defineConfig } from 'tsup'

export default defineConfig({
  entry: { index: 'src/index.ts', vite: 'src/vite.ts' },
  format: ['esm'],
  dts: true,
  // clean하지 않는다 — dev 서버가 떠 있는 동안 pnpm install이 dist를 지우면 virtual:se-theme.css 해석이 깨진다
  clean: false,
  sourcemap: true,
  external: ['vite'],
})
