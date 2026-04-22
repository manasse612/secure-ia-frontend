// === Page Conditions Générales d'Utilisation (CGU) ===

import { Link } from 'react-router-dom'
import { FileText, Shield, ChevronLeft } from 'lucide-react'

function CGUPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" /> Retour à l'accueil
          </Link>
          <div className="flex items-center gap-4">
            <FileText className="w-10 h-10 text-primary-600" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Conditions Générales d'Utilisation
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Dernière mise à jour : 21 avril 2026
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">1. Présentation du service</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Secure IA est une plateforme de vérification de contenu numérique utilisant l'intelligence artificielle. 
              Le service permet d'analyser des images, vidéos, textes et URLs pour détecter les manipulations, 
              deepfakes et contenus générés par IA.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">2. Acceptation des conditions</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              En créant un compte et en utilisant Secure IA, vous acceptez sans réserve les présentes Conditions Générales d'Utilisation. 
              Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser le service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">3. Compte utilisateur</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
              Pour utiliser Secure IA, vous devez créer un compte avec une adresse email valide. Vous êtes responsable de :
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 ml-4">
              <li>La confidentialité de votre mot de passe</li>
              <li>Toutes les activités effectuées depuis votre compte</li>
              <li>L'exactitude des informations fournies lors de l'inscription</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">4. Utilisation autorisée</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
              Vous vous engagez à utiliser Secure IA conformément aux lois en vigueur et à ne pas :
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 ml-4">
              <li>Tenter de contourner les limites d'utilisation ou les restrictions d'accès</li>
              <li>Utiliser le service à des fins illégales ou malveillantes</li>
              <li>Partager votre compte avec des tiers</li>
              <li>Automatiser l'accès au service sans autorisation (hors API officielle)</li>
              <li>Télécharger des contenus illégaux, protégés par droit d'auteur sans autorisation</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">5. Abonnements et paiements</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Les abonnements sont facturés mensuellement via Stripe. Vous pouvez annuler votre abonnement à tout moment 
              depuis votre page de profil. Aucun remboursement n'est effectué pour les périodes partiellement utilisées.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">6. Propriété intellectuelle</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Secure IA et tous ses éléments (marques, logos, code source) sont protégés par les lois sur la propriété intellectuelle. 
              Vous conservez tous les droits sur les contenus que vous soumettez pour analyse.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">7. Limitation de responsabilité</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Les résultats d'analyse fournis par Secure IA sont indicatifs et basés sur des algorithmes d'IA. 
              Nous ne garantissons pas une détection à 100% et vous recommandons de toujours vérifier les résultats 
              avant de prendre des décisions importantes. Secure IA ne peut être tenu responsable des décisions 
              prises sur la base des résultats fournis.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">8. Confidentialité</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Vos données personnelles sont traitées conformément à notre 
              <Link to="/confidentialite" className="text-primary-600 hover:underline ml-1">
                Politique de Confidentialité
              </Link>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">9. Modification des CGU</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Nous nous réservons le droit de modifier ces CGU à tout moment. Les modifications prennent effet 
              dès leur publication. En continuant à utiliser le service après modification, vous acceptez les nouvelles conditions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">10. Contact</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Pour toute question concernant ces CGU, contactez-nous à 
              <a href="mailto:legal@secure-ia.com" className="text-primary-600 hover:underline ml-1">
                legal@secure-ia.com
              </a>
              ou via notre 
              <Link to="/contact" className="text-primary-600 hover:underline ml-1">
                page de contact
              </Link>.
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary-500" />
            <span className="font-semibold text-white">Secure IA</span>
          </div>
          <div className="flex gap-4 text-sm">
            <Link to="/" className="hover:text-white transition-colors">Accueil</Link>
            <Link to="/pricing" className="hover:text-white transition-colors">Tarifs</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default CGUPage
