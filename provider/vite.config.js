import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { copyFileSync, existsSync } from 'node:fs'
import path from 'node:path'

/** Render serves 404.html for unknown paths. Copy the SPA shell so reloads keep working. */
function spa404Fallback() {
  return {
    name: 'spa-404-fallback',
    closeBundle() {
      const index = path.resolve(process.cwd(), 'dist/index.html')
      const fallback = path.resolve(process.cwd(), 'dist/404.html')
      if (existsSync(index)) {
        copyFileSync(index, fallback)
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const devPort = Number(env.VITE_DEV_SERVER_PORT || 5176)
  const previewPort = Number(env.VITE_PREVIEW_PORT || 4176)

  return {
    plugins: [react(), tailwindcss(), spa404Fallback()],
    server: {
      port: devPort,
    },
    preview: {
      port: previewPort,
    },
  }
})
