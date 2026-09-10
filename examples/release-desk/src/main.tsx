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

enableMocks().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})
