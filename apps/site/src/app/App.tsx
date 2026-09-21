import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { ThemeProvider, TooltipProvider, routerBasename } from '@se/ui'
import { Shell } from './Shell'
import { HomePage } from '../pages/HomePage'
import { ArchetypesPage } from '../pages/ArchetypesPage'
import { StartPage } from '../pages/StartPage'
import { HowPage } from '../pages/HowPage'

export function App() {
  return (
    <ThemeProvider defaultDensity="comfortable">
      <TooltipProvider delayDuration={300}>
        <BrowserRouter basename={routerBasename(import.meta.env.BASE_URL)}>
          <Routes>
            <Route element={<Shell />}>
              <Route index element={<HomePage />} />
              <Route path="/archetypes" element={<ArchetypesPage />} />
              <Route path="/start" element={<StartPage />} />
              <Route path="/how" element={<HowPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  )
}
