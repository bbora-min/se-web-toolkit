import * as React from 'react'
import type { Preview } from '@storybook/react-vite'
import { create } from 'storybook/theming'
import { ThemeProvider, TooltipProvider, Toaster, useTheme, type Density, type ThemeMode } from '@se/ui'
import { IDENTITIES, byId, globalCss } from '../stories/identities'
import '../app.css'

/** 툴바의 테마·밀도 선택을 앱과 같은 ThemeProvider 에 흘려보낸다 — ThemeToggle 같은 컴포넌트가 그대로 동작한다 */
function SyncTheme({ mode, density }: { mode: ThemeMode; density: Density }) {
  const t = useTheme()
  React.useEffect(() => {
    t.setMode(mode)
    t.setDensity(density)
  }, [mode, density]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

// 툴바: 아이덴티티(어느 서비스의 눈으로 볼 것인가) · 테마 · 밀도. 세 가지가 곧 "같은 가족, 다른 형제"의 슬롯이다
const preview: Preview = {
  globalTypes: {
    identity: {
      description: '서비스 아이덴티티 — 같은 컴포넌트가 서비스마다 어떻게 보이는가',
      toolbar: {
        title: '아이덴티티',
        icon: 'paintbrush',
        items: IDENTITIES.map((i) => ({ value: i.id, title: `${i.name} · ${i.accent.hue}°` })),
        dynamicTitle: true,
      },
    },
    theme: {
      description: '라이트 / 다크',
      toolbar: { title: '테마', icon: 'mirror', items: [{ value: 'light', title: '라이트' }, { value: 'dark', title: '다크' }], dynamicTitle: true },
    },
    density: {
      description: '밀도',
      toolbar: { title: '밀도', icon: 'component', items: [{ value: 'compact', title: 'compact' }, { value: 'comfortable', title: 'comfortable' }], dynamicTitle: true },
    },
  },
  initialGlobals: { identity: 'job-monitor', theme: 'light', density: 'compact' },
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: { disable: true },
    // 문서 페이지의 글꼴도 앱과 같게 (매니저는 .storybook/manager.ts)
    docs: { theme: create({ base: 'light', fontBase: '"Pretendard Variable", Pretendard, "Noto Sans KR", -apple-system, "Segoe UI", system-ui, sans-serif', fontCode: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace' }) },
    options: {
      storySort: { order: ['소개', '아이덴티티', '시그니처', '패턴', '컴포넌트', '차트'] },
    },
  },
  decorators: [
    (Story, ctx) => {
      const id = byId(String(ctx.globals.identity))
      const theme = String(ctx.globals.theme) as ThemeMode
      const density = String(ctx.globals.density) as Density
      React.useLayoutEffect(() => {
        let el = document.getElementById('se-theme') as HTMLStyleElement | null
        if (!el) {
          el = document.createElement('style')
          el.id = 'se-theme'
          document.head.appendChild(el)
        }
        el.textContent = globalCss(id)
        document.body.style.background = 'var(--se-canvas)'
      }, [id])
      return (
        <ThemeProvider defaultDensity={density}>
          <SyncTheme mode={theme} density={density} />
          <TooltipProvider delayDuration={300}>
            <Story />
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      )
    },
  ],
}
export default preview
