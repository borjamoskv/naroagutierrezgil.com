import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuración optimizada de Vite con manualChunks function para Rolldown/Rollup
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three-core';
          if (id.includes('node_modules/@react-three')) return 'react-three';
          if (id.includes('node_modules/maath')) return 'maath';
        }
      }
    }
  }
})
