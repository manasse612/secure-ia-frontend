// === Service de stockage unifié Web + Mobile ===
// Utilise localStorage sur web, Capacitor Preferences sur mobile

import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'

const isMobile = Capacitor.isNativePlatform()

export const storage = {
  /**
   * Stocker une valeur
   * @param {string} key - Clé
   * @param {any} value - Valeur (sera JSON.stringify)
   */
  set: async (key, value) => {
    const stringValue = JSON.stringify(value)
    if (isMobile) {
      await Preferences.set({ key, value: stringValue })
    } else {
      localStorage.setItem(key, stringValue)
    }
  },

  /**
   * Récupérer une valeur
   * @param {string} key - Clé
   * @returns {any} Valeur parsée ou null
   */
  get: async (key) => {
    let value
    if (isMobile) {
      const result = await Preferences.get({ key })
      value = result.value
    } else {
      value = localStorage.getItem(key)
    }
    
    if (value === null || value === undefined) return null
    
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  },

  /**
   * Supprimer une valeur
   * @param {string} key - Clé
   */
  remove: async (key) => {
    if (isMobile) {
      await Preferences.remove({ key })
    } else {
      localStorage.removeItem(key)
    }
  },

  /**
   * Vider tout le stockage
   */
  clear: async () => {
    if (isMobile) {
      await Preferences.clear()
    } else {
      localStorage.clear()
    }
  },

  /**
   * Vérifier si c'est la plateforme mobile
   */
  isNative: () => isMobile,
}

export default storage
