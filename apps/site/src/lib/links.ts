/** 바깥으로 나가는 주소는 여기 한 곳. 배포(GitHub Pages)에선 같은 사이트의 하위 경로, 개발 중엔 각 앱의 포트 */
export const GITHUB = 'https://github.com/bbora-min/se-web-toolkit'
export const README = `${GITHUB}#readme`
export const PLUGIN_README = `${GITHUB}/blob/main/plugin/README.md`
export const CHANGELOG = `${GITHUB}/blob/main/CHANGELOG.md`
export const DESIGN_DOC = `${GITHUB}/blob/main/docs/DESIGN.md`

export type AppId = 'job-monitor' | 'dataset-explorer' | 'release-desk' | 'se-home'
const PORT: Record<AppId, number> = { 'job-monitor': 5173, 'dataset-explorer': 5174, 'release-desk': 5175, 'se-home': 5177 }

/** 예제 앱의 화면 주소. `path` 는 앱 안의 라우트('/calendar') */
export function appUrl(id: AppId, path = '/') {
  return import.meta.env.DEV ? `http://localhost:${PORT[id]}${path}` : `${import.meta.env.BASE_URL}apps/${id}${path}`
}
export function storybookUrl(story?: string) {
  const base = import.meta.env.DEV ? 'http://localhost:6006/' : `${import.meta.env.BASE_URL}storybook/`
  return story ? `${base}?path=/docs/${story}` : base
}
