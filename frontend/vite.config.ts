import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          // Core React runtime — smallest possible initial bundle
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor';
          }
          // Routing — loaded on every navigation
          if (id.includes('node_modules/react-router')) {
            return 'react-router';
          }
          // Server-state management
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'react-query';
          }
          // Animation library (largest UI dep — isolate for better caching)
          if (id.includes('node_modules/framer-motion')) {
            return 'framer-motion';
          }
          // Icon set — tree-shaken but still worth isolating
          if (id.includes('node_modules/lucide-react')) {
            return 'lucide-react';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})

