import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { ThemeProvider, Toaster, TooltipProvider } from '@se/ui'
import identity from '../../se.identity.json'
import { Shell } from './Shell'
import { ReleasesPage } from '../pages/releases/ReleasesPage'
import { ReleasePage } from '../pages/releases/ReleasePage'
import { NewReleasePage } from '../pages/releases/NewReleasePage'
import { SettingsPage } from '../pages/settings/SettingsPage'
import { IdentityPage } from '../pages/identity/IdentityPage'

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 5_000 } } })

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultDensity={identity.density as 'compact' | 'comfortable'}>
        <TooltipProvider delayDuration={300}>
          <BrowserRouter>
            <Routes>
              <Route element={<Shell />}>
                <Route index element={<Navigate to="/releases" replace />} />
                <Route path="/releases" element={<ReleasesPage />} />
                <Route path="/releases/new" element={<NewReleasePage />} />
                <Route path="/releases/:id" element={<ReleasePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                {import.meta.env.DEV ? <Route path="/__identity" element={<IdentityPage />} /> : null}
                <Route path="*" element={<Navigate to="/releases" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
