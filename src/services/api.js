// === Service API principal ===
// Configure Axios pour communiquer avec le backend FastAPI
// Gère automatiquement les tokens JWT et le rafraîchissement

import axios from 'axios'
import secureStorage from '../utils/secureStorage'

// Détection environnement mobile (Capacitor)
const isMobileApp = window.location.protocol === 'capacitor:' || 
                    import.meta.env.VITE_IS_MOBILE === 'true'

// URL API : 
// - Production (Vercel) : utiliser VITE_API_URL (backend Render)
// - Local web : utiliser le proxy Vite (/api -> localhost:8004)
// - Mobile : utiliser IP locale ou VITE_API_URL
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL  // Production: URL complète du backend
  : (isMobileApp 
      ? 'http://10.13.53.201:8004'  // Mobile fallback
      : '/api')  // Local dev avec proxy

// Créer une instance Axios avec la configuration de base
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// --- Intercepteur de requêtes ---
// Ajoute automatiquement le token JWT à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = secureStorage.getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Log pour debugging (optionnel, à retirer en production)
    if (process.env.NODE_ENV === 'development') {
      console.log(`📡 ${config.method.toUpperCase()} ${config.url}`, config.params || config.data)
    }
    return config
  },
  (error) => Promise.reject(error)
)

// --- Intercepteur de réponses ---
// Gère le rafraîchissement automatique du token expiré
api.interceptors.response.use(
  (response) => {
    // Log pour debugging (optionnel)
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url}`, response.data)
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Si session expirée (connecté sur un autre appareil), déconnecter immédiatement
    const detail = error.response?.data?.detail || ''
    if (error.response?.status === 401 && detail.includes('autre appareil')) {
      secureStorage.clearTokens()
      window.location.href = '/login?error=session_expired'
      return Promise.reject(error)
    }

    // Si le token est expiré (401) et qu'on n'a pas déjà réessayé
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Tenter de rafraîchir le token
        const refreshToken = secureStorage.getRefreshToken()
        if (refreshToken) {
          const response = await axios.post('/api/auth/refresh', null, {
            params: { refresh_token: refreshToken },
          })

          const { access_token, refresh_token: newRefresh } = response.data
          secureStorage.setAccessToken(access_token)
          secureStorage.setRefreshToken(newRefresh)

          // Réessayer la requête originale avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Si le rafraîchissement échoue, déconnecter l'utilisateur
        secureStorage.clearTokens()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

// === Services d'authentification ===
export const authService = {
  // Inscrire un nouvel utilisateur
  register: (data) => api.post('/auth/register', data),

  // Connecter un utilisateur
  login: (data) => api.post('/auth/login', data),

  // Récupérer le profil de l'utilisateur connecté
  getProfile: () => api.get('/auth/me'),

  // Mettre à jour le profil
  updateProfile: (data) => api.put('/auth/me', data),

  // Changer le mot de passe
  changePassword: (data) => api.post('/auth/change-password', data),

  // Déconnexion (libère la session côté serveur)
  logout: () => api.post('/auth/logout'),

  // Supprimer le compte (RGPD)
  deleteAccount: () => api.delete('/auth/me'),

  // Récupérer les notifications
  getNotifications: () => api.get('/auth/notifications'),

  // Marquer une notification comme lue
  markNotificationRead: (id) => api.put(`/auth/notifications/${id}/read`),

  // Échanger un code temporaire contre les tokens JWT (OAuth sécurisé)
  exchangeToken: (exchangeCode) => api.post('/auth/exchange-token', { exchange_code: exchangeCode }),
}

// === Services d'analyse ===
export const analysisService = {
  // Analyser une image (par URL ou upload)
  analyzeImage: (formData) =>
    api.post('/analysis/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Analyser un texte
  analyzeText: (formData) =>
    api.post('/analysis/text', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Analyser une URL
  analyzeUrl: (formData) =>
    api.post('/analysis/url', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Analyser une vidéo (par URL ou upload)
  analyzeVideo: (formData) =>
    api.post('/analysis/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Récupérer le quota d'analyses restant (avec logs pour debug)
  getQuota: () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📡 Appel API /analysis/quota')
    }
    return api.get('/analysis/quota')
      .then(response => {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Réponse quota:', response.data)
        }
        return response
      })
      .catch(error => {
        console.error('❌ Erreur quota:', error.response?.data || error.message)
        throw error
      })
  },

  // Récupérer l'historique des analyses
  getHistory: (params) => api.get('/analysis/history', { params }),

  // Supprimer tout l'historique des analyses
  clearHistory: () => api.delete('/analysis/history'),

  // Récupérer une analyse par son ID
  getById: (id) => api.get(`/analysis/${id}`),

  // Exporter une analyse en PDF
  exportPdf: (id) => api.get(`/analysis/${id}/pdf`, { responseType: 'blob' }),
}

// === Services de paiement Stripe ===
export const paymentService = {
  // Créer une session de paiement Checkout
  checkout: (plan) => api.post('/payment/checkout', null, { params: { plan } }),

  // Annuler l'abonnement
  cancel: () => api.post('/payment/cancel'),

  // Obtenir le portail client Stripe
  getPortal: () => api.get('/payment/portal'),
}

// === Services d'administration ===
export const adminService = {
  // Récupérer le tableau de bord
  getDashboard: () => api.get('/admin/dashboard'),

  // Récupérer les stats d'activité (graphiques, API usage)
  getActivity: () => api.get('/admin/activity'),

  // Lister les utilisateurs
  getUsers: (params) => api.get('/admin/users', { params }),

  // Modifier le rôle d'un utilisateur
  updateUserRole: (userId, role) =>
    api.put(`/admin/users/${userId}/role`, { role }),

  // Suspendre un utilisateur
  suspendUser: (userId) => api.put(`/admin/users/${userId}/suspend`),

  // Récupérer les logs
  getLogs: (params) => api.get('/admin/logs', { params }),

  // Récupérer le quota d'un utilisateur
  getUserQuota: (userId) => api.get(`/admin/users/${userId}/quota`),

  // Modifier le quota d'un utilisateur
  updateUserQuota: (userId, maxAnalyses) =>
    api.put(`/admin/users/${userId}/quota`, { max_analyses_per_month: maxAnalyses }),

  // Réinitialiser le compteur d'analyses d'un utilisateur
  resetUserQuota: (userId) => api.put(`/admin/users/${userId}/reset-quota`),

  // Envoyer une notification
  sendNotification: (data) => api.post('/admin/notifications', data),

  // Lister les notifications envoyées
  getNotifications: (params) => api.get('/admin/notifications', { params }),

  // Lister les abonnements
  getSubscriptions: (params) => api.get('/admin/subscriptions', { params }),

  // Annuler un abonnement
  cancelSubscription: (subscriptionId) =>
    api.put(`/admin/subscriptions/${subscriptionId}/cancel`),

  // --- Configuration du site ---
  getConfig: () => api.get('/admin/config'),
  updateConfig: (key, value) => api.put(`/admin/config/${key}`, { value }),

  // --- Upload d'images ---
  uploadImage: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // --- Offres ---
  getOffers: () => api.get('/admin/offers'),
  createOffer: (data) => api.post('/admin/offers', data),
  updateOffer: (id, data) => api.put(`/admin/offers/${id}`, data),
  deleteOffer: (id) => api.delete(`/admin/offers/${id}`),

  // --- Supprimer un utilisateur ---
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
}

// === Services publics (sans auth) ===
export const publicService = {
  // Configuration publique (prix, quotas, plans)
  getConfig: () => api.get('/public/config'),

  // Offres actives
  getOffers: () => api.get('/public/offers'),

  // Mot de passe oublié
  forgotPassword: (email) => api.post('/public/forgot-password', null, { params: { email } }),

  // Vérifier le code de réinitialisation
  verifyResetCode: (email, code) =>
    api.post('/public/verify-reset-code', null, { params: { email, code } }),

  // Réinitialiser le mot de passe
  resetPassword: (email, code, new_password) =>
    api.post('/public/reset-password', null, { params: { email, code, new_password } }),

  // Vérifier l'email après inscription
  verifyEmail: (email, code) =>
    api.post('/public/verify-email', null, { params: { email, code } }),

  // Renvoyer le code de vérification
  resendVerification: (email) =>
    api.post('/public/resend-verification', null, { params: { email } }),
}

export default api