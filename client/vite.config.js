import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-core':  ['react', 'react-dom', 'react-router-dom'],
          'supabase':    ['@supabase/supabase-js'],
          'i18n':        ['i18next', 'react-i18next'],
          'lucide':      ['lucide-react'],
          'charts':      ['recharts'],
          'xlsx':        ['xlsx'],
        },
      },
    },
  },
})
