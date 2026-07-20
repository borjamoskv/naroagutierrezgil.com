import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  output: 'static',
  build: {
    format: 'directory',
  },
  vite: {
    // Para poder cargar wasm si fuera necesario por vite, 
    // aunque wasm-pack y wasm-bindgen a veces necesitan vite-plugin-wasm
  }
});
