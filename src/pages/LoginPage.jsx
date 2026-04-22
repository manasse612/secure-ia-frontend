// === Page de connexion ===
// Formulaire de connexion avec email + mot de passe
// Redirige vers le tableau de bord après connexion réussie

import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { authService } from '../services/api'
import { Eye, EyeOff, Lock, Mail, ArrowRight, Shield } from 'lucide-react'
import { saveAuth, isAuthenticated } from '../services/auth'
import toast from 'react-hot-toast'

function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  // Détection app mobile (Capacitor)
  const isMobileApp = window.location.protocol === 'capacitor:' || 
                      import.meta.env.VITE_IS_MOBILE === 'true'
  const API_URL = isMobileApp 
    ? (import.meta.env.VITE_API_URL || 'http://10.13.53.201:8004')
    : ''

  // Gestion du login Google (web vs mobile)
  const handleGoogleLogin = () => {
    const platformParam = isMobileApp ? '&platform=mobile' : ''
    const googleAuthUrl = `${API_URL}/api/auth/google?redirect=${encodeURIComponent(redirectTo)}${platformParam}`
    
    if (isMobileApp) {
      // Sur mobile, ouvrir dans le navigateur système avec deep link de retour
      window.open(googleAuthUrl, '_system')
    } else {
      // Sur web, redirection normale
      window.location.href = `/api/auth/google?redirect=${encodeURIComponent(redirectTo)}`
    }
  }

  // Si déjà connecté, rediriger vers le dashboard
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />
  }

  // Afficher les erreurs provenant de l'URL (session expirée, Google OAuth, etc.)
  useState(() => {
    const error = searchParams.get('error')
    const errorMessages = {
      session_expired: 'Votre session a expiré. Vous étiez connecté sur un autre appareil.',
      already_connected: 'Ce compte est déjà connecté sur un autre appareil. Veuillez d\'abord vous déconnecter.',
      google_denied: 'Connexion Google annulée.',
      google_not_configured: 'Google OAuth n\'est pas configuré sur le serveur.',
      google_token_failed: 'Erreur lors de la connexion Google.',
      google_no_email: 'Impossible de récupérer l\'email depuis Google.',
      account_disabled: 'Ce compte a été désactivé.',
    }
    if (error && errorMessages[error]) {
      toast.error(errorMessages[error])
    }
  })

  // État du formulaire
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Appeler l'API de connexion
      const response = await authService.login({ email, password })

      // Sauvegarder les tokens et les infos utilisateur
      saveAuth(response.data)

      // Afficher un message de succès
      toast.success('Connexion réussie !')

      // Rediriger vers la page demandée ou le tableau de bord
      navigate(redirectTo)
    } catch (error) {
      const detail = error.response?.data?.detail || ''

      // Si l'email n'est pas vérifié, rediriger vers la page de vérification
      if (error.response?.status === 403 && detail.includes('vérifier votre adresse email')) {
        toast.error('Veuillez d\'abord vérifier votre email.')
        navigate(`/verify-email?email=${encodeURIComponent(email)}`)
        return
      }

      // Messages d'erreur lisibles
      const messages = {
        401: 'Email ou mot de passe incorrect. Vérifiez vos identifiants.',
        403: detail || 'Accès refusé.',
        409: 'Ce compte est déjà connecté ailleurs. Déconnectez-vous d\'abord.',
        429: 'Trop de tentatives. Réessayez dans quelques minutes.',
        500: 'Le serveur rencontre un problème. Réessayez plus tard.',
      }
      const msg = messages[error.response?.status] || detail || 'Impossible de se connecter. Vérifiez votre connexion internet.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* === Partie gauche : illustration style Telegram === */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-white tracking-tight">Secure IA</span>
        </div>

        <div>
          <h2 className="text-3xl font-semibold text-white mb-4 leading-tight">
            Protégez-vous contre la désinformation
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Analysez images, textes et sites web en quelques secondes grâce à notre intelligence artificielle avancée.
          </p>
        </div>

        <p className="text-white/60 text-sm">
          &copy; 2026 Secure IA – Plateforme de vérification de contenus numériques
        </p>
      </div>

      {/* === Partie droite : formulaire style Gmail === */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 sm:p-10">
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">Secure IA</span>
          </div>

          {/* Titre */}
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 tracking-tight">Bienvenue !</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Connectez-vous pour accéder à votre espace Secure IA.
          </p>

          {/* Formulaire de connexion */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Champ email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>
            </div>

            {/* Champ mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  required
                  className="w-full pl-11 pr-11 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Mot de passe oublié */}
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-full transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Se connecter <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Séparateur */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white dark:bg-[#1a1a1a] text-gray-400">ou</span>
            </div>
          </div>

          {/* Bouton Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 dark:border-gray-700 rounded-full font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuer avec Google
          </button>

          {/* Lien vers l'inscription */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Pas encore de compte ?{' '}
            <Link to={`/register${redirectTo !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} className="text-primary-600 font-medium hover:text-primary-700 transition-colors">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
