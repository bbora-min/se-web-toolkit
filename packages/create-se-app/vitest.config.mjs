import { defineConfig } from 'vitest/config'
// templates/ 는 prepare 가 복사해 온 동봉본 — 그 안의 e2e 스펙은 여기서 돌리지 않는다
export default defineConfig({ test: { include: ['test/**/*.test.mjs'] } })
