// === Page des tarifs ===
// Charge dynamiquement les prix depuis l'API (modifiables par l'admin)
// Si l'utilisateur est connecté, il peut souscrire directement

import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Shield, CheckCircle, ArrowRight, X, Loader2 } from 'lucide-react'
import { publicService, paymentService } from '../services/api'
import { isAuthenticated } from '../services/auth'
import toast from 'react-hot-toast'

function PricingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(null)
  const [autoCheckoutDone, setAutoCheckoutDone] = useState(false)
  const logged = isAuthenticated()

  useEffect(() => {
    loadConfig()
  }, [])

  // Auto-trigger checkout si l'utilisateur revient d'un login avec un plan
  useEffect(() => {
    if (logged && !autoCheckoutDone && !loading) {
      const planParam = searchParams.get('plan')
      if (planParam && (planParam === 'pro' || planParam === 'business')) {
        setAutoCheckoutDone(true)
        handleCheckout(planParam)
      }
    }
  }, [logged, loading, autoCheckoutDone])

  const loadConfig = async () => {
    try {
      const res = await publicService.getConfig()
      const { pricing, quotas, plans: apiPlans } = res.data

      const builtPlans = [
        {
          id: 'free',
          name: 'Gratuit',
          price: `${pricing.free.toFixed(0)}€`,
          description: 'Pour le grand public',
          cta: logged ? 'Plan actuel' : 'Commencer',
          ctaAction: logged ? null : '/register?redirect=/pricing',
          popular: false,
          features: [
            { text: `${quotas.free || 10} analyses/mois`, included: true },
            { text: 'Analyse d\'images', included: true },
            { text: 'Analyse de texte', included: true },
            { text: 'Analyse URL basique', included: true },
            { text: 'Historique (10 dernières)', included: true },
            { text: 'Export PDF simple', included: true },
            { text: 'Analyse vidéo deepfake', included: false },
            { text: 'API', included: false },
            { text: 'Support prioritaire', included: false },
          ],
        },
        {
          id: 'pro',
          name: 'Pro',
          price: `${pricing.pro.toFixed(2).replace('.', ',')}€`,
          description: 'Pour les professionnels',
          cta: logged ? 'Souscrire au Pro' : 'Essayer Pro',
          ctaAction: logged ? 'checkout:pro' : '/login?redirect=/pricing&plan=pro',
          popular: true,
          features: [
            { text: `${quotas.pro || 500} analyses/mois`, included: true },
            { text: 'Analyse d\'images avancée', included: true },
            { text: 'Fact-checking avancé', included: true },
            { text: 'Scan site web complet', included: true },
            { text: 'Historique complet', included: true },
            { text: 'Rapports PDF sans marque', included: true },
            { text: 'Analyse vidéo deepfake', included: true },
            { text: 'API', included: false },
            { text: 'Support prioritaire', included: true },
          ],
        },
        {
          id: 'business',
          name: 'Business',
          price: `${pricing.business.toFixed(2).replace('.', ',')}€`,
          description: 'Pour les entreprises',
          cta: logged ? 'Souscrire au Business' : 'Contacter',
          ctaAction: logged ? 'checkout:business' : '/login?redirect=/pricing&plan=business',
          popular: false,
          features: [
            { text: `${quotas.business || 5000} analyses/mois`, included: true },
            { text: 'Tout le plan Pro', included: true },
            { text: 'API + clés d\'accès', included: true },
            { text: 'Équipe (5 membres)', included: true },
            { text: 'Exports CSV', included: true },
            { text: 'Support dédié', included: true },
            { text: 'Analyse vidéo deepfake', included: true },
            { text: 'Documentation API', included: true },
            { text: 'Logs d\'appels API', included: true },
          ],
        },
      ]

      setPlans(builtPlans)
    } catch {
      // Fallback statique
      toast.error('Impossible de charger les tarifs dynamiques')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = async (plan) => {
    setCheckoutLoading(plan)
    try {
      const res = await paymentService.checkout(plan)
      const { checkout_url, mode } = res.data

      if (mode === 'simulation') {
        toast.success(`Paiement simulé pour le plan ${plan}`)
        navigate(`/payment/success?plan=${plan}&simulated=true`)
      } else if (checkout_url) {
        window.location.href = checkout_url
      }
    } catch (error) {
      const msg = error.response?.data?.detail || 'Erreur lors du paiement'
      toast.error(msg)
    } finally {
      setCheckoutLoading(null)
    }
  }

  const handleCtaClick = (plan) => {
    if (!plan.ctaAction) return
    if (plan.ctaAction.startsWith('checkout:')) {
      const planId = plan.ctaAction.split(':')[1]
      handleCheckout(planId)
    } else {
      navigate(plan.ctaAction)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Secure IA</span>
            </Link>
            <div className="flex items-center gap-3">
              {logged ? (
                <Link to="/dashboard" className="btn-primary text-sm flex items-center gap-2">
                  Tableau de bord <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    Connexion
                  </Link>
                  <Link to="/register" className="btn-primary text-sm">
                    Essai gratuit
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Titre */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Choisissez votre plan
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Des tarifs transparents, sans engagement. Commencez gratuitement
              et évoluez selon vos besoins.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : (
            <>
              {/* Grille des plans */}
              <div className="grid md:grid-cols-3 gap-8">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`card hover:shadow-lg transition-shadow relative ${
                      plan.popular ? 'border-2 border-primary-500' : ''
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Le plus populaire
                      </div>
                    )}

                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{plan.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{plan.description}</p>

                    <div className="mb-6">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                      <span className="text-gray-500 dark:text-gray-400">/mois</span>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature) => (
                        <li key={feature.text} className="flex items-center gap-2 text-sm">
                          {feature.included ? (
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <X className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                          )}
                          <span className={feature.included ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleCtaClick(plan)}
                      disabled={!plan.ctaAction || checkoutLoading === plan.id}
                      className={`w-full text-center block py-2.5 rounded-lg font-medium transition-colors ${
                        plan.popular ? 'btn-primary' : 'btn-secondary'
                      } ${!plan.ctaAction ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {checkoutLoading === plan.id ? (
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                      ) : (
                        plan.cta
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* Plan Enterprise */}
              <div className="mt-12 card bg-gray-900 text-white text-center">
                <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                <p className="text-gray-400 mb-4">
                  Volume personnalisé, on-premise, SLA garanti. Contactez-nous pour un devis sur mesure.
                </p>
                <a
                  href="mailto:contact@secure-ia.com"
                  className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Nous contacter <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PricingPage
