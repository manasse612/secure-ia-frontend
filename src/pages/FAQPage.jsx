// === Page FAQ (Questions Fréquentes) ===
// Réponses aux questions courantes des utilisateurs

import { Link } from 'react-router-dom'
import { HelpCircle, ChevronRight, Shield, MessageSquare } from 'lucide-react'

function FAQPage() {
  const faqs = [
    {
      question: "Comment fonctionne l'analyse d'image ?",
      answer: "Notre IA analyse les métadonnées EXIF, détecte les patterns de génération IA (GAN, diffusion) et vérifie la cohérence des pixels. Le score d'authenticité est calculé sur une échelle de 0 à 100."
    },
    {
      question: "Quelle est la précision de la détection de deepfake ?",
      answer: "Nos modèles atteignent 99.7% de précision sur les vidéos deepfake courantes. Nous utilisons Hive AI pour l'analyse avancée des manipulations faciales et vocales."
    },
    {
      question: "Combien d'analyses puis-je faire gratuitement ?",
      answer: "Le plan gratuit permet 10 analyses par mois. Pour plus d'analyses, passez au plan Pro (500/mois) ou Business (5000/mois)."
    },
    {
      question: "Mes données sont-elles sécurisées ?",
      answer: "Oui, toutes les données sont chiffrées avec AES-256. Les images et textes analysés ne sont pas conservés après l'analyse, sauf si vous les sauvegardez dans votre historique."
    },
    {
      question: "Puis-je annuler mon abonnement ?",
      answer: "Oui, vous pouvez annuler à tout moment depuis votre page de profil. Vous conservez l'accès jusqu'à la fin de la période payée."
    },
    {
      question: "Quels types de contenu puis-je analyser ?",
      answer: "Images (JPEG, PNG, GIF, WebP), vidéos (MP4, MOV, AVI), textes (articles, posts, messages) et URLs de sites web."
    },
    {
      question: "Comment contacter le support ?",
      answer: "Utilisez la page Contact ou écrivez à support@secure-ia.com. Le support prioritaire est disponible pour les plans Pro et Business."
    },
    {
      question: "L'API est-elle disponible ?",
      answer: "Oui, l'API est incluse dans le plan Business. Elle permet d'intégrer Secure IA dans vos propres applications avec des quotas élevés."
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <HelpCircle className="w-12 h-12 text-white mx-auto mb-4" />
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Questions fréquentes
          </h1>
          <p className="text-white/80 text-lg">
            Trouvez rapidement des réponses à vos questions
          </p>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 text-sm font-bold">
                  {idx + 1}
                </span>
                {faq.question}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed pl-10">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 text-center">
          <MessageSquare className="w-12 h-12 text-primary-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Vous ne trouvez pas votre réponse ?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Notre équipe est là pour vous aider
          </p>
          <Link 
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-all"
          >
            Contacter le support <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Footer simple */}
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

export default FAQPage
