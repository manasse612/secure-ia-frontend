// === Page des logs système (Admin) ===
// Affiche les journaux d'activité du système
// Permet de filtrer par niveau, catégorie et recherche textuelle

import { useState, useEffect, useCallback } from 'react'
import {
  FileWarning, Search, ChevronLeft, ChevronRight,
  AlertCircle, AlertTriangle, Info, XCircle, Loader2, 
  Filter, Download, RefreshCw
} from 'lucide-react'
import { adminService } from '../../services/api'

function AdminLogs() {
  // État du composant
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Mode démo (données simulées) - à configurer selon l'environnement
  const isDemoMode = false
  
  // Pagination - simplifié selon ce que le backend renvoie
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
    perPage: 50
  })
  
  // Filtres
  const [levelFilter, setLevelFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Auto-refresh
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Configuration des couleurs (avec support mode sombre)
  const levelStyles = {
    info: { 
      icon: <Info className="w-4 h-4" />, 
      bg: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      dot: 'bg-blue-400 dark:bg-blue-500'
    },
    warning: { 
      icon: <AlertTriangle className="w-4 h-4" />, 
      bg: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      dot: 'bg-yellow-400 dark:bg-yellow-500'
    },
    error: { 
      icon: <AlertCircle className="w-4 h-4" />, 
      bg: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      dot: 'bg-red-400 dark:bg-red-500'
    },
    critical: { 
      icon: <XCircle className="w-4 h-4" />, 
      bg: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
      dot: 'bg-red-600 dark:bg-red-700'
    },
  }

  const categoryColors = {
    auth: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    analysis: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    payment: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    admin: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    system: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    security: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  }

  // Charger les logs depuis l'API
  const loadLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = { 
        page: pagination.page, 
        per_page: pagination.perPage,
        search: searchQuery || undefined
      }
      if (levelFilter) params.level = levelFilter
      if (categoryFilter) params.category = categoryFilter

      const response = await adminService.getLogs(params)
      
      // Le backend renvoie maintenant: logs, total, page, per_page, total_pages
      setLogs(response.data.logs || [])
      setPagination({
        page: response.data.page || 1,
        total: response.data.total || 0,
        totalPages: response.data.total_pages || 1,
        perPage: response.data.per_page || 50
      })
      setLastUpdate(new Date())
      
    } catch (error) {
      console.error('Erreur chargement logs:', error)
      
      if (error.response?.status === 401) {
        setError("Non autorisé. Veuillez vous reconnecter.")
      } else if (error.response?.status === 403) {
        setError("Accès refusé. Droits administrateur requis.")
      } else if (error.response?.status === 429) {
        setError("Trop de requêtes. Attendez quelques secondes.")
        // Réessayer automatiquement après 2 secondes
        setTimeout(() => loadLogs(), 2000)
        return
      } else {
        setError(error.response?.data?.detail || "Erreur lors du chargement des logs")
      }
      
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.perPage, levelFilter, categoryFilter, searchQuery])

  // Auto-refresh
  useEffect(() => {
    loadLogs()
    
    let interval
    if (autoRefresh && !searchQuery) {
      interval = setInterval(() => {
        loadLogs()
      }, 30000) // Toutes les 30 secondes
    }
    
    return () => clearInterval(interval)
  }, [pagination.page, levelFilter, categoryFilter, searchQuery, autoRefresh, loadLogs])

  // Réinitialiser la pagination quand les filtres changent
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [levelFilter, categoryFilter, searchQuery])

  // Exporter les logs en CSV
  const exportLogs = () => {
    const headers = ['Date', 'Niveau', 'Catégorie', 'Message', 'IP', 'Utilisateur', 'Détails']
    const csvData = logs.map(log => [
      new Date(log.created_at).toLocaleString('fr-FR'),
      log.level,
      log.category,
      log.message,
      log.ip_address || '',
      log.user_id || '',
      log.details || ''
    ])
    
    const csv = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }) // BOM pour Excel
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `secure-ia-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Style pour le niveau de log
  const getLevelStyle = (level) => {
    return levelStyles[level] || levelStyles.info
  }

  // Badge de catégorie
  const getCategoryBadge = (category) => {
    const colorClass = categoryColors[category] || categoryColors.system
    return (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
        {category}
      </span>
    )
  }

  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'À l\'instant'
    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours} h`
    if (diffDays < 7) return `Il y a ${diffDays} j`
    
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Aller à la page suivante
  const goToNextPage = () => {
    if (pagination.page < pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }))
    }
  }

  // Aller à la page précédente
  const goToPrevPage = () => {
    if (pagination.page > 1) {
      setPagination(prev => ({ ...prev, page: prev.page - 1 }))
    }
  }

  return (
    <div className="animate-fade-in">
      {/* En-tête avec actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
              <FileWarning className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Logs système</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            Journaux d'activité et erreurs de la plateforme.
            {lastUpdate && (
              <span className="text-xs ml-2 text-gray-400">
                Dernière màj : {lastUpdate.toLocaleTimeString('fr-FR')}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode démo badge - plus visible et explicite */}
          {isDemoMode && (
            <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-sm rounded-full flex items-center gap-1 font-medium border border-yellow-300 dark:border-yellow-700">
              <AlertCircle className="w-4 h-4" />
              DONNÉES SIMULÉES
            </span>
          )}

          {/* Auto-refresh toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-2 rounded-lg transition-colors ${
              autoRefresh 
                ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title={autoRefresh ? 'Auto-refresh activé' : 'Auto-refresh désactivé'}
          >
            <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
          </button>

          {/* Export button */}
          <button
            onClick={exportLogs}
            disabled={logs.length === 0}
            className="btn-secondary py-2 px-3 flex items-center gap-2 disabled:opacity-50"
            title="Exporter en CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exporter</span>
          </button>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm flex-1">{error}</p>
          <button 
            onClick={loadLogs}
            className="text-sm font-medium hover:underline"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Barre de recherche */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher dans les logs (message, catégorie, niveau...)"
            className="input-field pl-10 pr-4 py-2 w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Filtre par niveau */}
          <div className="relative flex-1">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="input-field pl-10 pr-8 py-2 w-full appearance-none"
            >
              <option value="">Tous les niveaux</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* Filtre par catégorie */}
          <div className="relative flex-1">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-field pl-10 pr-8 py-2 w-full appearance-none"
            >
              <option value="">Toutes les catégories</option>
              <option value="auth">Authentification</option>
              <option value="analysis">Analyses</option>
              <option value="payment">Paiements</option>
              <option value="admin">Administration</option>
              <option value="system">Système</option>
              <option value="security">Sécurité</option>
            </select>
          </div>

          {/* Résumé des filtres */}
          {(levelFilter || categoryFilter || searchQuery) && (
            <button
              onClick={() => {
                setLevelFilter('')
                setCategoryFilter('')
                setSearchQuery('')
              }}
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 whitespace-nowrap"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Liste des logs */}
      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Chargement des logs...</p>
          </div>
        </div>
      ) : logs.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
          {logs.map((log) => {
            const style = getLevelStyle(log.level)
            return (
              <div key={log.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start gap-3">
                  {/* Indicateur de niveau */}
                  <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${style.dot}`} />

                  {/* Contenu du log */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${style.bg}`}>
                        {style.icon}
                        {log.level}
                      </span>
                      {getCategoryBadge(log.category)}
                      <span className="text-xs text-gray-400 dark:text-gray-500" title={new Date(log.created_at).toLocaleString('fr-FR')}>
                        {formatDate(log.created_at)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                      {log.message}
                    </p>
                    
                    {(log.details || log.ip_address || log.user_id) && (
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                        {log.details && <p>📋 {log.details}</p>}
                        {log.ip_address && <p>🌐 IP : {log.ip_address}</p>}
                        {log.user_id && <p>👤 Utilisateur : {log.user_id}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-center py-16">
          <FileWarning className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Aucun log trouvé</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            {searchQuery || levelFilter || categoryFilter 
              ? 'Essayez de modifier vos filtres'
              : 'Les logs apparaîtront ici quand le système sera actif'}
          </p>
          {(searchQuery || levelFilter || categoryFilter) && (
            <button
              onClick={() => {
                setLevelFilter('')
                setCategoryFilter('')
                setSearchQuery('')
              }}
              className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Effacer tous les filtres
            </button>
          )}
        </div>
      )}

      {/* Pagination - simplifiée et alignée avec le backend */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Page {pagination.page} sur {pagination.totalPages}
            {pagination.total > 0 && ` (${pagination.total} logs au total)`}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevPage}
              disabled={pagination.page === 1}
              className="btn-secondary py-2 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Page précédente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
              {pagination.page} / {pagination.totalPages}
            </span>
            
            <button
              onClick={goToNextPage}
              disabled={pagination.page >= pagination.totalPages}
              className="btn-secondary py-2 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Page suivante"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminLogs