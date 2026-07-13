import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/backend': {
        target: 'https://mayasindu-backend.onrender.com',
        changeOrigin: true,
      }
    }
  }
})
