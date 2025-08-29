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
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.match(/react(|-dom|-router-dom)/)) return 'react';
              if (id.includes('@radix-ui')) return 'radix';
              if (id.match(/react-hook-form|@hookform|zod/)) return 'forms';
              if (id.match(/pdfkit|qrcode|otplib/)) return 'aux';
              if (id.match(/@tanstack|axios|jwt-decode|lucide-react|class-variance-authority|clsx/)) return 'vendor';
            }
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]'
        }
      }
    }
  }
})