// === Page d'analyse d'images ===
// Permet d'uploader une image ou de fournir une URL pour l'analyser
// Affiche le score d'authenticité, la détection IA et les métadonnées

import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { Image, Upload, Link2, Loader2, CheckCircle, AlertTriangle, XCircle, Info, ArrowRight, Camera } from 'lucide-react'
import { analysisService } from '../services/api'
import AnalysisProgress from '../components/AnalysisProgress'
import toast from 'react-hot-toast'
import { getAnalysisErrorMessage } from '../utils/errorMessages'
import { useCamera } from '../hooks/useCamera'

function ImageAnalysisPage() {
  // État du composant
  const [mode, setMode] = useState('upload')      // 'upload' ou 'url'
  const [imageUrl, setImageUrl] = useState('')     // URL de l'image
  const [selectedFile, setSelectedFile] = useState(null) // Fichier uploadé
  const [preview, setPreview] = useState(null)     // Aperçu de l'image
  const [loading, setLoading] = useState(false)    // En cours d'analyse
  const [result, setResult] = useState(null)       // Résultat de l'analyse
  const [quota, setQuota] = useState(null)         // Quota d'analyses
  
  // Caméra (pour app mobile)
  const { takePhoto, pickPhoto } = useCamera()
  const isMobileApp = window.location.protocol === 'capacitor:'

  useEffect(() => {
    analysisService.getQuota().then(r => setQuota(r.data)).catch(() => {})
  }, [])

  // Gérer le drop de fichier (drag & drop)
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      // Créer un aperçu de l'image
      const reader = new FileReader()
      reader.onload = () => setPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }, [])

  // Configuration du dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.bmp'] },
    maxSize: 10 * 1024 * 1024, // 10 Mo max
    multiple: false,
  })

  // Lancer l'analyse
  const handleAnalyze = async () => {
    if (mode === 'upload' && !selectedFile) {
      toast.error('Veuillez sélectionner une image')
      return
    }
    if (mode === 'url' && !imageUrl) {
      toast.error("Veuillez entrer l'URL d'une image")
      return
    }

    setLoading(true)
    setResult(null)

    try {
      // Préparer les données du formulaire
      const formData = new FormData()
      if (mode === 'upload') {
        formData.append('file', selectedFile)
      } else {
        formData.append('image_url', imageUrl)
      }

      // Appeler l'API d'analyse
      const response = await analysisService.analyzeImage(formData)
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
    setSelectedFile(null)
    setPreview(null)
    setImageUrl('')
    setResult(null)
  }

  // Convertir base64 en fichier
  const base64ToFile = (base64String, filename) => {
    const arr = base64String.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
  }

  // Prendre une photo avec la caméra
  const handleTakePhoto = async () => {
    try {
      const base64Image = await takePhoto()
      const file = base64ToFile(base64Image, 'photo.jpg')
      setSelectedFile(file)
      setPreview(base64Image)
      toast.success('Photo prise !')
    } catch (error) {
      toast.error('Impossible d\'accéder à la caméra')
    }
  }

  // Choisir une photo de la galerie
  const handlePickPhoto = async () => {
    try {
      const base64Image = await pickPhoto()
      const file = base64ToFile(base64Image, 'photo.jpg')
      setSelectedFile(file)
      setPreview(base64Image)
      toast.success('Photo sélectionnée !')
    } catch (error) {
      toast.error('Impossible d\'accéder à la galerie')
    }
  }

  // Obtenir la couleur du score (seuils standardisés à 70/40)
  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Obtenir l'icône du verdict
  const getVerdictIcon = (verdict) => {
    switch (verdict) {
      case 'authentique': return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'suspect': return <AlertTriangle className="w-6 h-6 text-yellow-500" />
      case 'deepfake': return <XCircle className="w-6 h-6 text-red-500" />
      default: return <Info className="w-6 h-6 text-gray-400" />
    }
  }

  return (
    <div className="animate-fade-in">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Image className="w-5 h-5 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analyse d'image</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          Uploadez une image ou fournissez une URL pour détecter les manipulations et l'IA.
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
          {/* Sélecteur de mode (upload / URL) */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setMode('upload')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                mode === 'upload'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload
            </button>
            <button
              onClick={() => setMode('url')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                mode === 'url'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <Link2 className="w-4 h-4 inline mr-2" />
              URL
            </button>
          </div>

          {/* Zone d'upload (drag & drop) */}
          {mode === 'upload' ? (
            <div
              {...getRootProps()}
              className={`card border-2 border-dashed cursor-pointer transition-colors text-center py-12 ${
                isDragActive
                  ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-300 hover:border-primary-300 dark:border-gray-600 dark:hover:border-primary-500'
              }`}
            >
              <input {...getInputProps()} />
              {preview ? (
                <div>
                  <img src={preview} alt="Aperçu" className="max-h-48 mx-auto rounded-lg mb-4" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">{selectedFile?.name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {(selectedFile?.size / 1024 / 1024).toFixed(2)} Mo
                  </p>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300 mb-1">
                    Glissez-déposez une image ici
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    ou cliquez pour sélectionner (JPEG, PNG, GIF, WebP - Max 10 Mo)
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Champ URL */
            <div className="card">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL de l'image
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://exemple.com/image.jpg"
                className="input-field"
              />
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Aperçu URL"
                  className="mt-4 max-h-48 rounded-lg"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              )}
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAnalyze}
              disabled={loading || (quota && quota.remaining === 0)}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Image className="w-4 h-4" />
                  Analyser l'image
                </>
              )}
            </button>
            <button onClick={handleReset} className="btn-secondary">
              Réinitialiser
            </button>
          </div>
        </div>

        {/* === Panneau droit : résultats === */}
        <div>
          {loading ? (
            <AnalysisProgress
              active={loading}
              analysisType="image"
              steps={[
                { label: 'Préparation de l\'image', duration: 600 },
                { label: 'Extraction des métadonnées EXIF', duration: 1000 },
                { label: 'Détection IA (Hive AI)', duration: 2500 },
                { label: 'Calcul du score d\'authenticité', duration: 800 },
                { label: 'Génération du rapport', duration: 600 },
              ]}
            />
          ) : result ? (
            <div className="space-y-4 animate-slide-up">
              {/* Score principal */}
              <div className="card text-center">
                <div className="mb-3">{getVerdictIcon(result.verdict)}</div>
                <p className={`text-5xl font-bold mb-2 ${getScoreColor(result.score)}`}>
                  {result.score?.toFixed(0)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Score d'authenticité sur 100</p>
                <p className="mt-2 text-sm font-medium capitalize">
                  Verdict : <span className={getScoreColor(result.score)}>{result.verdict}</span>
                </p>
              </div>

              {/* Résumé */}
              <div className="card">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Résumé</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">{result.summary}</p>
              </div>

              {/* Détails */}
              {result.result && (
                <div className="card">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Détails de l'analyse</h3>

                  {/* Détection IA */}
                  {result.result.ai_detection && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Détection IA</h4>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-sm text-gray-600 dark:text-gray-300">
                        <p>Probabilité IA : {(result.result.ai_detection.ai_generated_probability * 100).toFixed(0)}%</p>
                        {result.result.ai_detection.model_detected && (
                          <p>Modèle détecté : {result.result.ai_detection.model_detected}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Métadonnées */}
                  {result.result.metadata && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Métadonnées</h4>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-sm text-gray-600 dark:text-gray-300">
                        <p>EXIF : {result.result.metadata.has_exif ? 'Oui' : 'Non'}</p>
                        {result.result.metadata.camera && <p>Appareil : {result.result.metadata.camera}</p>}
                        {result.result.metadata.dimensions && (
                          <p>Dimensions : {result.result.metadata.dimensions.width}x{result.result.metadata.dimensions.height}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Temps de traitement */}
              <p className="text-xs text-gray-400 text-center">
                Analysé en {result.processing_time_ms?.toFixed(0)} ms
              </p>
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
              <Image className="w-16 h-16 text-gray-200 dark:text-gray-600 mb-4" />
              <p className="text-gray-400 dark:text-gray-500 mb-1">Aucun résultat</p>
              <p className="text-sm text-gray-300 dark:text-gray-500">
                Soumettez une image pour voir les résultats ici.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImageAnalysisPage
