// === Page Mentions Légales ===
import { Link } from 'react-router-dom'
import { Shield, ArrowLeft } from 'lucide-react'

function MentionsLegalesPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Mentions légales</h1>

        <div className="space-y-8 text-gray-600 dark:text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Éditeur du site</h2>
            <p>
              Le site <strong>Secure IA</strong> est édité par la société Secure IA SAS, société par actions simplifiée
              au capital de 10 000 €, immatriculée au Registre du Commerce et des Sociétés de Paris.
            </p>
            <ul className="mt-3 space-y-1 list-disc list-inside">
              <li><strong>Siège social :</strong> 12 Rue de l'Innovation, 75001 Paris, France</li>
              <li><strong>SIRET :</strong> 123 456 789 00012</li>
              <li><strong>Directeur de la publication :</strong> Équipe Secure IA</li>
              <li><strong>Email :</strong> contact@secure-ia.com</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Hébergement</h2>
            <p>
              Le site est hébergé par OVH SAS, dont le siège social est situé au 2 Rue Kellermann,
              59100 Roubaix, France. Téléphone : +33 9 72 10 10 07.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Propriété intellectuelle</h2>
            <p>
              L'ensemble des contenus présents sur le site Secure IA (textes, images, logos, icônes, logiciels,
              base de données) sont protégés par les dispositions du Code de la Propriété Intellectuelle.
              Toute reproduction, représentation, modification ou exploitation non autorisée est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Limitation de responsabilité</h2>
            <p>
              Les analyses fournies par Secure IA sont à titre informatif uniquement. Les résultats de détection
              d'images générées par IA, de textes ou de sites web ne constituent pas un avis juridique ou une
              expertise certifiée. Secure IA ne saurait être tenue responsable des décisions prises sur la base
              de ces analyses.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Données personnelles</h2>
            <p>
              Les données personnelles collectées sur ce site sont traitées conformément au Règlement Général
              sur la Protection des Données (RGPD). Pour plus d'informations, consultez notre{' '}
              <Link to="/confidentialite" className="text-primary-600 hover:underline">politique de confidentialité</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Cookies</h2>
            <p>
              Le site utilise des cookies strictement nécessaires au fonctionnement du service (authentification,
              préférences de thème). Aucun cookie de tracking publicitaire n'est utilisé.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7. Droit applicable</h2>
            <p>
              Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux
              de Paris seront seuls compétents.
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

export default MentionsLegalesPage
