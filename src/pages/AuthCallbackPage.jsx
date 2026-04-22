// === Page de callback OAuth sécurisée ===
// Reçoit un code d'échange temporaire depuis l'URL après connexion Google
// Échange ce code contre les tokens JWT via l'API backend
// Évite l'exposition des tokens dans l'historique navigateur

import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '../services/api'
import { secureStorage } from '../utils/secureStorage'
import { Loader2, AlertCircle } from 'lucide-react'

function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleCallback = async () => {
      const exchangeCode = searchParams.get('code')
      const redirect = searchParams.get('redirect') || '/dashboard'
      const errorParam = searchParams.get('error')

      if (errorParam) {
        navigate(`/login?error=${errorParam}`)
        return
      }

      if (!exchangeCode) {
        navigate('/login?error=missing_exchange_code')
        return
      }

      try {
        // Échanger le code contre les tokens JWT (appel API sécurisé)
        const response = await authService.exchangeToken(exchangeCode)
        const { access_token, refresh_token } = response.data

        // Sauvegarder les tokens de manière sécurisée
        secureStorage.setAccessToken(access_token)
        secureStorage.setRefreshToken(refresh_token)

        // Récupérer le profil utilisateur
        try {
          const profileRes = await authService.getProfile()
          secureStorage.setUser(profileRes.data)
        } catch {
          // En cas d'erreur, nettoyer et rediriger vers login
          secureStorage.clearTokens()
          navigate('/login?error=profile_failed')
          return
        }

        // Rediriger vers la page demandée
        navigate(redirect)
      } catch (err) {
        console.error('Exchange error:', err)
        setError(err.response?.data?.detail || 'Échec de la connexion')
        setTimeout(() => {
          navigate('/login?error=exchange_failed')
        }, 3000)
      }
    }

    handleCallback()
  }, [])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
          <p className="text-gray-500 text-sm mt-2">Redirection vers la page de connexion...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 font-medium">Connexion en cours...</p>
      </div>
    </div>
  )
}

export default AuthCallbackPage
