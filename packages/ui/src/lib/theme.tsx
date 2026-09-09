import * as React from 'react'

export type ThemeMode = 'system' | 'light' | 'dark'
export type Density = 'compact' | 'comfortable'

interface ThemeCtx {
  mode: ThemeMode
  setMode: (m: ThemeMode) => void
  density: Density
  setDensity: (d: Density) => void
}
const Ctx = React.createContext<ThemeCtx | null>(null)
const KEY = 'se:theme'

/**
 * data-theme / data-density 속성을 <html>에 반영한다.
 * system이면 속성을 지워 OS 설정을 따른다 (토큰 CSS가 세 상태를 모두 다룬다).
 */
export function ThemeProvider({
  children,
  defaultDensity = 'compact',
}: {
  children: React.ReactNode
  defaultDensity?: Density
}) {
  const [mode, setModeState] = React.useState<ThemeMode>(() => {
    try {
      return (localStorage.getItem(KEY) as ThemeMode) || 'system'
    } catch {
      return 'system'
    }
  })
  const [density, setDensity] = React.useState<Density>(defaultDensity)

  React.useEffect(() => {
    const el = document.documentElement
    if (mode === 'system') el.removeAttribute('data-theme')
    else el.setAttribute('data-theme', mode)
    try {
      localStorage.setItem(KEY, mode)
    } catch {
      /* private mode 등 — 무시 */
    }
  }, [mode])
  React.useEffect(() => {
    document.documentElement.setAttribute('data-density', density)
  }, [density])

  const value = React.useMemo(() => ({ mode, setMode: setModeState, density, setDensity }), [mode, density])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useTheme() {
  const ctx = React.useContext(Ctx)
  if (!ctx) throw new Error('useTheme은 ThemeProvider 안에서만 쓸 수 있습니다')
  return ctx
}
