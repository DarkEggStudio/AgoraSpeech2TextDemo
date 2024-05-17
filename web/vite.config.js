import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  server: {
    // host: '127.0.0.1',//本机ip
    // port: 5173,
    // port: 5173,
    proxy: {
      '^/rtt-prod': {
        target: 'https://api.agora.io',
        secure: false,
        changeOrigin: true,
        WS: true,
        // PathRewrite: { '^/rtt-staging': '/api' }
        rewrite: (path) => path.replace(/^\/rtt-prod/, '')
      }
    }
  },
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  define: {
    "process.env": {}
  }
})
