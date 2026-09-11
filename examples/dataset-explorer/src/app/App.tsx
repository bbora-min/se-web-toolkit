import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { ThemeProvider, Toaster, TooltipProvider, hasForcedState } from '@se/ui'
import identity from '../../se.identity.json'
import { Shell } from './Shell'
import { DatasetsPage } from '../pages/datasets/DatasetsPage'
import { DatasetPage } from '../pages/datasets/DatasetPage'
import { IdentityPage } from '../pages/identity/IdentityPage'

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: (n) => !hasForcedState() && n < 1, staleTime: 5_000 } } })

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultDensity={identity.density as 'compact' | 'comfortable'}>
        <TooltipProvider delayDuration={300}>
          <BrowserRouter>
            <Routes>
              <Route element={<Shell />}>
                <Route index element={<Navigate to="/datasets" replace />} />
                <Route path="/datasets" element={<DatasetsPage />} />
                <Route path="/datasets/:id" element={<DatasetPage />} />
                {import.meta.env.DEV ? <Route path="/__identity" element={<IdentityPage />} /> : null}
                <Route path="*" element={<Navigate to="/datasets" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
