import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  //1
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    }
  },
  //2
  plugins: [react()],
})
