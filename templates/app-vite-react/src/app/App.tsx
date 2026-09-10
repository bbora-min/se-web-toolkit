import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { ThemeProvider, Toaster, TooltipProvider } from '@se/ui'
import identity from '../../se.identity.json'
import { Shell } from './Shell'
import { ItemsPage } from '../pages/items/ItemsPage'
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
                <Route index element={<Navigate to="/items" replace />} />
                <Route path="/items" element={<ItemsPage />} />
                <Route path="/items/:id" element={<ItemsPage />} />
                {/* /se:page 가 만든 화면은 여기에 추가 */}
                {import.meta.env.DEV ? <Route path="/__identity" element={<IdentityPage />} /> : null}
                <Route path="*" element={<Navigate to="/items" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
