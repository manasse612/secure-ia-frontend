// === Stockage JWT unifié Web + Mobile (Async) ===
// Version asynchrone pour Capacitor/mobile

import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'

const isMobile = Capacitor.isNativePlatform()

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'secureia_access_token',
  REFRESH_TOKEN: 'secureia_refresh_token',
  USER: 'secureia_user',
}

export const secureStorageAsync = {
  /** Stocker le token d'accès (async) */
  async setAccessToken(token) {
    if (!token) return
    if (isMobile) {
      await Preferences.set({ key: STORAGE_KEYS.ACCESS_TOKEN, value: token })
    } else {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)
    }
  },

  /** Récupérer le token d'accès (async) */
  async getAccessToken() {
    if (isMobile) {
      const { value } = await Preferences.get({ key: STORAGE_KEYS.ACCESS_TOKEN })
      return value
    }
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  },

  /** Stocker le refresh token (async) */
  async setRefreshToken(token) {
    if (!token) return
    if (isMobile) {
      await Preferences.set({ key: STORAGE_KEYS.REFRESH_TOKEN, value: token })
    } else {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token)
    }
  },

  /** Récupérer le refresh token (async) */
  async getRefreshToken() {
    if (isMobile) {
      const { value } = await Preferences.get({ key: STORAGE_KEYS.REFRESH_TOKEN })
      return value
    }
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
  },

  /** Stocker les infos utilisateur (async) */
  async setUser(user) {
    if (!user) return
    const value = JSON.stringify(user)
    if (isMobile) {
      await Preferences.set({ key: STORAGE_KEYS.USER, value })
    } else {
      localStorage.setItem(STORAGE_KEYS.USER, value)
    }
  },

  /** Récupérer les infos utilisateur (async) */
  async getUser() {
    let value
    if (isMobile) {
      const result = await Preferences.get({ key: STORAGE_KEYS.USER })
      value = result.value
    } else {
      value = localStorage.getItem(STORAGE_KEYS.USER)
    }
    
    if (!value) return null
    try {
      return JSON.parse(value)
    } catch {
      return null
    }
  },

  /** Vérifier authentification (async) */
  async isAuthenticated() {
    const token = await this.getAccessToken()
    if (!token) return false
    
    const parts = token.split('.')
    if (parts.length !== 3) return false
    
    try {
      const payload = JSON.parse(atob(parts[1]))
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        await this.clearTokens()
        return false
      }
      return true
    } catch {
      return false
    }
  },

  /** Effacer tous les tokens (async) */
  async clearTokens() {
    if (isMobile) {
      await Preferences.remove({ key: STORAGE_KEYS.ACCESS_TOKEN })
      await Preferences.remove({ key: STORAGE_KEYS.REFRESH_TOKEN })
      await Preferences.remove({ key: STORAGE_KEYS.USER })
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER)
    }
  },

  /** Décoder token (sync, pas de stockage) */
  decodeToken(token) {
    if (!token) return null
    try {
      const parts = token.split('.')
      if (parts.length !== 3) return null
      return JSON.parse(atob(parts[1]))
    } catch {
      return null
    }
  },
}

export default secureStorageAsync
