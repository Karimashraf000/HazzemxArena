import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('three') || id.includes('@react-three')) return 'vendor-three';
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('styled-components')) return 'vendor-styled';
            return 'vendor-others';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
    sourcemap: false,
  },
})


