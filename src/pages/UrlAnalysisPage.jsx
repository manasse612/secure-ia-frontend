// === Page d'analyse d'URL ===
// Permet de scanner un site web pour vérifier sa sécurité
// Vérifie le SSL, la réputation, les en-têtes de sécurité

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Globe, Loader2, CheckCircle, AlertTriangle, XCircle, Lock, Shield, RotateCcw, ArrowRight } from 'lucide-react'
import { analysisService } from '../services/api'
import AnalysisProgress from '../components/AnalysisProgress'
import toast from 'react-hot-toast'
import { getAnalysisErrorMessage } from '../utils/errorMessages'

function UrlAnalysisPage() {
  // État du composant
  const [url, setUrl] = useState('')               // URL à analyser
  const [loading, setLoading] = useState(false)     // En cours d'analyse
  const [result, setResult] = useState(null)        // Résultat de l'analyse
  const [quota, setQuota] = useState(null)         // Quota d'analyses

  useEffect(() => {
    analysisService.getQuota().then(r => setQuota(r.data)).catch(() => {})
  }, [])

  // Lancer l'analyse de l'URL
  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast.error('Veuillez entrer une URL')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      // Préparer les données du formulaire
      const formData = new FormData()
      formData.append('url', url)

      // Appeler l'API d'analyse
      const response = await analysisService.analyzeUrl(formData)
      setResult(response.data)
      toast.success('Analyse terminée !')
    } catch (error) {
      toast.error(getAnalysisErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  // Réinitialiser
  const handleReset = () => {
    setUrl('')
    setResult(null)
  }

  // Couleur du score
  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (score) => {
    if (score >= 70) return 'bg-green-50'
    if (score >= 40) return 'bg-yellow-50'
    return 'bg-red-50'
  }

  return (
    <div className="animate-fade-in">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Globe className="w-5 h-5 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analyse de site web</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          Entrez l'URL d'un site web pour analyser sa sécurité et sa réputation.
        </p>
      </div>

      {/* Bannière quota épuisé */}
      {quota && quota.remaining === 0 && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-800 dark:text-red-300">Quota mensuel atteint ({quota.used}/{quota.limit})</p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">Vous ne pouvez plus lancer d'analyses ce mois-ci.</p>
            <Link to="/pricing" className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-red-700 dark:text-red-300 hover:underline">
              Passer au plan Pro <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Formulaire de saisie */}
      <div className="card mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          URL du site web
        </label>
        <div className="relative mb-4">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.exemple.com"
            className="input-field pl-11"
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAnalyze}
            disabled={loading || !url.trim() || (quota && quota.remaining === 0)}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Shield className="w-4 h-4" />
            )}
            {loading ? 'Scan en cours...' : 'Scanner le site'}
          </button>
          <button onClick={handleReset} className="btn-secondary">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Résultats */}
      {loading ? (
        <div className="max-w-2xl mx-auto mt-6">
          <AnalysisProgress
            active={loading}
            analysisType="url"
            steps={[
              { label: 'Vérification du format URL', duration: 400 },
              { label: 'Vérification du certificat SSL', duration: 1200 },
              { label: 'Scan VirusTotal (réputation)', duration: 2000 },
              { label: 'Analyse des en-têtes de sécurité', duration: 1000 },
              { label: 'Calcul du score de sécurité', duration: 600 },
            ]}
          />
        </div>
      ) : result ? (
        <div className="animate-slide-up space-y-6">
          {/* Score principal */}
          <div className={`card text-center ${getScoreBg(result.score)}`}>
            <p className={`text-6xl font-bold mb-2 ${getScoreColor(result.score)}`}>
              {result.score?.toFixed(0)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Score de sécurité sur 100</p>
            <div className="inline-flex items-center gap-2">
              {result.verdict === 'securise' && <CheckCircle className="w-5 h-5 text-green-500" />}
              {result.verdict === 'risque_modere' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
              {result.verdict === 'dangereux' && <XCircle className="w-5 h-5 text-red-500" />}
              <span className="font-semibold capitalize text-gray-800 dark:text-gray-200">
                {result.verdict === 'securise' ? 'Site sécurisé' :
                 result.verdict === 'risque_modere' ? 'Risque modéré' : 'Site dangereux'}
              </span>
            </div>
          </div>

          {/* Résumé */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Résumé</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">{result.summary}</p>
          </div>

          {/* Détails en grille */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* SSL */}
            {result.result?.ssl_check && (
              <div className="card">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Certificat SSL</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">SSL présent</span>
                    <span className={result.result.ssl_check.has_ssl ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {result.result.ssl_check.has_ssl ? '✅ Oui' : '❌ Non'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Certificat valide</span>
                    <span className={result.result.ssl_check.valid ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {result.result.ssl_check.valid ? '✅ Oui' : '❌ Non'}
                    </span>
                  </div>
                  {result.result.ssl_check.issuer && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Émetteur</span>
                      <span className="font-medium text-gray-900 dark:text-white">{result.result.ssl_check.issuer}</span>
                    </div>
                  )}
                  {result.result.ssl_check.protocol && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Protocole</span>
                      <span className="font-medium text-gray-900 dark:text-white">{result.result.ssl_check.protocol}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VirusTotal */}
            {result.result?.virustotal && (
              <div className="card">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Réputation (VirusTotal)</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Détections malveillantes</span>
                    <span className={result.result.virustotal.malicious > 0 ? 'text-red-600 font-bold' : 'text-green-600 font-medium'}>
                      {result.result.virustotal.malicious}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Suspects</span>
                    <span className={result.result.virustotal.suspicious > 0 ? 'text-yellow-600 font-medium' : 'text-green-600 font-medium'}>
                      {result.result.virustotal.suspicious}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Sans danger</span>
                    <span className="text-green-600 font-medium">{result.result.virustotal.harmless}</span>
                  </div>
                </div>
              </div>
            )}

            {/* En-têtes de sécurité */}
            {result.result?.security_headers && (
              <div className="card md:col-span-2">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">En-têtes de sécurité HTTP</h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {result.result.security_headers.headers_found?.map((h) => (
                    <div key={h.name} className="flex items-center gap-2 text-sm bg-green-50 px-3 py-2 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{h.description}</span>
                    </div>
                  ))}
                  {result.result.security_headers.headers_missing?.map((h) => (
                    <div key={h.name} className="flex items-center gap-2 text-sm bg-red-50 px-3 py-2 rounded-lg">
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span className="text-gray-500">{h.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Temps */}
          <p className="text-xs text-gray-400 text-center">
            Analysé en {result.processing_time_ms?.toFixed(0)} ms
          </p>
        </div>
      ) : !loading ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <Globe className="w-16 h-16 text-gray-200 dark:text-gray-600 mb-4" />
          <p className="text-gray-400 dark:text-gray-500 mb-1">Aucun résultat</p>
          <p className="text-sm text-gray-300 dark:text-gray-500">
            Entrez une URL et cliquez sur Scanner pour analyser un site web.
          </p>
        </div>
      ) : null}
    </div>
  )
}

export default UrlAnalysisPage
