// 스토리북이 보여 주는 아이덴티티 목록 — 레퍼런스 앱 3개는 실제 se.identity.json, 툴킷 밖 서비스는 레지스트리 행으로 최소 구성
import { createTheme, parseIdentity, themeToCss, type Identity, type IdentityInput } from '@se/tokens'
import jobMonitor from '../../../examples/reference-app/se.identity.json'
import datasetExplorer from '../../../examples/dataset-explorer/se.identity.json'
import releaseDesk from '../../../examples/release-desk/se.identity.json'
import registry from '../../../identities/registry.json'

const known: Record<string, IdentityInput> = {
  'job-monitor': jobMonitor as IdentityInput,
  'dataset-explorer': datasetExplorer as IdentityInput,
  'release-desk': releaseDesk as IdentityInput,
}

/** 레지스트리 순서대로. path 없는 서비스는 hue·시그니처·뉴트럴만 알고 마크는 이니셜 */
export const IDENTITIES: Identity[] = registry.services.map((s) => {
  const raw =
    known[s.id] ??
    ({
      id: s.id,
      name: s.name,
      mark: { type: 'monogram', text: s.name.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase() || 'SE' },
      accent: { hue: s.hue },
      neutralBias: s.neutralBias,
      signature: s.signature,
      shell: s.shell,
    } as IdentityInput)
  return parseIdentity(raw)
})

export const byId = (id: string): Identity => IDENTITIES.find((i) => i.id === id) ?? IDENTITIES[0]!

/** 로크업에 쓸 마크 글자 — 모노그램이면 그 텍스트, 아이콘 마크면 이름 첫 글자 */
export const markText = (id: Identity): string => (id.mark.type === 'monogram' ? id.mark.text : id.name.slice(0, 1))

/** 전역(:root) CSS — 포털(다이얼로그·툴팁)도 같은 변수를 봐야 하므로 head 에 넣는다 */
export const globalCss = (id: Identity) => themeToCss(createTheme(id))

/** 한 화면에 여러 아이덴티티를 나란히 놓을 때 — :root 를 컨테이너 클래스로 바꾼다 */
export function scopedCss(id: Identity, scope: string): string {
  return themeToCss(createTheme(id))
    .replaceAll(':root:not([data-theme="light"])', `.${scope}:not([data-theme="light"])`)
    .replaceAll(':root[data-theme="dark"]', `.${scope}[data-theme="dark"]`)
    .replaceAll(':root', `.${scope}`)
}
