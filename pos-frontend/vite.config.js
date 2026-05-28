// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   test: {
//     globals: true,
//     environment: 'jsdom',
//     setupFiles: './src/test/setup.js',
//     css: false,
//   },
// })

//          /\/\/\/\/\ ORIGINAL


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 👇 ACÁ METEMOS TODA LA CONFIGURACIÓN DEL PROXY Y EL PERMISO DE NGROK
  server: {
    host: true,
    allowedHosts: [
      'elevating-cough-unease.ngrok-free.dev' // El link de tu ngrok
    ],
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000', // El puerto real de tu backend
        changeOrigin: true,
        secure: false,
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: false,
  },
})