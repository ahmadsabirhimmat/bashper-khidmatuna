import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const devPort = Number(env.VITE_DEV_SERVER_PORT || 5176)
  const previewPort = Number(env.VITE_PREVIEW_PORT || 4176)

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: devPort,
    },
    preview: {
      port: previewPort,
    },
  }
})
