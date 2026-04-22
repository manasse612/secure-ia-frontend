// === Page d'analyse vidéo ===
// Permet d'uploader une vidéo ou fournir une URL pour détecter les deepfakes
// Affiche le score d'authenticité, l'analyse audio/faciale/temporelle

import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import {
  Video, Upload, Link2, Loader2, CheckCircle, AlertTriangle,
  XCircle, Info, ArrowRight, Volume2, User, Clock, Film, Lock
} from 'lucide-react'
import { analysisService } from '../services/api'
import { isPro } from '../services/auth'
import AnalysisProgress from '../components/AnalysisProgress'
import toast from 'react-hot-toast'
import { getAnalysisErrorMessage } from '../utils/errorMessages'

function VideoAnalysisPage() {
  const [mode, setMode] = useState('upload')
  const [videoUrl, setVideoUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [quota, setQuota] = useState(null)

  useEffect(() => {
    analysisService.getQuota().then(r => setQuota(r.data)).catch(() => {})
  }, [])

  // Bloquer l'accès pour les utilisateurs publics (gratuits)
  if (!isPro()) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-gray-400 dark:text-gray-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Analyse vidéo réservée au plan Pro
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
          La détection de deepfakes et l'analyse vidéo avancée sont disponibles à partir du plan Pro. Passez à un plan supérieur pour débloquer cette fonctionnalité.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/pricing" className="btn-primary inline-flex items-center gap-2">
            Voir les plans <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/dashboard" className="btn-secondary inline-flex items-center gap-2">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    )
  }

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles?.length > 0) {
      const err = rejectedFiles[0]?.errors?.[0]
      if (err?.code === 'file-too-large') {
        toast.error('La vidéo ne doit pas dépasser 30 Mo')
      } else {
        toast.error(err?.message || 'Fichier non accepté')
      }
      return
    }
    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv']
    },
    maxSize: 30 * 1024 * 1024,
    multiple: false,
  })

  const handleAnalyze = async () => {
    if (mode === 'upload' && !selectedFile) {
      toast.error('Veuillez sélectionner une vidéo')
      return
    }
    if (mode === 'url' && !videoUrl.trim()) {
      toast.error('Veuillez entrer une URL vidéo')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      if (mode === 'upload' && selectedFile) {
        formData.append('file', selectedFile)
      } else {
        formData.append('video_url', videoUrl)
      }

      const response = await analysisService.analyzeVideo(formData)
      setResult(response.data)
      toast.success('Analyse terminée !')

      // Rafraîchir le quota
      analysisService.getQuota().then(r => setQuota(r.data)).catch(() => {})
    } catch (error) {
      toast.error(getAnalysisErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  // Réinitialiser le formulaire
  const handleReset = () => {
    setSelectedFile(null)
    setVideoUrl('')
    setResult(null)
  }

  const getVerdictInfo = (verdict) => {
    switch (verdict) {
      case 'authentique':
        return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', label: 'Authentique' }
      case 'suspect':
        return { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', label: 'Suspect' }
      case 'deepfake':
        return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', label: 'Deepfake probable' }
      default:
        return { icon: Info, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-900/20', label: 'Non déterminé' }
    }
  }

  // Seuils standardisés à 70/40 pour cohérence inter-services
  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analyse vidéo</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Détection de deepfakes et de vidéos manipulées par IA
        </p>
      </div>

      {/* Quota */}
      {quota && (
        <div className="card">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Analyses utilisées : {quota.used}/{quota.limit}
            </span>
            <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${quota.percentage > 80 ? 'bg-red-500' : 'bg-primary-500'}`}
                style={{ width: `${Math.min(quota.percentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Sélection du mode */}
      <div className="card">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('upload')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'upload'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            <Upload className="w-4 h-4" /> Upload
          </button>
          <button
            onClick={() => setMode('url')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'url'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            <Link2 className="w-4 h-4" /> URL
          </button>
        </div>

        {mode === 'upload' ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10'
                : selectedFile
                  ? 'border-green-300 bg-green-50/50 dark:bg-green-900/10'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
            }`}
          >
            <input {...getInputProps()} />
            {selectedFile ? (
              <div className="space-y-2">
                <Film className="w-10 h-10 text-green-500 mx-auto" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(1)} Mo
                </p>
                <p className="text-xs text-primary-600">Cliquez pour changer</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Video className="w-10 h-10 text-gray-400 mx-auto" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isDragActive ? 'Déposez la vidéo ici' : 'Glissez-déposez une vidéo ou cliquez pour sélectionner'}
                </p>
                <p className="text-xs text-gray-400">MP4, WebM, OGG, MOV, AVI, MKV — Max 30 Mo / 2 min (les vidéos longues seront découpées automatiquement)</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              URL de la vidéo
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://example.com/video.mp4"
              className="input-field"
            />
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <Video className="w-5 h-5" />
                Analyser la vidéo
              </>
            )}
          </button>
          <button
            onClick={handleReset}
            disabled={loading}
            className="btn-secondary px-6 flex items-center justify-center gap-2"
          >
            <XCircle className="w-5 h-5" />
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Progression de l'analyse */}
      {loading && (
        <div className="mt-6">
          <AnalysisProgress
            active={loading}
            analysisType="video"
            steps={[
              { label: 'Extraction des trames vidéo', duration: 1000 },
              { label: 'Analyse faciale (FaceForensics++)', duration: 2000 },
              { label: 'Détection de voix synthétique', duration: 1500 },
              { label: 'Analyse temporelle trame par trame', duration: 2500 },
              { label: 'Modèles deepfake (MesoNet, XceptionNet)', duration: 2000 },
              { label: 'Génération du rapport', duration: 800 },
            ]}
          />
        </div>
      )}

      {/* Résultat de l'analyse */}
      {!loading && result && result.result && (
        <div className="space-y-4 animate-slide-up">
          {/* Score principal */}
          {(() => {
            const res = result.result
            const verdictInfo = getVerdictInfo(res.verdict)
            const VerdictIcon = verdictInfo.icon

            return (
              <>
                <div className={`card ${verdictInfo.bg}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <VerdictIcon className={`w-8 h-8 ${verdictInfo.color}`} />
                      <div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {verdictInfo.label}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{res.summary}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-bold ${getScoreColor(res.score)}`}>
                        {res.score}%
                      </p>
                      <p className="text-xs text-gray-500">Score d'authenticité</p>
                    </div>
                  </div>

                </div>

                {/* Deepfake probability */}
                {res.deepfake_probability !== undefined && (
                  <div className="card">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Probabilité de deepfake
                    </h3>
                    <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          res.deepfake_probability < 0.3 ? 'bg-green-500'
                          : res.deepfake_probability < 0.6 ? 'bg-yellow-500'
                          : 'bg-red-500'
                        }`}
                        style={{ width: `${res.deepfake_probability * 100}%` }}
                      />
                    </div>
                    <p className="text-right text-sm font-medium mt-1 text-gray-600 dark:text-gray-400">
                      {(res.deepfake_probability * 100).toFixed(1)}%
                    </p>
                  </div>
                )}

                {/* Analyse détaillée en grille */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Analyse audio */}
                  {res.audio_analysis && (
                    <div className="card">
                      <div className="flex items-center gap-2 mb-3">
                        <Volume2 className="w-5 h-5 text-blue-500" />
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Analyse audio</h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Audio présent</span>
                          <span className="font-medium">{res.audio_analysis.has_audio ? 'Oui' : 'Non'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Voix synthétique</span>
                          <span className="font-medium">{(res.audio_analysis.voice_synthetic_probability * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Sync lèvres</span>
                          <span className="font-medium">{(res.audio_analysis.lip_sync_score * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Artefacts audio</span>
                          <span className="font-medium">{res.audio_analysis.audio_artifacts_detected}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Analyse faciale */}
                  {res.face_analysis && (
                    <div className="card">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-5 h-5 text-purple-500" />
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Analyse faciale</h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Visages détectés</span>
                          <span className="font-medium">{res.face_analysis.faces_detected}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Face swap</span>
                          <span className="font-medium">{(res.face_analysis.face_swap_probability * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Incohérences</span>
                          <span className="font-medium">{res.face_analysis.facial_inconsistencies}</span>
                        </div>
                        {res.face_analysis.micro_expression_score !== null && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Micro-expressions</span>
                            <span className="font-medium">{(res.face_analysis.micro_expression_score * 100).toFixed(1)}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Analyse temporelle */}
                  {res.temporal_analysis && (
                    <div className="card">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-5 h-5 text-orange-500" />
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Analyse temporelle</h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Cohérence frames</span>
                          <span className="font-medium">{(res.temporal_analysis.frame_consistency_score * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Artefacts compression</span>
                          <span className="font-medium">{res.temporal_analysis.compression_artifacts}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Flickering</span>
                          <span className="font-medium">{res.temporal_analysis.temporal_flickering_detected ? 'Oui' : 'Non'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Résolution</span>
                          <span className="font-medium capitalize">{res.temporal_analysis.resolution_consistency}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Métadonnées vidéo */}
                  {res.video_metadata && (
                    <div className="card">
                      <div className="flex items-center gap-2 mb-3">
                        <Film className="w-5 h-5 text-green-500" />
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Métadonnées</h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Durée</span>
                          <span className="font-medium">{res.video_metadata.duration_seconds}s</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Résolution</span>
                          <span className="font-medium">{res.video_metadata.resolution}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">FPS</span>
                          <span className="font-medium">{res.video_metadata.fps}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Codec</span>
                          <span className="font-medium">{res.video_metadata.codec}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Frames suspectes</span>
                          <span className="font-medium">{res.video_metadata.suspicious_frames}/{res.video_metadata.total_frames_analyzed}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modèles utilisés */}
                {res.models_used && (
                  <div className="card">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Modèles d'IA utilisés</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {res.models_used.map((model, i) => (
                        <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{model.name}</p>
                          <p className="text-xs text-gray-500">v{model.version}</p>
                          <p className="text-sm font-bold text-primary-600 mt-1">{(model.confidence * 100).toFixed(0)}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommandations */}
                {res.recommendations && res.recommendations.length > 0 && (
                  <div className="card">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Recommandations</h3>
                    <ul className="space-y-2">
                      {res.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Info className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Lien vers le détail */}
                <Link
                  to={`/analysis/${result.id}`}
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  Voir le rapport complet <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )
          })()}
        </div>
      )}
    </div>
  )
}

export default VideoAnalysisPage
