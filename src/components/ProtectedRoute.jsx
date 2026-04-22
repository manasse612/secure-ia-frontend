// === Composant de protection des routes ===
// Redirige vers la page de connexion si l'utilisateur n'est pas connecté
// Enveloppe toutes les pages qui nécessitent une authentification

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { isAuthenticated } from '../services/auth'

function ProtectedRoute() {
  const location = useLocation()

  // Vérifier si l'utilisateur est connecté
  if (!isAuthenticated()) {
    // Rediriger vers la page de connexion avec l'URL actuelle comme redirect
    const redirectPath = location.pathname + location.search
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirectPath)}`} replace />
  }

  // Afficher la page demandée si connecté
  return <Outlet />
}

export default ProtectedRoute
