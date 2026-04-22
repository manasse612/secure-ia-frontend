// === Page de détail d'une analyse ===
// Affiche les résultats complets d'une analyse spécifique
// Accessible depuis l'historique via /analysis/:id

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Image, FileText, Globe, Video, Shield,
  CheckCircle, AlertTriangle, XCircle, Download, Clock, Loader2
} from 'lucide-react'
import { analysisService } from '../services/api'
import toast from 'react-hot-toast'

function AnalysisDetailPage() {
  const { id } = useParams()                       // ID de l'analyse dans l'URL
  const [analysis, setAnalysis] = useState(null)   // Données de l'analyse
  const [loading, setLoading] = useState(true)     // Chargement en cours
  const [error, setError] = useState(null)         // Erreur éventuelle

  // Charger l'analyse au montage du composant
  useEffect(() => {
    loadAnalysis()
  }, [id])

  const loadAnalysis = async () => {
    try {
      const response = await analysisService.getById(id)
      setAnalysis(response.data)
    } catch (err) {
      setError("Analyse non trouvée ou accès refusé")
    } finally {
      setLoading(false)
    }
  }

  // Icône du type
  const getTypeIcon = (type) => {
    const icons = {
      image: <Image className="w-6 h-6 text-blue-600" />,
      text: <FileText className="w-6 h-6 text-green-600" />,
      url: <Globe className="w-6 h-6 text-purple-600" />,
      video: <Video className="w-6 h-6 text-orange-600" />,
    }
    return icons[type] || <Shield className="w-6 h-6 text-gray-400" />
  }

  // Couleur du score
  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (score) => {
    if (score >= 70) return 'bg-green-50 border-green-200'
    if (score >= 40) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  // Icône du verdict
  const getVerdictInfo = (verdict) => {
    const map = {
      authentique: { icon: <CheckCircle className="w-5 h-5 text-green-500" />, label: 'Authentique' },
      vrai: { icon: <CheckCircle className="w-5 h-5 text-green-500" />, label: 'Fiable' },
      securise: { icon: <CheckCircle className="w-5 h-5 text-green-500" />, label: 'Sécurisé' },
      suspect: { icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />, label: 'Suspect' },
      non_verifiable: { icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />, label: 'Non vérifiable' },
      risque_modere: { icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />, label: 'Risque modéré' },
      deepfake: { icon: <XCircle className="w-5 h-5 text-red-500" />, label: 'Deepfake' },
      faux: { icon: <XCircle className="w-5 h-5 text-red-500" />, label: 'Faux' },
      dangereux: { icon: <XCircle className="w-5 h-5 text-red-500" />, label: 'Dangereux' },
    }
    return map[verdict] || { icon: <Shield className="w-5 h-5 text-gray-400" />, label: verdict }
  }

  // Affichage chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  // Affichage erreur
  if (error) {
    return (
      <div className="text-center py-20">
        <XCircle className="w-12 h-12 text-red-300 mx-auto mb-3" />
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
        <Link to="/history" className="btn-primary inline-flex items-center gap-2 mt-4">
          <ArrowLeft className="w-4 h-4" /> Retour à l'historique
        </Link>
      </div>
    )
  }

  // Exporter l'analyse en PDF
  const handleExportPdf = async () => {
    try {
      toast.loading('Génération du PDF...')
      const response = await analysisService.exportPdf(id)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `secure-ia-rapport-${id}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
      toast.dismiss()
      toast.success('PDF téléchargé !')
    } catch (err) {
      toast.dismiss()
      toast.error('Erreur lors de la génération du PDF')
    }
  }

  const verdictInfo = getVerdictInfo(analysis.verdict)

  return (
    <div className="animate-fade-in">
      {/* Bouton retour */}
      <Link to="/history" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6">
        <ArrowLeft className="w-4 h-4" /> Retour à l'historique
      </Link>

      {/* En-tête de l'analyse */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
            {getTypeIcon(analysis.analysis_type)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
              Analyse {analysis.analysis_type === 'url' ? 'URL' : analysis.analysis_type}
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {new Date(analysis.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </span>
              {analysis.processing_time_ms && (
                <span>• {analysis.processing_time_ms.toFixed(0)} ms</span>
              )}
            </div>
          </div>
        </div>
        {/* Bouton export PDF */}
        <button
          onClick={handleExportPdf}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <Download className="w-4 h-4" />
          Export PDF
        </button>
      </div>

      {/* Score et verdict */}
      <div className={`card border ${getScoreBg(analysis.score)} mb-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {verdictInfo.icon}
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Verdict</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{verdictInfo.label}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>
              {analysis.score?.toFixed(0)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">/ 100</p>
          </div>
        </div>
      </div>

      {/* Contenu analysé */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Contenu analysé</h2>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 break-all whitespace-pre-wrap">
            {analysis.input_data}
          </p>
        </div>
      </div>

      {/* Résumé */}
      {analysis.summary && (
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Résumé de l'analyse</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">{analysis.summary}</p>
        </div>
      )}

      {/* Résultats détaillés (JSON) */}
      {analysis.result && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Résultats détaillés</h2>
          <pre className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-xs text-gray-600 dark:text-gray-300 overflow-x-auto max-h-96">
            {JSON.stringify(analysis.result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default AnalysisDetailPage
