import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

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
    plugins: [react()],
    server: serverConfig,
    preview: {
      port: previewPort,
    },
  }
})
