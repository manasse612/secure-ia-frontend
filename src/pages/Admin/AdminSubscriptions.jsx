// === Page de gestion des abonnements (Admin) ===
// Liste tous les abonnements avec leur statut, plan, dates
// Permet de filtrer, modifier, annuler des abonnements

import { useState, useEffect } from 'react'
import {
  CreditCard, Search, ChevronLeft, ChevronRight,
  AlertCircle, Loader2, Filter, RefreshCw, X,
  CheckCircle, XCircle, Clock, Calendar, DollarSign,
  Download
} from 'lucide-react'
import { adminService, publicService } from '../../services/api'
import toast from 'react-hot-toast'

function AdminSubscriptions() {
  // État du composant
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dynamicPricing, setDynamicPricing] = useState({ pro: 29.90, business: 99.90 })

  useEffect(() => {
    publicService.getConfig()
      .then(res => {
        const p = res.data?.pricing || {}
        setDynamicPricing({ pro: parseFloat(p.pro) || 29.90, business: parseFloat(p.business) || 99.90 })
      })
      .catch(() => {})
  }, [])

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
    perPage: 20
  })

  // Filtres
  const [statusFilter, setStatusFilter] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Statistiques rapides
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    cancelled: 0,
    expired: 0,
    monthlyRevenue: 0
  })

  // Charger les abonnements
  const loadSubscriptions = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = { 
        page: pagination.page, 
        per_page: pagination.perPage,
        search: searchQuery || undefined
      }
      if (statusFilter) params.status = statusFilter
      if (planFilter) params.plan = planFilter

      const response = await adminService.getSubscriptions(params)

      setSubscriptions(response.data.subscriptions || [])
      setPagination({
        page: response.data.page || 1,
        total: response.data.total || 0,
        totalPages: response.data.total_pages || 1,
        perPage: response.data.per_page || 20
      })

      // Calculer les stats
      const subs = response.data.subscriptions || []
      calculateStats(subs, response.data.total || 0)

    } catch (error) {
      console.error('Erreur chargement abonnements:', error)

      if (error.response?.status === 401) {
        setError("Non autorisé. Veuillez vous reconnecter.")
      } else if (error.response?.status === 403) {
        setError("Accès refusé. Droits administrateur requis.")
      } else if (error.response?.status === 429) {
        setError("Trop de requêtes. Attendez quelques secondes.")
        // Réessayer automatiquement après 2 secondes
        setTimeout(() => loadSubscriptions(), 2000)
        return
      } else {
        setError(error.response?.data?.detail || "Erreur lors du chargement des abonnements")
      }

    } finally {
      setLoading(false)
    }
  }

  // Calculer les statistiques
  const calculateStats = (subs, total) => {
    const active = subs.filter(s => s.status === 'active').length
    const cancelled = subs.filter(s => s.status === 'cancelled').length
    const expired = subs.filter(s => s.status === 'expired').length
    
    // Revenus mensuels (uniquement les actifs)
    const monthlyRevenue = subs
      .filter(s => s.status === 'active')
      .reduce((sum, s) => {
        if (s.plan === 'pro') return sum + dynamicPricing.pro
        if (s.plan === 'business') return sum + dynamicPricing.business
        return sum
      }, 0)
    
    setStats({
      total,
      active,
      cancelled,
      expired,
      monthlyRevenue
    })
  }

  // Charger au montage et quand les filtres changent
  useEffect(() => {
    loadSubscriptions()
  }, [pagination.page, statusFilter, planFilter])

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }))
      loadSubscriptions()
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Annuler un abonnement
  const handleCancelSubscription = async (subscriptionId) => {
    if (!confirm("Êtes-vous sûr de vouloir annuler cet abonnement ?")) {
      return
    }

    try {
      await adminService.cancelSubscription(subscriptionId)
      toast.success('Abonnement annulé')
      loadSubscriptions()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de l\'annulation')
    }
  }

  // Exporter en CSV
  const exportToCSV = () => {
    const headers = ['Email', 'Nom', 'Plan', 'Statut', 'Début', 'Fin', 'Analyses/Mois', 'Analyses Utilisées', 'Montant']
    const csvData = subscriptions.map(sub => [
      sub.user_email,
      sub.user_name || '',
      sub.plan,
      sub.status,
      new Date(sub.start_date).toLocaleDateString('fr-FR'),
      sub.end_date ? new Date(sub.end_date).toLocaleDateString('fr-FR') : '',
      sub.max_analyses_per_month,
      sub.current_analysis_count,
      sub.amount ? `${sub.amount} €` : ''
    ])
    
    const csv = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `abonnements-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Obtenir le badge de statut
  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      expired: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      past_due: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    }
    
    const icons = {
      active: <CheckCircle className="w-3 h-3 mr-1" />,
      cancelled: <XCircle className="w-3 h-3 mr-1" />,
      expired: <Clock className="w-3 h-3 mr-1" />,
      past_due: <AlertCircle className="w-3 h-3 mr-1" />,
    }
    
    const labels = {
      active: 'Actif',
      cancelled: 'Annulé',
      expired: 'Expiré',
      past_due: 'Paiement en retard',
    }
    
    return (
      <span className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${styles[status] || styles.expired}`}>
        {icons[status]}
        {labels[status] || status}
      </span>
    )
  }

  // Obtenir le badge de plan
  const getPlanBadge = (plan) => {
    const styles = {
      pro: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      business: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      enterprise: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      free: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    }
    
    return (
      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${styles[plan] || styles.free}`}>
        {plan === 'free' ? 'Gratuit' : plan}
      </span>
    )
  }

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="animate-fade-in">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des abonnements</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            {stats.total} abonnement(s) au total
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            disabled={subscriptions.length === 0}
            className="btn-secondary py-2 px-3 flex items-center gap-2 disabled:opacity-50"
            title="Exporter en CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exporter</span>
          </button>
          <button
            onClick={loadSubscriptions}
            className="btn-secondary py-2 px-3 flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Rafraîchir</span>
          </button>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
              Actifs
            </span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Abonnements actifs</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-xs text-red-600 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
              Annulés
            </span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.cancelled}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Abonnements annulés</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </div>
            <span className="text-xs text-gray-600 bg-gray-50 dark:bg-gray-700 px-2 py-0.5 rounded-full">
              Expirés
            </span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.expired}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Abonnements expirés</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            </div>
            <span className="text-xs text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-full">
              MRR
            </span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {stats.monthlyRevenue.toFixed(2)} €
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Revenu mensuel récurrent</p>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm flex-1">{error}</p>
          <button 
            onClick={loadSubscriptions}
            className="text-sm font-medium hover:underline"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Recherche */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par email ou nom..."
              className="input-field pl-9 pr-4 py-2 w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filtre par statut */}
          <div className="relative sm:w-40">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPagination(prev => ({ ...prev, page: 1 })) }}
              className="input-field pl-9 pr-8 py-2 w-full appearance-none"
            >
              <option value="">Tous statuts</option>
              <option value="active">Actif</option>
              <option value="cancelled">Annulé</option>
              <option value="expired">Expiré</option>
              <option value="past_due">Paiement en retard</option>
            </select>
          </div>

          {/* Filtre par plan */}
          <div className="relative sm:w-40">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={planFilter}
              onChange={(e) => { setPlanFilter(e.target.value); setPagination(prev => ({ ...prev, page: 1 })) }}
              className="input-field pl-9 pr-8 py-2 w-full appearance-none"
            >
              <option value="">Tous plans</option>
              <option value="free">Gratuit</option>
              <option value="pro">Pro</option>
              <option value="business">Business</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          {/* Réinitialiser les filtres */}
          {(statusFilter || planFilter || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('')
                setPlanFilter('')
                setSearchQuery('')
              }}
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 whitespace-nowrap"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Tableau des abonnements */}
      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Chargement des abonnements...</p>
          </div>
        </div>
      ) : subscriptions.length > 0 ? (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Client</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Plan</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Statut</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Période</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Quota</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {sub.user_name || 'Sans nom'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {sub.user_email}
                          </p>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {getPlanBadge(sub.plan)}
                      </td>

                      <td className="py-3 px-4">
                        {getStatusBadge(sub.status)}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          <span title="Début">{formatDate(sub.start_date)}</span>
                          <span className="mx-1">→</span>
                          <span title="Fin">{formatDate(sub.end_date)}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div
                              className="bg-primary-500 h-1.5 rounded-full"
                              style={{
                                width: `${Math.min(100, (parseInt(sub.current_analysis_count) / parseInt(sub.max_analyses_per_month)) * 100)}%`
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {sub.current_analysis_count}/{sub.max_analyses_per_month}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {sub.status === 'active' && sub.plan !== 'free' && (
                          <button
                            onClick={() => handleCancelSubscription(sub.id)}
                            className="text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            Annuler
                          </button>
                        )}
                        {sub.plan === 'free' && (
                          <span className="text-xs text-gray-400 dark:text-gray-600">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Page {pagination.page} sur {pagination.totalPages}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="btn-secondary py-2 px-3 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
                  {pagination.page} / {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="btn-secondary py-2 px-3 disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-center py-16">
          <CreditCard className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Aucun abonnement trouvé</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            {searchQuery || statusFilter || planFilter
              ? 'Essayez de modifier vos filtres'
              : 'Les abonnements apparaîtront ici'}
          </p>
        </div>
      )}
    </div>
  )
}

export default AdminSubscriptions