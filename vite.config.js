// === Configuration Vite pour le frontend Secure IA ===
// Vite est le bundler utilisé pour le développement et la production

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Activer le plugin React (JSX, Fast Refresh)
  plugins: [react()],

  // Configuration du serveur de développement
  server: {
    port: 5173,        // Port du serveur frontend
    open: true,        // Ouvrir le navigateur automatiquement
    allowedHosts: [''], // ← ICI
    proxy: {
      // Rediriger les appels API vers le backend FastAPI (port 8004)
      '/api': {
        target: 'http://localhost:8004',
        changeOrigin: true,
      },
      // Servir les fichiers statiques (images uploadées) depuis le backend
      '/static': {
        target: 'http://localhost:8004',
        changeOrigin: true,
      },
    },
  },

  // Configuration de la construction (production)
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})