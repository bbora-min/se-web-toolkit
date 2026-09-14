// 릴리스에 묶이는 워크스페이스 패키지 — packages/*/package.json 이 있는 폴더 전부 (pnpm-workspace.yaml 의 packages/*)
import { existsSync, readdirSync } from 'node:fs'
export const PKGS = readdirSync('packages').filter((d) => existsSync(`packages/${d}/package.json`)).sort()
export const VERSION_FILES = ['package.json', ...PKGS.map((p) => `packages/${p}/package.json`), 'plugin/.claude-plugin/plugin.json', '.claude-plugin/marketplace.json']
