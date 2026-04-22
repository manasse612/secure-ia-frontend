// === Page d'analyse de texte (Fact-checking) ===
// Permet de soumettre un texte pour vérifier sa véracité
// Utilise l'analyse NLP et le fact-checking via OpenAI

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FileText, Loader2, CheckCircle, AlertTriangle, XCircle, Info, RotateCcw, ArrowRight, Construction, X } from 'lucide-react'
import { analysisService } from '../services/api'
import AnalysisProgress from '../components/AnalysisProgress'
import toast from 'react-hot-toast'
import { getAnalysisErrorMessage } from '../utils/errorMessages'

function TextAnalysisPage() {
  const navigate = useNavigate()

  // État du composant
  const [text, setText] = useState('')             // Texte à analyser
  const [language, setLanguage] = useState('fr')   // Langue du texte
  const [loading, setLoading] = useState(false)    // En cours d'analyse
  const [result, setResult] = useState(null)       // Résultat de l'analyse
  const [quota, setQuota] = useState(null)         // Quota d'analyses
  const [showBetaNotice, setShowBetaNotice] = useState(true) // Notice beta discrète

  useEffect(() => {
    analysisService.getQuota().then(r => setQuota(r.data)).catch(() => {})
  }, [])

  // Lancer l'analyse de texte
  const handleAnalyze = async () => {
    // Vérifier la longueur du texte
    if (text.trim().length < 10) {
      toast.error('Le texte doit contenir au moins 10 caractères')
      return
    }
    if (text.length > 10000) {
      toast.error('Le texte ne doit pas dépasser 10 000 caractères')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      // Préparer les données du formulaire
      const formData = new FormData()
      formData.append('text', text)
      formData.append('language', language)

      // Appeler l'API d'analyse
      const response = await analysisService.analyzeText(formData)
      setResult(response.data)
      toast.success('Analyse terminée !')
    } catch (error) {
      toast.error(getAnalysisErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  // Réinitialiser le formulaire
  const handleReset = () => {
    setText('')
    setResult(null)
  }

  // Obtenir la couleur du score
  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Obtenir le style du verdict
  const getVerdictStyle = (verdict) => {
    switch (verdict) {
      case 'vrai': return { icon: <CheckCircle className="w-6 h-6 text-green-500" />, bg: 'bg-green-50', label: 'Information fiable' }
      case 'non_verifiable': return { icon: <AlertTriangle className="w-6 h-6 text-yellow-500" />, bg: 'bg-yellow-50', label: 'Non vérifiable' }
      case 'faux': return { icon: <XCircle className="w-6 h-6 text-red-500" />, bg: 'bg-red-50', label: 'Probablement faux' }
      default: return { icon: <Info className="w-6 h-6 text-gray-400" />, bg: 'bg-gray-50', label: 'Indéterminé' }
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Notice beta discrète - ne bloque pas l'accès */}
      {showBetaNotice && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start gap-3">
          <Construction className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-blue-800 dark:text-blue-300">
              Fonctionnalité en version bêta
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              L'analyse de texte est en phase d'amélioration continue. Les résultats peuvent varier.
            </p>
          </div>
          <button
            onClick={() => setShowBetaNotice(false)}
            className="p-1 text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-400"
            aria-label="Fermer la notice"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vérification de texte</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          Collez un texte, un article ou une affirmation pour vérifier sa véracité.
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

      <div className="grid lg:grid-cols-2 gap-8">
        {/* === Panneau gauche : formulaire === */}
        <div>
          {/* Zone de texte */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Texte à analyser
              </label>
              <span className={`text-xs ${text.length > 9000 ? 'text-red-500' : 'text-gray-400'}`}>
                {text.length} / 10 000
              </span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Collez ici le texte, l'article ou l'affirmation que vous souhaitez vérifier...

Exemples :
- Un article de presse
- Un post de réseau social
- Une affirmation à vérifier
- Un extrait de message viral"
              rows={12}
              className="input-field resize-none"
              maxLength={10000}
            />

            {/* Sélecteur de langue */}
            <div className="mt-3">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Langue du texte</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="input-field text-sm py-2"
              >
                <option value="fr">Français</option>
                <option value="en">Anglais</option>
                <option value="es">Espagnol</option>
                <option value="de">Allemand</option>
              </select>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAnalyze}
              disabled={loading || text.trim().length < 10 || (quota && quota.remaining === 0)}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Vérification en cours...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Vérifier le texte
                </>
              )}
            </button>
            <button onClick={handleReset} className="btn-secondary flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Effacer
            </button>
          </div>
        </div>

        {/* === Panneau droit : résultats === */}
        <div>
          {loading ? (
            <AnalysisProgress
              active={loading}
              analysisType="text"
              steps={[
                { label: 'Analyse NLP du texte', duration: 800 },
                { label: 'Détection de biais et sensationnalisme', duration: 1000 },
                { label: 'Fact-checking (OpenAI GPT-4)', duration: 2500 },
                { label: 'Croisement des sources', duration: 1200 },
                { label: 'Génération du rapport', duration: 600 },
              ]}
            />
          ) : result ? (
            <div className="space-y-4 animate-slide-up">
              {/* Score et verdict */}
              <div className={`card text-center ${getVerdictStyle(result.verdict).bg}`}>
                <div className="flex justify-center mb-3">
                  {getVerdictStyle(result.verdict).icon}
                </div>
                <p className={`text-5xl font-bold mb-2 ${getScoreColor(result.score)}`}>
                  {result.score?.toFixed(0)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Score de fiabilité sur 100</p>
                <p className="mt-2 font-semibold text-gray-800 dark:text-gray-200">
                  {getVerdictStyle(result.verdict).label}
                </p>
              </div>

              {/* Résumé */}
              <div className="card">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Résumé de l'analyse</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">{result.summary}</p>
              </div>

              {/* Détails NLP */}
              {result.result?.nlp_analysis && (
                <div className="card">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Analyse linguistique</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Mots analysés</span>
                      <span className="font-medium text-gray-900 dark:text-white">{result.result.nlp_analysis.word_count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Sensationnalisme</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-100 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400 rounded-full"
                            style={{ width: `${result.result.nlp_analysis.sensationalism_score * 100}%` }}
                          />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white text-xs">
                          {(result.result.nlp_analysis.sensationalism_score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Qualité du sourcing</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-100 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-400 rounded-full"
                            style={{ width: `${result.result.nlp_analysis.sourcing_score * 100}%` }}
                          />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white text-xs">
                          {(result.result.nlp_analysis.sourcing_score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    {result.result.nlp_analysis.has_excessive_caps && (
                      <p className="text-xs text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-lg">
                        ⚠️ Usage excessif de majuscules détecté
                      </p>
                    )}
                    {result.result.nlp_analysis.has_excessive_exclamation && (
                      <p className="text-xs text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-lg">
                        ⚠️ Usage excessif de points d'exclamation
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Sources suggérées */}
              {result.result?.fact_check?.sources_suggested && (
                <div className="card">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Sources à consulter</h3>
                  <ul className="space-y-1">
                    {result.result.fact_check.sources_suggested.map((source, i) => (
                      <li key={i} className="text-sm text-primary-600 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                        {source}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Temps de traitement */}
              <p className="text-xs text-gray-400 text-center">
                Analysé en {result.processing_time_ms?.toFixed(0)} ms
              </p>
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
              <FileText className="w-16 h-16 text-gray-200 dark:text-gray-600 mb-4" />
              <p className="text-gray-400 dark:text-gray-500 mb-1">Aucun résultat</p>
              <p className="text-sm text-gray-300 dark:text-gray-500">
                Soumettez un texte pour voir les résultats ici.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TextAnalysisPage
