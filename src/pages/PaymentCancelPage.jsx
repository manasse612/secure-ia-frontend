// === Page d'annulation de paiement ===
// Affichée quand l'utilisateur annule le processus de paiement

import { Link } from 'react-router-dom'
import { XCircle, ArrowRight, ArrowLeft } from 'lucide-react'

function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Paiement annulé
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Le processus de paiement a été annulé. Aucun montant n'a été débité.
          Vous pouvez réessayer à tout moment.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            to="/pricing"
            className="btn-primary flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Retour aux tarifs
          </Link>
          <Link
            to="/dashboard"
            className="btn-secondary flex items-center justify-center gap-2"
          >
            Aller au tableau de bord
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PaymentCancelPage
