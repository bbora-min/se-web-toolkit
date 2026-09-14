import { addons } from 'storybook/manager-api'
import { create } from 'storybook/theming'

// 매니저(사이드바·툴바)의 글꼴을 앱과 같게 — 한글 폰트가 없는 환경(헤드리스 등)에서도 preview-head 의 Noto Sans KR 로 읽힌다
addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'SE Web Toolkit',
    brandUrl: 'https://github.com/bbora-min/se-web-toolkit',
    fontBase: '"Pretendard Variable", Pretendard, "Noto Sans KR", -apple-system, "Segoe UI", system-ui, sans-serif',
    fontCode: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  }),
})
