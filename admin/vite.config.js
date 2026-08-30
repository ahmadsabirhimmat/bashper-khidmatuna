import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
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
  const proxyTarget = env.VITE_API_PROXY_TARGET || env.VITE_API_URL || 'http://localhost:4000'
  const shouldProxy = env.VITE_DISABLE_DEV_PROXY !== 'true'
  const devPort = Number(env.VITE_DEV_SERVER_PORT || 5175)
  const previewPort = Number(env.VITE_PREVIEW_PORT || 4175)

  const serverConfig = {
    port: devPort,
  }

  if (shouldProxy) {
    serverConfig.proxy = {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
      },
    }
  }

  return {
    plugins: [react(), spa404Fallback()],
    server: serverConfig,
    preview: {
      port: previewPort,
    },
  }
})
