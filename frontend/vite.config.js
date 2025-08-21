import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // 1. path를 import합니다.

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 2. resolve.alias 옵션을 추가합니다.
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})