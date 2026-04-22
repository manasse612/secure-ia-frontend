// === Page d'inscription ===
// Formulaire de création de compte avec email + mot de passe
// Crée automatiquement un abonnement gratuit

import { useState } from 'react'
import { Link, useNavigate, useSearchParams, Navigate } from 'react-router-dom'
import { Shield, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { authService } from '../services/api'
import { saveAuth, isAuthenticated } from '../services/auth'
import toast from 'react-hot-toast'

function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  // Si déjà connecté, rediriger vers le dashboard
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />
  }

  // État du formulaire
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Vérifier que les mots de passe correspondent
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    // Vérifier la longueur du mot de passe
    if (password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setLoading(true)

    try {
      // Appeler l'API d'inscription
      const response = await authService.register({
        email,
        password,
        full_name: fullName || undefined,
      })

      // Rediriger vers la page de vérification d'email
      if (response.data.requires_verification) {
        toast.success('Compte créé ! Vérifiez votre email.')
        const params = new URLSearchParams({ email })
        if (response.data.code) params.set('code', response.data.code)
        navigate(`/verify-email?${params.toString()}`)
      } else {
        // Fallback : connexion directe (ne devrait plus arriver)
        saveAuth(response.data)
        toast.success('Compte créé avec succès !')
        navigate(redirectTo)
      }
    } catch (error) {
      const message = error.response?.data?.detail || "Une erreur est survenue. Veuillez réessayer."
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* === Partie gauche : illustration === */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-white tracking-tight">Secure IA</span>
        </div>

        <div>
          <h2 className="text-3xl font-semibold text-white mb-4 leading-tight">
            Rejoignez la communauté Secure IA
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Créez votre compte gratuit et commencez à vérifier vos contenus
            numériques dès aujourd'hui. 10 analyses offertes chaque mois.
          </p>
          <div className="mt-8 space-y-3">
            {['Inscription rapide et gratuite', 'Aucune carte bancaire requise', '10 analyses/mois incluses'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-white/90 text-sm">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-xs">✓</span>
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/60 text-sm">
          © 2026 Secure IA – Plateforme de vérification de contenus numériques
        </p>
      </div>

      {/* === Partie droite : formulaire === */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 sm:p-10">
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Secure IA</span>
          </div>

          {/* Titre */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Créer un compte</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Inscrivez-vous pour commencer à analyser vos contenus.
          </p>

          {/* Formulaire d'inscription */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Champ nom complet */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Nom complet <span className="text-gray-400 dark:text-gray-500">(optionnel)</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jean philippe"
                  className="input-field pl-11"
                />
              </div>
            </div>

            {/* Champ email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Adresse email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="input-field pl-11"
                />
              </div>
            </div>

            {/* Champ mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 caractères"
                  required
                  minLength={8}
                  className="input-field pl-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Champ confirmation mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Confirmer le mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Retapez le mot de passe"
                  required
                  className="input-field pl-11"
                />
              </div>
            </div>

            {/* Bouton d'inscription */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Créer mon compte <ArrowRight className="w-4 h-4" />
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
              <span className="px-3 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">ou</span>
            </div>
          </div>

          {/* Bouton Google OAuth */}
          <button
            type="button"
            onClick={() => {
              window.location.href = `/api/auth/google?redirect=${encodeURIComponent(redirectTo)}`
            }}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuer avec Google
          </button>

          {/* Lien vers la connexion */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Déjà inscrit ?{' '}
            <Link to={`/login${redirectTo !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} className="text-primary-600 font-medium hover:text-primary-700">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
