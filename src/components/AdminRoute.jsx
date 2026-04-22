// === Composant de protection des routes admin ===
// Redirige vers le dashboard si l'utilisateur n'est pas administrateur
// Enveloppe toutes les pages du back-office admin

import { Navigate, Outlet } from 'react-router-dom'
import { isAuthenticated, isAdmin } from '../services/auth'

function AdminRoute() {
  // Vérifier si l'utilisateur est connecté
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  // Vérifier si l'utilisateur est administrateur
  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />
  }

  // Afficher la page admin si autorisé
  return <Outlet />
}

export default AdminRoute
