// === Page de profil utilisateur ===
// Permet de voir et modifier les informations personnelles
// Gère le changement de mot de passe, le thème et la suppression de compte
// Affiche le plan d'abonnement et les statistiques du compte

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Mail, Shield, Globe2, Save, Loader2, CreditCard, Zap,
  Lock, Sun, Moon, Monitor, Trash2, Eye, EyeOff, AlertTriangle,
  CheckCircle, X, ArrowRight, Crown
} from 'lucide-react'
import { authService, publicService, paymentService } from '../services/api'
import { getUser, clearAuth, saveAuth } from '../services/auth'
import { useTheme } from '../contexts/ThemeContext'
import toast from 'react-hot-toast'

function ProfilePage() {
  const currentUser = getUser()
  const navigate = useNavigate()
  const { darkMode, themeMode, applyTheme } = useTheme()

  // État du formulaire de profil
  const [fullName, setFullName] = useState(currentUser?.full_name || '')
  const [language, setLanguage] = useState(currentUser?.language || 'fr')
  const [loading, setLoading] = useState(false)

  // État du changement de mot de passe
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  // État de la suppression de compte
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // État du modal d'upgrade
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [plans, setPlans] = useState(null)
  const [plansLoading, setPlansLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(null)
  const [cancelLoading, setCancelLoading] = useState(false)

  // Sauvegarder les modifications du profil
  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await authService.updateProfile({
        full_name: fullName,
        language: language,
      })

      // Mettre à jour les données locales
      const updatedUser = { ...currentUser, ...response.data }
      localStorage.setItem('user', JSON.stringify(updatedUser))

      toast.success('Profil mis à jour avec succès !')
    } catch (error) {
      const msg = error.response?.data?.detail || 'Impossible de mettre à jour votre profil. Réessayez.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // Changer le mot de passe
  const handleChangePassword = async (e) => {
    e.preventDefault()

    // Vérifier que les mots de passe correspondent
    if (newPassword !== confirmNewPassword) {
      toast.error('Les nouveaux mots de passe ne correspondent pas')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Le nouveau mot de passe doit contenir au moins 8 caractères')
      return
    }

    setPasswordLoading(true)
    try {
      await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      })

      toast.success('Mot de passe modifié avec succès !')
      // Réinitialiser le formulaire
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
      setShowPasswordForm(false)
    } catch (error) {
      const msg = error.response?.data?.detail || 'Impossible de modifier le mot de passe. Vérifiez votre mot de passe actuel.'
      toast.error(msg)
    } finally {
      setPasswordLoading(false)
    }
  }

  // Supprimer le compte
  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    try {
      await authService.deleteAccount()
      toast.success('Compte supprimé avec succès')
      clearAuth()
      navigate('/login')
    } catch (error) {
      const msg = error.response?.data?.detail || 'Impossible de supprimer votre compte. Réessayez plus tard.'
      toast.error(msg)
    } finally {
      setDeleteLoading(false)
    }
  }


  // Charger les plans dynamiquement depuis l'API
  const loadPlans = async () => {
    setPlansLoading(true)
    try {
      const res = await publicService.getConfig()
      const { pricing, quotas } = res.data
      setPlans({ pricing, quotas })
    } catch {
      toast.error('Impossible de charger les tarifs')
    } finally {
      setPlansLoading(false)
    }
  }

  const openUpgradeModal = () => {
    setShowUpgradeModal(true)
    if (!plans) loadPlans()
  }

  const handleCheckout = async (plan) => {
    setCheckoutLoading(plan)
    try {
      const res = await paymentService.checkout(plan)
      const { checkout_url, mode } = res.data
      if (mode === 'simulation') {
        toast.success(`Paiement simul\u00e9 pour le plan ${plan}`)
        navigate(`/payment/success?plan=${plan}&simulated=true`)
      } else if (checkout_url) {
        window.location.href = checkout_url
      }
    } catch (error) {
      const msg = error.response?.data?.detail || 'Erreur lors du paiement'
      toast.error(msg)
    } finally {
      setCheckoutLoading(null)
    }
  }

  const handleCancelSubscription = async () => {
    setCancelLoading(true)
    try {
      await paymentService.cancel()
      toast.success('Abonnement annul\u00e9. Vous repasserez en plan gratuit.')
      // Mettre \u00e0 jour le user local
      const refreshed = await authService.getProfile()
      const updatedUser = refreshed.data
      localStorage.setItem('user', JSON.stringify(updatedUser))
      window.location.reload()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de l\'annulation')
    } finally {
      setCancelLoading(false)
    }
  }

  // Informations sur le plan actuel (dynamique si plans chargés)
  const getPlanInfo = (role) => {
    const p = plans?.pricing || {}
    const q = plans?.quotas || {}
    const infos = {
      free: { name: 'Gratuit', price: '0€/mois', limit: `${q.free || 10} analyses/mois`, color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
      pro: { name: 'Pro', price: `${(p.pro || 29.90).toFixed(2).replace('.', ',')}€/mois`, limit: `${q.pro || 500} analyses/mois`, color: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' },
      business: { name: 'Business', price: `${(p.business || 99.90).toFixed(2).replace('.', ',')}€/mois`, limit: `${q.business || 5000} analyses/mois`, color: 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400' },
      admin: { name: 'Administrateur', price: 'N/A', limit: 'Illimité', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    }
    return infos[role] || infos.free
  }

  // Charger les plans au montage pour afficher les prix dynamiques
  useEffect(() => { loadPlans() }, [])

  const planInfo = getPlanInfo(currentUser?.role)

  return (
    <div className="animate-fade-in max-w-3xl">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/40 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mon profil</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400">Gérez vos informations personnelles et votre abonnement.</p>
      </div>

      {/* === Section : Informations personnelles === */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations personnelles</h2>

        <div className="space-y-4">
          {/* Avatar et email (lecture seule) */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-primary-700 dark:text-primary-400">
                {currentUser?.full_name?.[0] || currentUser?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{currentUser?.email}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                Inscrit via {currentUser?.auth_provider || 'email'}
              </p>
            </div>
          </div>

          {/* Champ nom complet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Nom complet
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Votre nom complet"
                className="input-field pl-11"
              />
            </div>
          </div>

          {/* Champ email (lecture seule) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Adresse email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={currentUser?.email || ''}
                disabled
                className="input-field pl-11 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">L'email ne peut pas être modifié</p>
          </div>

          {/* Langue préférée */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Langue préférée
            </label>
            <div className="relative">
              <Globe2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="input-field pl-11"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>

          {/* Bouton sauvegarder */}
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Sauvegarder
          </button>
        </div>
      </div>

      {/* === Section : Apparence === */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Apparence</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Choisissez le thème de l'interface selon vos préférences.
        </p>

        <div className="grid grid-cols-3 gap-3">
          {/* Option Clair */}
          <button
            onClick={() => applyTheme('light')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
              ${themeMode === 'light'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
          >
            <Sun className={`w-6 h-6 ${themeMode === 'light' ? 'text-primary-600' : 'text-gray-400 dark:text-gray-500'}`} />
            <span className={`text-sm font-medium ${themeMode === 'light' ? 'text-primary-700 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'}`}>
              Clair
            </span>
          </button>

          {/* Option Sombre */}
          <button
            onClick={() => applyTheme('dark')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
              ${themeMode === 'dark'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
          >
            <Moon className={`w-6 h-6 ${themeMode === 'dark' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`} />
            <span className={`text-sm font-medium ${themeMode === 'dark' ? 'text-primary-700 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'}`}>
              Sombre
            </span>
          </button>

          {/* Option Système */}
          <button
            onClick={() => applyTheme('system')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
              ${themeMode === 'system'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
          >
            <Monitor className={`w-6 h-6 ${themeMode === 'system' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`} />
            <span className={`text-sm font-medium ${themeMode === 'system' ? 'text-primary-700 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'}`}>Système</span>
          </button>
        </div>
      </div>

      {/* === Section : Abonnement === */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Mon abonnement</h2>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-4 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${planInfo.color}`}>
              {planInfo.name}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">{planInfo.price}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{planInfo.limit}</p>
            </div>
          </div>
          <Zap className="w-5 h-5 text-yellow-500 flex-shrink-0" />
        </div>

        {/* Bouton upgrade pour les plans gratuit ou pro */}
        {(currentUser?.role === 'free' || currentUser?.role === 'pro') && (
          <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-100 dark:border-primary-800">
            <p className="text-sm text-primary-800 dark:text-primary-300 mb-3">
              {currentUser?.role === 'free'
                ? <><strong>Passez au plan Pro</strong> pour débloquer plus d'analyses, l'analyse vidéo et le fact-checking avancé.</>
                : <><strong>Passez au Business</strong> pour l'accès API, équipe et support dédié.</>
              }
            </p>
            <button onClick={openUpgradeModal} className="btn-primary text-sm flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Changer d'abonnement
            </button>
          </div>
        )}

        {/* Bouton annuler pour les abonnés payants */}
        {(currentUser?.role === 'pro' || currentUser?.role === 'business') && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleCancelSubscription}
              disabled={cancelLoading}
              className="text-sm text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors flex items-center gap-1"
            >
              {cancelLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Annuler mon abonnement
            </button>
          </div>
        )}
      </div>

      {/* === Modal d'upgrade d'abonnement === */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowUpgradeModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Changer d'abonnement</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choisissez le plan qui vous convient</p>
              </div>
              <button onClick={() => setShowUpgradeModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Plans */}
            <div className="p-6">
              {plansLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                </div>
              ) : plans ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Plan Pro */}
                  <div className={`relative rounded-xl border-2 p-5 transition-all ${
                    currentUser?.role === 'pro'
                      ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600'
                  }`}>
                    {currentUser?.role === 'pro' && (
                      <div className="absolute -top-2.5 left-4 bg-primary-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                        Plan actuel
                      </div>
                    )}
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Pro</h4>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {(plans.pricing.pro || 29.90).toFixed(2).replace('.', ',')}€
                      <span className="text-sm font-normal text-gray-500">/mois</span>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{plans.quotas.pro || 500} analyses/mois</p>
                    <ul className="space-y-2 mb-5 text-sm">
                      {['Analyse d\'images avancée', 'Fact-checking GPT-4', 'Analyse vidéo deepfake', 'Historique complet', 'Support prioritaire'].map(f => (
                        <li key={f} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleCheckout('pro')}
                      disabled={currentUser?.role === 'pro' || checkoutLoading === 'pro'}
                      className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                        currentUser?.role === 'pro'
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'btn-primary'
                      }`}
                    >
                      {checkoutLoading === 'pro' ? <Loader2 className="w-4 h-4 animate-spin" /> : currentUser?.role === 'pro' ? 'Plan actuel' : <>Souscrire <ArrowRight className="w-4 h-4" /></>}
                    </button>
                  </div>

                  {/* Plan Business */}
                  <div className={`relative rounded-xl border-2 p-5 transition-all ${
                    currentUser?.role === 'business'
                      ? 'border-accent-500 bg-accent-50/50 dark:bg-accent-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-accent-300 dark:hover:border-accent-600'
                  }`}>
                    {currentUser?.role === 'business' && (
                      <div className="absolute -top-2.5 left-4 bg-accent-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                        Plan actuel
                      </div>
                    )}
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Business</h4>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {(plans.pricing.business || 99.90).toFixed(2).replace('.', ',')}€
                      <span className="text-sm font-normal text-gray-500">/mois</span>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{plans.quotas.business || 5000} analyses/mois</p>
                    <ul className="space-y-2 mb-5 text-sm">
                      {['Tout le plan Pro', 'API + clés d\'accès', 'Équipe (5 membres)', 'Exports CSV', 'Support dédié'].map(f => (
                        <li key={f} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleCheckout('business')}
                      disabled={currentUser?.role === 'business' || checkoutLoading === 'business'}
                      className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                        currentUser?.role === 'business'
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'btn-primary'
                      }`}
                    >
                      {checkoutLoading === 'business' ? <Loader2 className="w-4 h-4 animate-spin" /> : currentUser?.role === 'business' ? 'Plan actuel' : <>Souscrire <ArrowRight className="w-4 h-4" /></>}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">Impossible de charger les plans</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* === Section : Sécurité === */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sécurité</h2>

        <div className="space-y-3">
          {/* Mot de passe */}
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Mot de passe</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Changez votre mot de passe régulièrement</p>
              </div>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="btn-secondary text-sm py-1.5"
              >
                {showPasswordForm ? 'Annuler' : 'Changer'}
              </button>
            </div>

            {/* Formulaire de changement de mot de passe */}
            {showPasswordForm && (
              <form onSubmit={handleChangePassword} className="mt-4 space-y-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Mot de passe actuel</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="input-field pl-10 pr-10 text-sm py-2"
                      placeholder="Votre mot de passe actuel"
                    />
                    <button type="button" onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nouveau mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      className="input-field pl-10 text-sm py-2"
                      placeholder="Minimum 8 caractères"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Confirmer le nouveau mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      className="input-field pl-10 text-sm py-2"
                      placeholder="Retapez le nouveau mot de passe"
                    />
                  </div>
                </div>
                <button type="submit" disabled={passwordLoading} className="btn-primary text-sm flex items-center gap-2">
                  {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                  Modifier le mot de passe
                </button>
              </form>
            )}
          </div>

          {/* Vérification email */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Vérification email</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {currentUser?.is_verified ? 'Email vérifié' : 'Email non vérifié'}
              </p>
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              currentUser?.is_verified
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            }`}>
              {currentUser?.is_verified ? 'Vérifié' : 'Non vérifié'}
            </span>
          </div>

          {/* Supprimer le compte */}
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Supprimer mon compte</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Supprime définitivement votre compte et vos données (RGPD)</p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                className="btn-danger text-sm py-1.5 px-4"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Confirmation de suppression */}
            {showDeleteConfirm && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                      Cette action est irréversible
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400 mb-3">
                      Toutes vos données, analyses et historique seront définitivement supprimés.
                      Cette action ne peut pas être annulée.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleteLoading}
                        className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2"
                      >
                        {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Oui, supprimer mon compte
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
