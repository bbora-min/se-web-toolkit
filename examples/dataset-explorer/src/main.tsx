import React from 'react'
import ReactDOM from 'react-dom/client'
import 'virtual:se-theme.css'
import './app.css'
import { restoreDeepLink } from '@se/ui'
import { App } from './app/App'

/** 개발 중엔 늘, 배포 빌드에선 VITE_MOCK=true(정적 호스팅 견본)일 때 MSW 목이 백엔드를 대신한다. VITE_API_BASE 가 있으면 실제 백엔드 */
async function enableMocks() {
  if ((!import.meta.env.DEV && !import.meta.env.VITE_MOCK) || import.meta.env.VITE_API_BASE) return
  const { worker } = await import('./mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true, serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` } })
}

restoreDeepLink()

enableMocks().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})
