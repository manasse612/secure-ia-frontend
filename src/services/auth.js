// === Service de gestion de l'authentification côté client ===
// Gère le stockage des tokens, l'état de connexion et la déconnexion

import secureStorage from '../utils/secureStorage'

// --- Sauvegarder les données d'authentification après connexion ---
export const saveAuth = (data) => {
  secureStorage.setAccessToken(data.access_token)
  secureStorage.setRefreshToken(data.refresh_token)
  secureStorage.setUser(data.user)
}

// --- Supprimer les données d'authentification (déconnexion) ---
export const clearAuth = () => {
  secureStorage.clearTokens()
}

// --- Vérifier si l'utilisateur est connecté ---
export const isAuthenticated = () => {
  return secureStorage.isAuthenticated()
}

// --- Récupérer les informations de l'utilisateur connecté ---
export const getUser = () => {
  return secureStorage.getUser()
}

// --- Récupérer le token d'accès ---
export const getToken = () => {
  return secureStorage.getAccessToken()
}

// --- Vérifier si l'utilisateur est admin ---
export const isAdmin = () => {
  const user = getUser()
  return user?.role === 'admin'
}

// --- Vérifier si l'utilisateur a un plan Pro ou supérieur ---
export const isPro = () => {
  const user = getUser()
  return ['pro', 'business', 'admin'].includes(user?.role)
}

// --- Vérifier si l'utilisateur est sur le plan gratuit ---
export const isFree = () => {
  const user = getUser()
  return !user?.role || user?.role === 'free'
}
