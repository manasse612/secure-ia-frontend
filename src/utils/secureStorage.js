/**
 * Utilitaire de stockage pour les tokens JWT
 * Utilise localStorage standard - simple et fiable
 * La sécurité vient du JWT (signé) et du HTTPS, pas du stockage
 */

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'secureia_access_token',
  REFRESH_TOKEN: 'secureia_refresh_token',
  USER: 'secureia_user',
};

/**
 * Stocker les tokens - Simple et robuste avec localStorage
 */
export const secureStorage = {
  /** Stocker le token d'accès */
  setAccessToken(token) {
    if (!token) return;
    try {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    } catch (e) {
      console.warn('localStorage non disponible');
    }
  },

  /** Récupérer le token d'accès */
  getAccessToken() {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (e) {
      return null;
    }
  },

  /** Stocker le refresh token */
  setRefreshToken(token) {
    if (!token) return;
    try {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    } catch (e) {
      console.warn('localStorage non disponible');
    }
  },

  /** Récupérer le refresh token */
  getRefreshToken() {
    try {
      return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (e) {
      return null;
    }
  },

  /** Stocker les informations utilisateur */
  setUser(user) {
    if (!user) return;
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.warn('localStorage non disponible');
    }
  },

  /** Récupérer les informations utilisateur */
  getUser() {
    try {
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);
      if (!userStr) return null;
      return JSON.parse(userStr);
    } catch (e) {
      console.error('Erreur parsing user:', e);
      return null;
    }
  },

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated() {
    const token = this.getAccessToken();
    if (!token) return false;
    
    // Vérifier la validité du token (format JWT)
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    try {
      // Décoder le payload pour vérifier l'expiration
      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        // Token expiré
        this.clearTokens();
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  },

  /** Effacer tous les tokens (déconnexion) */
  clearTokens() {
    try {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch (e) {
      console.warn('localStorage non disponible');
    }
  },

  /**
   * Décoder le payload du token JWT
   */
  decodeToken(token) {
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      return JSON.parse(atob(parts[1]));
    } catch (e) {
      return null;
    }
  },

  /**
   * Vérifier si le token doit être rafraîchi
   */
  shouldRefreshToken() {
    const token = this.getAccessToken();
    if (!token) return true;
    
    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) return true;
      
      // Rafraîchir si le token expire dans moins de 5 minutes
      const expiresIn = payload.exp * 1000 - Date.now();
      return expiresIn < 5 * 60 * 1000;
    } catch (e) {
      return true;
    }
  },
};

/**
 * Hook React pour utiliser le secureStorage
 */
export const useSecureStorage = () => secureStorage;

export default secureStorage;
