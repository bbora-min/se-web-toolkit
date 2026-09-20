import React from 'react'
import ReactDOM from 'react-dom/client'
import 'virtual:se-theme.css'
import './app.css'
import { App } from './app/App'

async function enableMocks() {
  if (!import.meta.env.DEV || import.meta.env.VITE_API_BASE) return
  const { worker } = await import('./mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true })
}

enableMocks()
  .catch((e) => console.warn('[se] MSW 목을 시작하지 못해 실제 백엔드로 진행합니다:', e))
  .finally(() => {
    ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    )
  })
