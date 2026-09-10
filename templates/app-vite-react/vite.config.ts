import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { seTokens } from '@se/tokens/vite'

export default defineConfig({
  plugins: [react(), tailwindcss(), seTokens()],
  server: { port: 5170 },
})
