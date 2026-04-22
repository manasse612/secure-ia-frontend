// === Page de gestion des utilisateurs (Admin) ===
// Liste tous les utilisateurs avec recherche, filtrage et actions
// Permet de suspendre, modifier le rôle ou consulter un profil

import { useState, useEffect } from 'react'
import {
  Users, Search, ChevronLeft, ChevronRight, Shield,
  UserX, UserCheck, Loader2, Filter, Settings, RotateCcw, X,
  AlertTriangle, Trash2
} from 'lucide-react'
import { adminService } from '../../services/api'
import toast from 'react-hot-toast'

// Liste des rôles valides
const VALID_ROLES = ['free', 'pro', 'business', 'admin']

function AdminUsers() {
  // État du composant
  const [users, setUsers] = useState([])           // Liste des utilisateurs
  const [total, setTotal] = useState(0)             // Nombre total
  const [page, setPage] = useState(1)               // Page actuelle
  const [perPage] = useState(20)                    // Résultats par page
  const [totalPages, setTotalPages] = useState(1)    // Nombre total de pages
  const [search, setSearch] = useState('')          // Recherche
  const [roleFilter, setRoleFilter] = useState('')  // Filtre par rôle
  const [loading, setLoading] = useState(true)      // Chargement en cours

  // Quota modal
  const [quotaModal, setQuotaModal] = useState(null)  // user object or null
  const [quotaValue, setQuotaValue] = useState('')
  const [quotaLoading, setQuotaLoading] = useState(false)

  // Confirmation modal pour suspension
  const [suspendConfirm, setSuspendConfirm] = useState(null) // { user, action }

  // Charger les utilisateurs quand les filtres changent
  useEffect(() => {
    loadUsers()
  }, [page, roleFilter])

  // Charger avec un délai pour la recherche (debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      loadUsers()
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  // Appeler l'API pour récupérer les utilisateurs
  const loadUsers = async () => {
    setLoading(true)
    
    try {
      const params = { page, per_page: perPage }
      if (search) params.search = search
      if (roleFilter) params.role = roleFilter

      const response = await adminService.getUsers(params)
      setUsers(response.data.users || [])
      setTotal(response.data.total || 0)
      setTotalPages(Math.ceil((response.data.total || 0) / perPage))
      
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error)
      
      if (error.response?.status === 401) {
        toast.error("Non autorisé. Veuillez vous reconnecter.")
      } else if (error.response?.status === 403) {
        toast.error("Accès refusé. Droits administrateur requis.")
      } else if (error.response?.status === 429) {
        toast.error("Trop de requêtes. Attendez quelques secondes.")
        // Réessayer automatiquement après 2 secondes
        setTimeout(() => loadUsers(), 2000)
        return
      } else {
        toast.error(error.response?.data?.detail || "Erreur lors du chargement des utilisateurs")
      }
      
    } finally {
      setLoading(false)
    }
  }

  // Suspendre ou réactiver un utilisateur avec confirmation
  const confirmSuspend = (user) => {
    setSuspendConfirm({
      user,
      action: user.is_active ? 'suspendre' : 'réactiver'
    })
  }

  const handleSuspend = async () => {
    if (!suspendConfirm) return
    
    const { user } = suspendConfirm
    const newStatus = !user.is_active
    
    try {
      await adminService.suspendUser(user.id)
      toast.success(`Utilisateur ${newStatus ? 'réactivé' : 'suspendu'}`)
      setSuspendConfirm(null)
      loadUsers()
    } catch (error) {
      toast.error("Erreur lors de la modification")
    }
  }

  // Supprimer un utilisateur
  const handleDeleteUser = async (user) => {
    if (!confirm(`Supprimer définitivement ${user.email} ? Cette action est irréversible.`)) return
    try {
      await adminService.deleteUser(user.id)
      toast.success(`Utilisateur ${user.email} supprimé`)
      loadUsers()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de la suppression')
    }
  }

  // Changer le rôle d'un utilisateur avec validation
  const handleRoleChange = async (userId, newRole) => {
    // Vérifier que le rôle est valide
    if (!VALID_ROLES.includes(newRole)) {
      toast.error(`Rôle invalide: ${newRole}`)
      return
    }

    // Confirmation pour le rôle admin
    if (newRole === 'admin') {
      if (!confirm("ATTENTION: Donner le rôle admin à un utilisateur lui donne tous les droits. Continuer ?")) {
        return
      }
    }

    try {
      await adminService.updateUserRole(userId, newRole)
      toast.success(`Rôle mis à jour : ${newRole}`)
      loadUsers()
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors du changement de rôle")
    }
  }

  // Modifier le quota d'un utilisateur
  const openQuotaModal = async (user) => {
    setQuotaModal(user)
    setQuotaValue('')
    
    try {
      const res = await adminService.getUserQuota(user.id)
      const currentQuota = res.data.subscription?.max_analyses_per_month || '10'
      setQuotaValue(currentQuota)
    } catch (error) {
      console.warn('Erreur chargement quota, utilisation valeur par défaut:', error)
      setQuotaValue('10')
      
      if (error.response?.status === 404) {
        toast.error("Abonnement non trouvé pour cet utilisateur")
      }
    }
  }

  const handleSaveQuota = async () => {
    if (!quotaModal) return
    if (!quotaValue || parseInt(quotaValue) < 0) {
      toast.error("Veuillez saisir un quota valide")
      return
    }

    setQuotaLoading(true)
    try {
      await adminService.updateUserQuota(quotaModal.id, quotaValue)
      toast.success(`Quota mis à jour : ${quotaValue} analyses/mois`)
      setQuotaModal(null)
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de la mise à jour du quota')
    } finally {
      setQuotaLoading(false)
    }
  }

  const handleResetQuota = async (userId) => {
    if (!confirm("Réinitialiser le compteur d'analyses à zéro ?")) {
      return
    }

    try {
      await adminService.resetUserQuota(userId)
      toast.success('Compteur réinitialisé')
      setQuotaModal(null)
      loadUsers()
    } catch (error) {
      toast.error('Erreur lors de la réinitialisation')
    }
  }

  // Badge de rôle avec couleur et support mode sombre
  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      business: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      pro: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      public: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    }
    return (
      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${styles[role] || styles.public}`}>
        {role}
      </span>
    )
  }

  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="animate-fade-in">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des utilisateurs</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            {total} utilisateur(s) enregistré(s)
          </p>
        </div>

        {/* Bouton rafraîchir */}
        <button
          onClick={loadUsers}
          className="btn-secondary py-2 px-3 flex items-center gap-2 self-start"
          disabled={loading}
        >
          <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Rafraîchir
        </button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Recherche */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par email ou nom..."
              className="input-field pl-11 pr-4 py-2 w-full"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filtre par rôle */}
          <div className="relative sm:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
              className="input-field pl-10 pr-8 py-2 w-full appearance-none"
            >
              <option value="">Tous les rôles</option>
              <option value="public">Public</option>
              <option value="pro">Pro</option>
              <option value="business">Business</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Résumé des filtres */}
          {(search || roleFilter) && (
            <button
              onClick={() => {
                setSearch('')
                setRoleFilter('')
              }}
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 whitespace-nowrap"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Chargement des utilisateurs...</p>
          </div>
        </div>
      ) : users.length > 0 ? (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Utilisateur</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Rôle</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Statut</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Inscription</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      {/* Utilisateur */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary-700 dark:text-primary-400">
                              {user.full_name?.[0] || user.email?.[0]?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {user.full_name || 'Sans nom'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Rôle (modifiable) */}
                      <td className="py-3 px-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="text-xs font-medium border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-200"
                          aria-label={`Changer le rôle de ${user.email}`}
                        >
                          {VALID_ROLES.map(role => (
                            <option key={role} value={role}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Statut */}
                      <td className="py-3 px-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          user.is_active
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {user.is_active ? 'Actif' : 'Suspendu'}
                        </span>
                      </td>

                      {/* Date d'inscription */}
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                        {formatDate(user.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openQuotaModal(user)}
                            className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors"
                            title="Gérer le quota d'analyses"
                          >
                            <Settings className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Quota</span>
                          </button>
                          <button
                            onClick={() => confirmSuspend(user)}
                            className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
                              user.is_active
                                ? 'text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40'
                                : 'text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40'
                            }`}
                            title={user.is_active ? 'Suspendre le compte' : 'Réactiver le compte'}
                          >
                            {user.is_active ? (
                              <><UserX className="w-3.5 h-3.5" /> Suspendre</>
                            ) : (
                              <><UserCheck className="w-3.5 h-3.5" /> Réactiver</>
                            )}
                          </button>
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors"
                              title="Supprimer définitivement"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Page {page} sur {totalPages}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="btn-secondary py-2 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Page précédente"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
                  {page} / {totalPages}
                </span>
                
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="btn-secondary py-2 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Page suivante"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-center py-16">
          <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Aucun utilisateur trouvé</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            {search || roleFilter 
              ? 'Essayez de modifier vos filtres'
              : 'Les utilisateurs apparaîtront ici'}
          </p>
          {(search || roleFilter) && (
            <button
              onClick={() => {
                setSearch('')
                setRoleFilter('')
              }}
              className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Effacer tous les filtres
            </button>
          )}
        </div>
      )}

      {/* === Modal confirmation suspension === */}
      {suspendConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSuspendConfirm(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirmer l'action
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Êtes-vous sûr de vouloir <strong className="text-gray-900 dark:text-white">
                {suspendConfirm.action}
              </strong> l'utilisateur <strong>{suspendConfirm.user.email}</strong> ?
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSuspend}
                className={`flex-1 px-4 py-2 rounded-lg text-white font-medium ${
                  suspendConfirm.action === 'suspendre'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                } transition-colors`}
              >
                Oui, {suspendConfirm.action}
              </button>
              <button
                onClick={() => setSuspendConfirm(null)}
                className="btn-secondary px-4 py-2"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === Modal quota === */}
      {quotaModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setQuotaModal(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gérer le quota</h3>
              <button 
                onClick={() => setQuotaModal(null)} 
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{quotaModal.full_name || 'Sans nom'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{quotaModal.email}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Limite mensuelle d'analyses
              </label>
              <input
                type="number"
                value={quotaValue}
                onChange={(e) => setQuotaValue(e.target.value)}
                min="0"
                className="input-field w-full"
                placeholder="Ex: 10, 500, 5000"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Nombre maximum d'analyses autorisées par mois
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveQuota}
                disabled={quotaLoading || !quotaValue}
                className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {quotaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
                Sauvegarder
              </button>
              <button
                onClick={() => handleResetQuota(quotaModal.id)}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <RotateCcw className="w-4 h-4" /> Réinit.
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers