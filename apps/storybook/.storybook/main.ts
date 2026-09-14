import type { StorybookConfig } from '@storybook/react-vite'
import tailwindcss from '@tailwindcss/vite'

// 스토리는 apps/storybook/stories 에만 — 패키지 소스는 TSDoc 만 갖고, 문서(autodocs)는 거기서 읽는다 (스킬 레퍼런스와 같은 원본)
const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.tsx'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  docs: { defaultName: '문서' },
  typescript: {
    // 워크스페이스 TS 소스를 그대로 읽으므로 docgen 도 소스에서 — prop 표에 TSDoc 설명이 붙는다
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules\/(?!@se)/.test(prop.parent.fileName) : true),
    },
  },
  viteFinal: (cfg) => {
    cfg.plugins = [...(cfg.plugins ?? []), tailwindcss()]
    return cfg
  },
}
export default config
