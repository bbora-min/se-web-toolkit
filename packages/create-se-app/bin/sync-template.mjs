#!/usr/bin/env node
// prepare 단계: 모노레포의 templates/app-vite-react 를 이 패키지 안(templates/)으로 복사한다.
// git 서브디렉터리 설치(#path:packages/create-se-app)에서도 클론 전체가 있으므로 여기서 복사된다 → 어디서나 자급자족.
import { cpSync, existsSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const src = resolve(here, '..', '..', '..', 'templates', 'app-vite-react')
const dst = resolve(here, '..', 'templates', 'app-vite-react')
if (!existsSync(src)) {
  if (existsSync(dst)) process.exit(0) // 이미 동봉된 배포본
  console.error('템플릿 원본이 없습니다:', src)
  process.exit(1)
}
rmSync(dst, { recursive: true, force: true })
cpSync(src, dst, { recursive: true, filter: (p) => !/[\\/](node_modules|dist|playwright-report|test-results|\.logs)$/.test(p) })
