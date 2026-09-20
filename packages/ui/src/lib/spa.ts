/**
 * 정적 호스팅(GitHub Pages 등)에서 SPA 깊은 링크 살리기.
 * 서버 라우팅이 없으면 `/apps/release-desk/calendar` 를 새로고침할 때 404 가 난다. 루트 `404.html` 이 원래 주소를
 * sessionStorage 에 넣고 앱 루트로 보내면, 앱은 뜨기 전에 `restoreDeepLink()` 로 주소를 되돌린다(라우터는 그 주소로 시작한다).
 */
export const DEEP_LINK_KEY = 'se:deep-link'

/** 라우터가 마운트되기 전에 한 번 — `main.tsx` 맨 위 */
export function restoreDeepLink() {
  try {
    const url = sessionStorage.getItem(DEEP_LINK_KEY)
    if (!url) return
    sessionStorage.removeItem(DEEP_LINK_KEY)
    const u = new URL(url)
    if (u.origin === location.origin) history.replaceState(null, '', u.pathname + u.search + u.hash)
  } catch {
    /* 저장소가 막힌 환경 — 루트에서 그냥 시작한다 */
  }
}

/** Vite `BASE_URL`('/' 또는 '/repo/apps/x/') → 라우터 basename('' 또는 '/repo/apps/x') */
export function routerBasename(base: string) {
  return base.replace(/\/$/, '')
}
