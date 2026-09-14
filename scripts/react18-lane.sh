#!/usr/bin/env bash
# React 18 레인 — peer 가 ^18 을 허용한다고 말한 것을 실제로 검증한다.
#   루트 overrides 로 react/react-dom/@types 를 18 로 바꿔 설치한 뒤 @se/ui·@se/charts typecheck, 템플릿 앱 typecheck·build·e2e(3상태 화면).
#   CI 전용(작업 트리를 바꾼다). 로컬에서 돌렸으면 끝에 git checkout package.json pnpm-lock.yaml && pnpm install.
set -euo pipefail
cd "$(dirname "$0")/.."
node - <<'JS'
const fs = require('node:fs')
const p = JSON.parse(fs.readFileSync('package.json', 'utf8'))
p.pnpm = p.pnpm ?? {}
p.pnpm.overrides = { ...(p.pnpm.overrides ?? {}), react: '18.3.1', 'react-dom': '18.3.1', '@types/react': '18.3.12', '@types/react-dom': '18.3.1' }
fs.writeFileSync('package.json', JSON.stringify(p, null, 2) + '\n')
JS
pnpm install --no-frozen-lockfile
R=$(cd templates/app-vite-react && node -p "require('react/package.json').version")
T=$(cd templates/app-vite-react && node -p "require('@types/react/package.json').version")
echo "react: $R  @types/react: $T"
[[ "$R" == 18.* && "$T" == 18.* ]] || { echo "✗ React 18 이 설치되지 않았습니다 (overrides 가 안 먹음)"; exit 1; }
pnpm --filter @se/ui --filter @se/charts typecheck
pnpm --filter app-vite-react typecheck
pnpm --filter app-vite-react build
pnpm --filter app-vite-react e2e
echo "✓ React 18 레인 통과"
