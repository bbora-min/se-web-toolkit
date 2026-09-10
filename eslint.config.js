// 툴킷 저장소의 lint.
//  - 앱 코드(examples·templates): se/recommended 전부
//  - 디자인 시스템 패키지(packages/ui·charts): se/library — raw 컨트롤은 여기 살아야 하니 그 규칙만 뺀다
import se from '@se/eslint-plugin'

export default [
  { ignores: ['**/dist/**', '**/node_modules/**', '**/public/**', '**/*.config.{js,mjs,ts}', 'plugin/**', 'scripts/**', 'packages/eslint-plugin/**', 'packages/tokens/**'] },
  { files: ['examples/**/src/**/*.{ts,tsx}', 'templates/**/src/**/*.{ts,tsx}'], ...se.configs.recommended },
  { files: ['packages/ui/src/**/*.{ts,tsx}', 'packages/charts/src/**/*.{ts,tsx}'], ...se.configs.library },
]
