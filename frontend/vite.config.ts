import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig(() => {
  const plugins: any[] = [react()]
  if (process.env.ANALYZE === 'true') {
    plugins.push(visualizer({ open: true, filename: 'dist/stats.html', gzipSize: true, brotliSize: true }) as any)
  }
  return {
    plugins: plugins as any,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            radix: [
              '@radix-ui/react-label',
              '@radix-ui/react-select',
              '@radix-ui/react-slot',
              '@radix-ui/react-accordion',
              '@radix-ui/react-alert-dialog',
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu'
            ],
            forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
            vendor: ['axios', 'clsx', 'class-variance-authority', 'jwt-decode', 'lucide-react', '@tanstack/react-table']
          }
        }
      }
    }
  }
})