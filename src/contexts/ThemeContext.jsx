// === Contexte de thème (clair / sombre / système) ===
// Gère le basculement entre mode clair, sombre et auto (système)
// Sauvegarde la préférence dans le localStorage

import { createContext, useContext, useState, useEffect } from 'react'

// Créer le contexte
const ThemeContext = createContext()

// Hook personnalisé pour accéder au thème
export function useTheme() {
  return useContext(ThemeContext)
}

// Déterminer si le mode sombre est actif selon le mode choisi
function resolveIsDark(mode) {
  if (mode === 'dark') return true
  if (mode === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

// Fournisseur du contexte thème
export function ThemeProvider({ children }) {
  // Mode choisi par l'utilisateur : 'light', 'dark' ou 'system'
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('theme-mode') || 'system'
  })

  // État calculé : est-ce que le mode sombre est actif ?
  const [darkMode, setDarkMode] = useState(() => resolveIsDark(
    localStorage.getItem('theme-mode') || 'system'
  ))

  // Appliquer la classe 'dark' sur le document HTML quand darkMode change
  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [darkMode])

  // Écouter les changements de préférence système quand mode = 'system'
  useEffect(() => {
    if (themeMode !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => setDarkMode(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [themeMode])

  // Appliquer un thème spécifique (light, dark, system)
  const applyTheme = (mode) => {
    setThemeMode(mode)
    localStorage.setItem('theme-mode', mode)
    setDarkMode(resolveIsDark(mode))
  }

  // Basculer entre clair et sombre (raccourci)
  const toggleTheme = () => {
    applyTheme(darkMode ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{ darkMode, themeMode, toggleTheme, applyTheme, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}
