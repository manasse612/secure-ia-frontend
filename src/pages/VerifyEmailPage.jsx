// === Page de vérification d'email ===
// Affichée après inscription pour entrer le code de vérification
// Permet de renvoyer le code et de se connecter automatiquement après vérification

import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Shield, Mail, KeyRound, ArrowRight, ArrowLeft, CheckCircle, RefreshCw } from 'lucide-react'
import { publicService } from '../services/api'
import { saveAuth } from '../services/auth'
import toast from 'react-hot-toast'

function VerifyEmailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const emailFromUrl = searchParams.get('email') || ''

  const [email] = useState(emailFromUrl)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [verified, setVerified] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Countdown pour le bouton "Renvoyer"
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Vérifier le code
  const handleVerify = async (e) => {
    e.preventDefault()
    if (!code.trim() || code.length !== 6) {
      toast.error('Veuillez entrer le code à 6 chiffres reçu par email.')
      return
    }

    setLoading(true)
    try {
      const res = await publicService.verifyEmail(email, code)

      // Connexion automatique après vérification
      if (res.data.access_token) {
        saveAuth(res.data)
        setVerified(true)
        toast.success('Email vérifié ! Bienvenue sur Secure IA.')

        // Rediriger vers le dashboard après 1.5s
        setTimeout(() => navigate('/dashboard'), 1500)
      }
    } catch (error) {
      const msg = error.response?.data?.detail || 'Code invalide ou expiré. Réessayez.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // Renvoyer le code
  const handleResend = async () => {
    if (countdown > 0) return
    setResending(true)
    try {
      const res = await publicService.resendVerification(email)
      toast.success('Nouveau code envoyé !')
      setCountdown(60)
    } catch (error) {
      toast.error('Impossible de renvoyer le code. Réessayez dans quelques instants.')
    } finally {
      setResending(false)
    }
  }

  if (!email) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 sm:p-10 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucun email à vérifier</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
            Inscrivez-vous d'abord pour recevoir un code de vérification.
          </p>
          <Link to="/register" className="btn-primary inline-flex items-center gap-2">
            Créer un compte <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
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
            Plus qu'une étape !
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Vérifiez votre adresse email pour activer votre compte
            et commencer à analyser vos contenus numériques.
          </p>
          <div className="mt-8 space-y-3">
            {['Sécurité renforcée', 'Protection anti-spam', 'Compte vérifié'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-white/90 text-sm">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3" />
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/60 text-sm">
          © 2026 Secure IA — Plateforme de vérification de contenus numériques
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

          {!verified ? (
            <>
              {/* Icône email */}
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                Vérifiez votre email
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mb-2 text-center text-sm">
                Nous avons envoyé un code à 6 chiffres à
              </p>
              <p className="text-primary-600 dark:text-primary-400 font-semibold text-center mb-6">
                {email}
              </p>

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Code de vérification
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      required
                      autoFocus
                      className="input-field pl-11 text-center text-2xl tracking-[0.3em] font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Vérifier mon email <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>

              {/* Renvoyer le code */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Vous n'avez pas reçu le code ?
                </p>
                <button
                  onClick={handleResend}
                  disabled={resending || countdown > 0}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
                  {countdown > 0
                    ? `Renvoyer dans ${countdown}s`
                    : 'Renvoyer le code'
                  }
                </button>
              </div>

              {/* Retour */}
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                <Link to="/register" className="text-primary-600 font-medium hover:text-primary-700 inline-flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" /> Retour à l'inscription
                </Link>
              </p>
            </>
          ) : (
            /* === Succès === */
            <div className="text-center animate-fade-in">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Email vérifié !
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Votre compte est activé. Redirection vers le tableau de bord...
              </p>
              <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VerifyEmailPage
