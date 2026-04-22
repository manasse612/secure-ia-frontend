// === Barre de progression pour les analyses ===
// Affiche une animation de progression avec étapes pendant l'analyse

import { useState, useEffect } from 'react'
import { Shield, Loader2, CheckCircle } from 'lucide-react'

const DEFAULT_STEPS = [
  { label: 'Préparation des données', duration: 800 },
  { label: 'Envoi au moteur d\'analyse', duration: 1200 },
  { label: 'Analyse en cours...', duration: 2500 },
  { label: 'Génération du rapport', duration: 1000 },
]

function AnalysisProgress({ active = false, steps = DEFAULT_STEPS, analysisType = 'image' }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!active) {
      setCurrentStep(0)
      setProgress(0)
      return
    }

    let totalDuration = steps.reduce((sum, s) => sum + s.duration, 0)
    let elapsed = 0
    let stepIndex = 0

    const interval = setInterval(() => {
      elapsed += 50
      const newProgress = Math.min((elapsed / totalDuration) * 95, 95)
      setProgress(newProgress)

      // Avancer les étapes
      let acc = 0
      for (let i = 0; i < steps.length; i++) {
        acc += steps[i].duration
        if (elapsed < acc) {
          setCurrentStep(i)
          break
        }
        if (i === steps.length - 1) {
          setCurrentStep(i)
        }
      }
    }, 50)

    return () => clearInterval(interval)
  }, [active, steps])

  if (!active) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Analyse en cours</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {steps[currentStep]?.label || 'Traitement...'}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
          <span>{steps[currentStep]?.label}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 via-primary-400 to-accent-500 rounded-full transition-all duration-200 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-shimmer" />
          </div>
        </div>
      </div>

      {/* Steps list */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-3">
            {index < currentStep ? (
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            ) : index === currentStep ? (
              <Loader2 className="w-4 h-4 text-primary-500 animate-spin flex-shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0" />
            )}
            <span className={`text-sm ${
              index < currentStep
                ? 'text-green-600 dark:text-green-400 line-through'
                : index === currentStep
                ? 'text-primary-600 dark:text-primary-400 font-medium'
                : 'text-gray-400 dark:text-gray-500'
            }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AnalysisProgress
