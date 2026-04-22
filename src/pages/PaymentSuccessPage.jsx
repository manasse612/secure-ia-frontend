// === Page de succès de paiement ===
// Affichée après un paiement réussi (réel ou simulé)

import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react'
import { paymentService, authService } from '../services/api'
import { isAuthenticated } from '../services/auth'

function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const plan = searchParams.get('plan') || 'pro'
  const simulated = searchParams.get('simulated') === 'true'
  const [upgrading, setUpgrading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const finalize = async () => {
      if (!isAuthenticated()) { setDone(true); return }

      if (simulated) {
        // En mode simulation, confirmer l'upgrade côté serveur
        setUpgrading(true)
        try {
          await paymentService.confirmSimulated(plan)
          // Rafraîchir le profil utilisateur
          const res = await authService.getProfile()
          localStorage.setItem('user', JSON.stringify(res.data))
        } catch { /* ignore */ }
        setUpgrading(false)
      } else {
        // En mode réel, juste rafraîchir le profil (le webhook Stripe a mis à jour)
        try {
          const res = await authService.getProfile()
          localStorage.setItem('user', JSON.stringify(res.data))
        } catch { /* ignore */ }
      }
      setDone(true)
    }
    finalize()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        {upgrading ? (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Activation en cours...
            </h1>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Paiement réussi !
            </h1>

            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Votre abonnement <strong className="text-primary-600">{plan.charAt(0).toUpperCase() + plan.slice(1)}</strong> est maintenant actif.
            </p>

            {simulated && (
              <div className="mb-6 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  Mode simulation — aucun paiement réel n'a été effectué.
                </p>
              </div>
            )}

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Vous pouvez maintenant profiter de toutes les fonctionnalités de votre plan.
            </p>

            <div className="flex flex-col gap-3">
              <Link
                to="/dashboard"
                className="btn-primary flex items-center justify-center gap-2"
              >
                Aller au tableau de bord <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/profile"
                className="btn-secondary flex items-center justify-center gap-2"
              >
                Voir mon abonnement
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default PaymentSuccessPage
