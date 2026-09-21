import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { ThemeProvider, Toaster, TooltipProvider, hasForcedState, routerBasename } from '@se/ui'
import identity from '../../se.identity.json'
import { Shell } from './Shell'
import { DatasetsPage } from '../pages/datasets/DatasetsPage'
import { DatasetPage } from '../pages/datasets/DatasetPage'
import { DomainPage } from '../pages/domains/DomainPage'
import { AskPage } from '../pages/ask/AskPage'
import { OwnersPage } from '../pages/owners/OwnersPage'
import { TagsPage } from '../pages/tags/TagsPage'
import { IdentityPage } from '../pages/identity/IdentityPage'

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: (n) => !hasForcedState() && n < 1, staleTime: 5_000 } } })

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultDensity={identity.density as 'compact' | 'comfortable'}>
        <TooltipProvider delayDuration={300}>
          <BrowserRouter basename={routerBasename(import.meta.env.BASE_URL)}>
            <Routes>
              <Route element={<Shell />}>
                <Route index element={<Navigate to="/datasets" replace />} />
                <Route path="/datasets" element={<DatasetsPage />} />
                <Route path="/datasets/:id" element={<DatasetPage />} />
                <Route path="/domains/:domain?" element={<DomainPage />} />
                <Route path="/ask/:threadId?" element={<AskPage />} />
                <Route path="/owners" element={<OwnersPage />} />
                <Route path="/tags" element={<TagsPage />} />
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
