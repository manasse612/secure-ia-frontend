// === Page Politique de Confidentialité ===
import { Link } from 'react-router-dom'
import { Shield, ArrowLeft } from 'lucide-react'

function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Secure IA</span>
          </Link>
          <Link to="/" className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Politique de confidentialité</h1>

        <div className="space-y-8 text-gray-600 dark:text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Introduction</h2>
            <p>
              Chez <strong>Secure IA</strong>, la protection de vos données personnelles est une priorité.
              Cette politique de confidentialité décrit les données que nous collectons, comment nous les utilisons
              et les droits dont vous disposez, conformément au Règlement Général sur la Protection des Données (RGPD).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Données collectées</h2>
            <p className="mb-3">Nous collectons les données suivantes :</p>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong>Données d'inscription :</strong> nom complet, adresse email, mot de passe (haché)</li>
              <li><strong>Données d'utilisation :</strong> historique des analyses, type de contenu analysé, horodatage</li>
              <li><strong>Données techniques :</strong> adresse IP, type de navigateur, système d'exploitation</li>
              <li><strong>Contenus soumis :</strong> images, textes, URLs et vidéos soumis pour analyse (traités temporairement)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Utilisation des données</h2>
            <p className="mb-3">Vos données sont utilisées pour :</p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Fournir et améliorer nos services d'analyse de contenus numériques</li>
              <li>Gérer votre compte utilisateur et votre abonnement</li>
              <li>Vous envoyer des notifications liées à votre compte (vérification email, réinitialisation de mot de passe)</li>
              <li>Assurer la sécurité et prévenir les abus</li>
              <li>Établir des statistiques anonymisées d'utilisation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Conservation des données</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong>Données de compte :</strong> conservées tant que votre compte est actif</li>
              <li><strong>Historique d'analyses :</strong> conservé pendant 12 mois maximum</li>
              <li><strong>Contenus soumis (images, vidéos) :</strong> supprimés après analyse, non stockés de façon permanente</li>
              <li><strong>Logs techniques :</strong> conservés pendant 6 mois</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Partage des données</h2>
            <p className="mb-3">
              Vos données ne sont jamais vendues à des tiers. Elles peuvent être partagées avec :
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong>Services d'analyse tiers :</strong> Hive AI, VirusTotal, OpenAI (uniquement le contenu soumis pour analyse)</li>
              <li><strong>Hébergeur :</strong> OVH (hébergement des serveurs)</li>
              <li><strong>Paiement :</strong> Stripe (traitement sécurisé des paiements)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Sécurité</h2>
            <p>
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données :
              chiffrement HTTPS, hachage des mots de passe (bcrypt), tokens JWT sécurisés, sessions uniques,
              et accès restreint aux bases de données.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7. Vos droits (RGPD)</h2>
            <p className="mb-3">Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong>Droit d'accès :</strong> consulter les données que nous détenons sur vous</li>
              <li><strong>Droit de rectification :</strong> corriger vos données personnelles</li>
              <li><strong>Droit de suppression :</strong> supprimer votre compte et toutes vos données (disponible dans votre profil)</li>
              <li><strong>Droit à la portabilité :</strong> exporter vos données dans un format lisible</li>
              <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
            </ul>
            <p className="mt-3">
              Pour exercer vos droits, contactez-nous à{' '}
              <a href="mailto:contact@secure-ia.com" className="text-primary-600 hover:underline">contact@secure-ia.com</a>{' '}
              ou utilisez la fonction de suppression de compte dans votre profil.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">8. Cookies</h2>
            <p>
              Secure IA utilise uniquement des cookies essentiels au fonctionnement du service :
              token d'authentification (localStorage) et préférences de thème. Aucun cookie de suivi
              publicitaire ou analytique tiers n'est utilisé.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">9. Contact</h2>
            <p>
              Pour toute question relative à la protection de vos données, vous pouvez nous contacter via
              notre <Link to="/contact" className="text-primary-600 hover:underline">page de contact</Link> ou
              par email à <a href="mailto:contact@secure-ia.com" className="text-primary-600 hover:underline">contact@secure-ia.com</a>.
            </p>
          </section>
        </div>

        <p className="mt-12 text-sm text-gray-400 dark:text-gray-500">
          Dernière mise à jour : Mars 2026
        </p>
      </main>
    </div>
  )
}

export default ConfidentialitePage
