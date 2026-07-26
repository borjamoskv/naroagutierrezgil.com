import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuración optimizada de Vite con manualChunks function para Rolldown/Rollup
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('react/') || id.includes('react-dom/')) {
              return 'vendor-react'
            }
            if (id.includes('three') || id.includes('@react-three')) {
              return 'vendor-three'
            }
            if (id.includes('postprocessing')) {
              return 'vendor-postprocessing'
            }
            if (id.includes('framer-motion') || id.includes('maath')) {
              return 'vendor-motion'
            }
            return 'vendor-core'
          }
        }
      }
    }
  }
})
