// === Écran de chargement global ===
// Affiché au lancement de l'application ou lors de transitions longues

import { Shield } from 'lucide-react'

function LoadingScreen({ message = 'Chargement...' }) {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-[100]">
      <div className="text-center">
        {/* Logo animé */}
        <div className="relative mb-6">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="absolute inset-0 w-16 h-16 mx-auto rounded-2xl border-2 border-primary-400/30 animate-ping" />
        </div>

        {/* Barre de progression */}
        <div className="w-48 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full animate-loading-bar" />
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{message}</p>
      </div>
    </div>
  )
}

export default LoadingScreen
