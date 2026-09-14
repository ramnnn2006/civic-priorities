import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4173',
      '/health': 'http://localhost:4173'
    }
  },
  build: {
    target: 'es2022',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/scheduler/')) {
            return 'vendor-react'
          }
          if (id.includes('node_modules/lucide-react/')) {
            return 'vendor-icons'
          }
          if (id.includes('node_modules/thinking-orbs/')) {
            return 'vendor-orbs'
          }
        }
      }
    }
  }
})
