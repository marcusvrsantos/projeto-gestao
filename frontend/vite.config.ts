import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Garante que funcione no Codespaces
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // A MÁGICA ESTÁ AQUI: Remove o "/api" antes de mandar pro backend
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
