import noRawColor from './rules/no-raw-color.js'
import noRawControl from './rules/no-raw-control.js'
import importFromUi from './rules/import-from-ui.js'
import singleAccent from './rules/single-accent.js'
import pageStates from './rules/page-states.js'
import tsParser from '@typescript-eslint/parser'

/** @type {import('eslint').ESLint.Plugin & { configs: Record<string, import('eslint').Linter.Config> }} */
const plugin = {
  meta: { name: '@se/eslint-plugin', version: '0.1.0' },
  rules: {
    'no-raw-color': noRawColor,
    'no-raw-control': noRawControl,
    'import-from-ui': importFromUi,
    'single-accent': singleAccent,
    'page-states': pageStates,
  },
  configs: {},
}

/** @type {import('eslint').Linter.LanguageOptions} */
const languageOptions = { parser: tsParser, parserOptions: { ecmaFeatures: { jsx: true }, ecmaVersion: 2022, sourceType: 'module' } }

/**
 * 앱 코드(서비스 저장소·examples·templates)용. 파서까지 들어 있어 그대로 spread 하면 된다:
 *   export default [{ files: ['src/**\/*.{ts,tsx}'], ...se.configs.recommended }]
 */
plugin.configs.recommended = {
  name: 'se/recommended',
  languageOptions,
  plugins: { se: plugin },
  rules: /** @type {import('eslint').Linter.RulesRecord} */ ({
    'se/no-raw-color': 'error',
    'se/no-raw-control': 'error',
    'se/import-from-ui': 'error',
    'se/single-accent': 'warn',
    'se/page-states': 'warn',
  }),
}

/** 디자인 시스템 패키지(@se/ui, @se/charts) 자체용 — raw 컨트롤은 여기 살아야 하니 그 규칙만 뺀다 */
plugin.configs.library = {
  name: 'se/library',
  languageOptions,
  plugins: { se: plugin },
  rules: /** @type {import('eslint').Linter.RulesRecord} */ ({
    'se/no-raw-color': 'error',
    'se/single-accent': 'warn',
  }),
}

export default plugin
