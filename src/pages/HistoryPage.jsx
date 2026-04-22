// === Page d'historique des analyses ===
// Affiche la liste de toutes les analyses effectuées par l'utilisateur
// Permet de filtrer par type et de paginer les résultats

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  History, Image, FileText, Globe, Video, Shield,
  ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, XCircle, Search, Trash2, Loader2
} from 'lucide-react'
import { analysisService } from '../services/api'
import toast from 'react-hot-toast'

function HistoryPage() {
  // État du composant
  const [analyses, setAnalyses] = useState([])     // Liste des analyses
  const [total, setTotal] = useState(0)             // Nombre total
  const [page, setPage] = useState(1)               // Page actuelle
  const [perPage] = useState(10)                    // Résultats par page
  const [filter, setFilter] = useState('')          // Filtre par type
  const [loading, setLoading] = useState(true)      // Chargement en cours
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [clearLoading, setClearLoading] = useState(false)

  // Charger les analyses quand la page ou le filtre change
  useEffect(() => {
    loadAnalyses()
  }, [page, filter])

  // Appeler l'API pour récupérer les analyses
  const loadAnalyses = async () => {
    setLoading(true)
    try {
      const params = { page, per_page: perPage }
      if (filter) params.analysis_type = filter

      const response = await analysisService.getHistory(params)
      setAnalyses(response.data.analyses || [])
      setTotal(response.data.total || 0)
    } catch (error) {
      setAnalyses([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  // Supprimer tout l'historique
  const handleClearHistory = async () => {
    setClearLoading(true)
    try {
      const res = await analysisService.clearHistory()
      toast.success(res.data.message || 'Historique supprimé')
      setShowClearConfirm(false)
      setAnalyses([])
      setTotal(0)
      setPage(1)
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de la suppression')
    } finally {
      setClearLoading(false)
    }
  }

  // Nombre total de pages
  const totalPages = Math.ceil(total / perPage)

  // Icône du type d'analyse
  const getTypeIcon = (type) => {
    const icons = {
      image: <Image className="w-4 h-4 text-blue-600" />,
      text: <FileText className="w-4 h-4 text-green-600" />,
      url: <Globe className="w-4 h-4 text-purple-600" />,
      video: <Video className="w-4 h-4 text-orange-600" />,
    }
    return icons[type] || <Shield className="w-4 h-4 text-gray-400" />
  }

  // Badge du verdict
  const getVerdictBadge = (verdict, score) => {
    if (score >= 70) return <span className="score-high"><CheckCircle className="w-3 h-3 mr-1" /> Fiable</span>
    if (score >= 40) return <span className="score-medium"><AlertTriangle className="w-3 h-3 mr-1" /> Suspect</span>
    return <span className="score-low"><XCircle className="w-3 h-3 mr-1" /> Danger</span>
  }

  // Libellé du type
  const getTypeLabel = (type) => {
    const labels = { image: 'Image', text: 'Texte', url: 'URL', video: 'Vidéo' }
    return labels[type] || type
  }

  return (
    <div className="animate-fade-in">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
              <History className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Historique</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{total} analyse(s) au total</p>
        </div>
        {total > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="btn-danger text-sm flex items-center gap-2 self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            Effacer l'historique
          </button>
        )}
      </div>

      {/* Modal de confirmation suppression */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Supprimer tout l'historique ?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Cette action supprimera définitivement toutes vos {total} analyse(s). Elle est irréversible.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="btn-secondary text-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleClearHistory}
                disabled={clearLoading}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2"
              >
                {clearLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Supprimer tout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filtres par type */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { value: '', label: 'Tous' },
          { value: 'image', label: 'Images' },
          { value: 'text', label: 'Textes' },
          { value: 'url', label: 'URLs' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => { setFilter(f.value); setPage(1) }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste des analyses */}
      {loading ? (
        <div className="card flex items-center justify-center py-16">
          <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : analyses.length > 0 ? (
        <>
          <div className="card divide-y divide-gray-100 dark:divide-gray-700">
            {analyses.map((analysis) => (
              <Link
                key={analysis.id}
                to={`/analysis/${analysis.id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 first:pt-0 last:pb-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 -mx-6 px-6 transition-colors"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  {/* Icône du type */}
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                    {getTypeIcon(analysis.analysis_type)}
                  </div>

                  {/* Détails */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {analysis.input_data?.substring(0, 80)}
                      {analysis.input_data?.length > 80 ? '...' : ''}
                    </p>
                    <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-gray-400 capitalize">
                        {getTypeLabel(analysis.analysis_type)}
                      </span>
                      <span className="text-xs text-gray-300 hidden sm:inline">•</span>
                      <span className="text-xs text-gray-400">
                        {new Date(analysis.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'short',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score et verdict */}
                <div className="flex items-center gap-3 sm:gap-4 pl-12 sm:pl-0 flex-shrink-0">
                  <span className="text-base sm:text-lg font-bold text-gray-700 dark:text-gray-200">
                    {analysis.score?.toFixed(0)}<span className="text-sm text-gray-400">/100</span>
                  </span>
                  {getVerdictBadge(analysis.verdict, analysis.score)}
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn-secondary py-2 px-3 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {page} sur {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="btn-secondary py-2 px-3 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="card text-center py-16">
          <Search className="w-12 h-12 text-gray-200 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Aucune analyse trouvée</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {filter ? 'Essayez de changer le filtre.' : 'Lancez votre première analyse !'}
          </p>
        </div>
      )}
    </div>
  )
}

export default HistoryPage
