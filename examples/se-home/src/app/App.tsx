import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { ThemeProvider, Toaster, TooltipProvider, hasForcedState } from '@se/ui'
import identity from '../../se.identity.json'
import { Shell } from './Shell'
import { HomePage } from '../pages/home/HomePage'
import { ServicesPage } from '../pages/services/ServicesPage'
import { IdentityPage } from '../pages/identity/IdentityPage'

// ?__state=error 로 에러 화면을 강제할 땐 재시도를 끈다 — 재시도 대기 중이면 스크린샷에 로딩만 찍힌다 (실제로 겪음)
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: (n) => !hasForcedState() && n < 1, staleTime: 5_000 } } })

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultDensity={identity.density as 'compact' | 'comfortable'}>
        <TooltipProvider delayDuration={300}>
          <BrowserRouter>
            <Routes>
              <Route element={<Shell />}>
                <Route index element={<HomePage />} />
                <Route path="/services" element={<ServicesPage />} />
                {import.meta.env.DEV ? <Route path="/__identity" element={<IdentityPage />} /> : null}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
