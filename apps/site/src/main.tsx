import React from 'react'
import ReactDOM from 'react-dom/client'
import 'virtual:se-theme.css'
import './app.css'
import { restoreDeepLink } from '@se/ui'
import { App } from './app/App'

restoreDeepLink()
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
