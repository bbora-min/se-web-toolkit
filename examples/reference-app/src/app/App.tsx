import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { ThemeProvider, Toaster, TooltipProvider, hasForcedState, routerBasename } from '@se/ui'
import identity from '../../se.identity.json'
import { Shell } from './Shell'
import { JobsPage } from '../pages/jobs/JobsPage'
import { JobConsolePage } from '../pages/jobs/JobConsolePage'
import { PipelinePage } from '../pages/pipelines/PipelinePage'
import { OverviewPage } from '../pages/overview/OverviewPage'
import { SignaturesPage } from '../pages/signatures/SignaturesPage'
import { IdentityPage } from '../pages/identity/IdentityPage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: (n) => !hasForcedState() && n < 1, staleTime: 5_000 } },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultDensity={identity.density as 'compact' | 'comfortable'}>
        <TooltipProvider delayDuration={300}>
          <BrowserRouter basename={routerBasename(import.meta.env.BASE_URL)}>
            <Routes>
              <Route element={<Shell />}>
                <Route index element={<Navigate to="/overview" replace />} />
                <Route path="/overview" element={<OverviewPage />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/jobs/:jobId/logs" element={<JobConsolePage />} />
                <Route path="/pipelines/:name?" element={<PipelinePage />} />
                <Route path="/jobs/:jobId" element={<JobsPage />} />
                {import.meta.env.DEV ? <Route path="/__identity" element={<IdentityPage />} /> : null}
                {import.meta.env.DEV ? <Route path="/__signatures" element={<SignaturesPage />} /> : null}
                <Route path="*" element={<Navigate to="/jobs" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
