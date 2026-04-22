// === Page mot de passe oublié ===
// Permet de demander un code de vérification par email
// Puis de vérifier le code et réinitialiser le mot de passe

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, Mail, KeyRound, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import { publicService } from '../services/api'
import toast from 'react-hot-toast'

function ForgotPasswordPage() {
  const navigate = useNavigate()

  // Étape : 'email' → 'code' → 'reset' → 'done'
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Étape 1 : Envoyer le code
  const handleSendCode = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    try {
      const res = await publicService.forgotPassword(email)
      toast.success('Code envoyé !')
      setStep('code')
    } catch (error) {
      const msg = error.response?.data?.detail || 'Impossible d\'envoyer le code. Vérifiez votre email et réessayez.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // Étape 2 : Vérifier le code automatiquement quand 6 chiffres sont entrés
  useEffect(() => {
    if (code.length === 6 && step === 'code' && !loading) {
      handleVerifyCode()
    }
  }, [code, step])

  const handleVerifyCode = async (e) => {
    if (e) e.preventDefault()
    if (!code.trim() || code.length !== 6) {
      toast.error('Veuillez entrer un code à 6 chiffres')
      return
    }

    setLoading(true)
    try {
      await publicService.verifyResetCode(email, code)
      toast.success('Code vérifié !')
      setStep('reset')
    } catch (error) {
      const msg = error.response?.data?.detail || 'Code invalide ou expiré. Vérifiez le code et réessayez.'
      toast.error(msg)
      setCode('') // Réinitialiser le code pour réessayer
    } finally {
      setLoading(false)
    }
  }

  // Étape 3 : Réinitialiser le mot de passe
  const handleResetPassword = async (e) => {
    e.preventDefault()

    if (newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)
    try {
      await publicService.resetPassword(email, code, newPassword)
      toast.success('Mot de passe réinitialisé !')
      setStep('done')
    } catch (error) {
      const msg = error.response?.data?.detail || 'Impossible de réinitialiser le mot de passe. Réessayez.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Partie gauche */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-white tracking-tight">Secure IA</span>
        </div>
        <div>
          <h2 className="text-3xl font-semibold text-white mb-4 leading-tight">
            Récupérez votre accès
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Un code de vérification sera envoyé à votre adresse email
            pour réinitialiser votre mot de passe en toute sécurité.
          </p>
        </div>
        <p className="text-white/60 text-sm">
          © 2026 Secure IA – Plateforme de vérification de contenus numériques
        </p>
      </div>

      {/* Partie droite : formulaires */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 sm:p-10">
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Secure IA</span>
          </div>

          {/* === Étape 1 : Email === */}
          {step === 'email' && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Mot de passe oublié
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                Entrez votre email pour recevoir un code de vérification.
              </p>

              <form onSubmit={handleSendCode} className="space-y-5">
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
                      className="input-field pl-11"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Envoyer le code <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            </>
          )}

          {/* === Étape 2 : Code === */}
          {step === 'code' && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Vérification
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                Entrez le code à 6 chiffres envoyé à <strong>{email}</strong>
              </p>

              <form onSubmit={handleVerifyCode} className="space-y-5">
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
                      className="input-field pl-11 text-center text-2xl tracking-[0.3em] font-mono"
                    />
                  </div>
                </div>

                {loading && (
                  <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                    <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-primary-600 rounded-full animate-spin" />
                    <span>Vérification en cours...</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="w-full text-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Changer d'email
                </button>
              </form>
            </>
          )}

          {/* === Étape 3 : Nouveau mot de passe === */}
          {step === 'reset' && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Nouveau mot de passe
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                Choisissez un nouveau mot de passe sécurisé.
              </p>

              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Confirmer le mot de passe
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

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Réinitialiser <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            </>
          )}

          {/* === Étape 4 : Succès === */}
          {step === 'done' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Mot de passe réinitialisé !
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>
              <Link to="/login" className="btn-primary inline-flex items-center gap-2">
                Se connecter <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Lien retour */}
          {step !== 'done' && (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">
                Retour à la connexion
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
