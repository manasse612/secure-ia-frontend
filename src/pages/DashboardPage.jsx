// === Page du tableau de bord ===
// Vue principale après connexion : résumé des analyses, actions rapides
// Affiche les statistiques de l'utilisateur et les dernières analyses

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Image, FileText, Globe, Video, ArrowRight, TrendingUp,
  Clock, CheckCircle, AlertTriangle, XCircle, Shield, Zap, BarChart3, Lock, Eye
} from 'lucide-react'
import { analysisService } from '../services/api'
import { getUser, isPro } from '../services/auth'

function DashboardPage() {
  const user = getUser()
  const [recentAnalyses, setRecentAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [quota, setQuota] = useState(null)

  // Charger les analyses récentes et le quota au montage
  useEffect(() => {
    loadRecentAnalyses()
    loadQuota()
  }, [])

  const loadQuota = async () => {
    try {
      const response = await analysisService.getQuota()
      setQuota(response.data)
    } catch (error) {
      setQuota(null)
    }
  }

  const loadRecentAnalyses = async () => {
    try {
      const response = await analysisService.getHistory({ page: 1, per_page: 5 })
      setRecentAnalyses(response.data.analyses || [])
    } catch (error) {
      setRecentAnalyses([])
    } finally {
      setLoading(false)
    }
  }

  // Actions rapides disponibles
  const quickActions = [
    {
      to: '/analyze/image',
      icon: Image,
      label: 'Analyser une image',
      description: 'Détection IA, métadonnées',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      to: '/analyze/text',
      icon: FileText,
      label: 'Vérifier un texte',
      description: 'Fact-checking, NLP',
      color: 'bg-green-100 text-green-600',
    },
    {
      to: '/analyze/url',
      icon: Globe,
      label: 'Scanner un site web',
      description: 'SSL, sécurité, réputation',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      to: '/analyze/video',
      icon: Video,
      label: 'Analyse vidéo',
      description: isPro() ? 'Détection deepfake' : 'Plan Pro requis',
      color: 'bg-orange-100 text-orange-600',
      disabled: !isPro(),
    },
  ]

  // Fonction pour obtenir l'icône du verdict
  const getVerdictBadge = (verdict) => {
    switch (verdict) {
      case 'authentique':
      case 'vrai':
      case 'securise':
        return <span className="score-high"><CheckCircle className="w-3 h-3 mr-1" /> Fiable</span>
      case 'suspect':
      case 'non_verifiable':
      case 'risque_modere':
        return <span className="score-medium"><AlertTriangle className="w-3 h-3 mr-1" /> Suspect</span>
      case 'deepfake':
      case 'faux':
      case 'dangereux':
        return <span className="score-low"><XCircle className="w-3 h-3 mr-1" /> Danger</span>
      default:
        return <span className="score-medium">En cours</span>
    }
  }

  // Fonction pour obtenir l'icône du type d'analyse
  const getTypeIcon = (type) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />
      case 'text': return <FileText className="w-4 h-4" />
      case 'url': return <Globe className="w-4 h-4" />
      case 'video': return <Video className="w-4 h-4" />
      default: return <Shield className="w-4 h-4" />
    }
  }

  // Calculer les statistiques de fiabilité
  const getReliabilityStats = () => {
    if (!recentAnalyses.length) return { reliable: 0, suspicious: 0, dangerous: 0 }
    const reliable = recentAnalyses.filter(a => ['authentique', 'vrai', 'securise'].includes(a.verdict)).length
    const suspicious = recentAnalyses.filter(a => ['suspect', 'non_verifiable', 'risque_modere'].includes(a.verdict)).length
    const dangerous = recentAnalyses.filter(a => ['deepfake', 'faux', 'dangereux'].includes(a.verdict)).length
    return { reliable, suspicious, dangerous, total: recentAnalyses.length }
  }

  // Générer les données du graphique d'activité (7 derniers jours)
  const getActivityData = () => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    const today = new Date()
    return [...Array(7)].map((_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() - (6 - i))
      const dayName = days[date.getDay()]
      const count = recentAnalyses.filter(a => {
        const aDate = new Date(a.created_at)
        return aDate.toDateString() === date.toDateString()
      }).length
      return { day: dayName, count, isToday: i === 6 }
    })
  }

  const reliability = getReliabilityStats()
  const activityData = getActivityData()
  const maxActivity = Math.max(...activityData.map(d => d.count), 1)

  if (loading) {
    return (
      <div className="animate-fade-in space-y-6">
        {/* Skeleton header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl animate-skeleton" />
          <div className="space-y-2">
            <div className="h-6 w-48 rounded-lg animate-skeleton" />
            <div className="h-4 w-32 rounded-lg animate-skeleton" />
          </div>
        </div>
        {/* Skeleton stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card">
              <div className="h-4 w-24 rounded animate-skeleton mb-3" />
              <div className="h-8 w-16 rounded animate-skeleton" />
            </div>
          ))}
        </div>
        {/* Skeleton quick actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl animate-skeleton" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-28 rounded animate-skeleton" />
                <div className="h-3 w-20 rounded animate-skeleton" />
              </div>
            </div>
          ))}
        </div>
        {/* Skeleton recent list */}
        <div className="card">
          <div className="h-5 w-40 rounded animate-skeleton mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div className="w-8 h-8 rounded-lg animate-skeleton" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 rounded animate-skeleton" />
                  <div className="h-3 w-24 rounded animate-skeleton" />
                </div>
                <div className="h-6 w-16 rounded-full animate-skeleton" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* === Bannière quota épuisé === */}
      {quota && quota.remaining === 0 && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-800 dark:text-red-300">
              Quota mensuel atteint ({quota.used}/{quota.limit} analyses)
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              Vous avez utilisé toutes vos analyses du mois. Passez à un plan supérieur ou attendez la réinitialisation mensuelle.
            </p>
            {user?.role === 'free' && (
              <Link to="/pricing" className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200">
                Passer au plan Pro <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* === Bannière quota presque épuisé === */}
      {quota && quota.remaining > 0 && quota.percentage >= 80 && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-yellow-800 dark:text-yellow-300">
              Quota presque atteint – {quota.remaining} analyse(s) restante(s)
            </p>
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
              Vous avez utilisé {quota.used} sur {quota.limit} analyses ce mois-ci.
            </p>
          </div>
        </div>
      )}

      {/* === En-tête du dashboard === */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Bonjour, {user?.full_name || user?.email?.split('@')[0]} !
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Bienvenue sur votre espace Secure IA. Que souhaitez-vous vérifier aujourd'hui ?
        </p>
      </div>

      {/* === Statistiques rapides === */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Analyses ce mois</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{quota?.used ?? recentAnalyses.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Plan actuel</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white capitalize">{user?.role || 'Free'}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Quota mensuel</p>
              <p className={`text-lg font-bold ${quota?.remaining === 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                {quota ? `${quota.remaining} restantes` : '...'}
              </p>
            </div>
          </div>
          {/* Barre de progression */}
          {quota && (
            <div className="mt-1">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    quota.percentage >= 90 ? 'bg-red-500' : 
                    quota.percentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(quota.percentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{quota.used}/{quota.limit} utilisées</p>
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Dernière analyse</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {recentAnalyses[0]?.created_at
                  ? new Date(recentAnalyses[0].created_at).toLocaleDateString('fr-FR')
                  : 'Aucune'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* === Section Pro : Graphique et Statistiques avancées === */}
      {recentAnalyses.length > 0 && (
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Graphique d'activité */}
          <div className="card lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-500" />
                Activité des 7 derniers jours
              </h3>
              <span className="text-sm text-gray-500">{recentAnalyses.length} analyses</span>
            </div>
            <div className="flex items-end justify-between gap-2 h-32 px-2">
              {activityData.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                  <div 
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      day.isToday ? 'bg-primary-500' : 'bg-primary-200 dark:bg-primary-700'
                    }`}
                    style={{ height: `${(day.count / maxActivity) * 100}%`, minHeight: day.count > 0 ? '4px' : '0' }}
                  />
                  <span className={`text-xs ${day.isToday ? 'font-semibold text-primary-600' : 'text-gray-500'}`}>
                    {day.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Répartition fiabilité + Conseil */}
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                Répartition des résultats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500" />
                    Fiable
                  </span>
                  <span className="font-semibold text-green-600">{Math.round(reliability.reliable / reliability.total * 100) || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${(reliability.reliable / reliability.total * 100) || 0}%` }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-yellow-500" />
                    Suspect
                  </span>
                  <span className="font-semibold text-yellow-600">{Math.round(reliability.suspicious / reliability.total * 100) || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full transition-all" style={{ width: `${(reliability.suspicious / reliability.total * 100) || 0}%` }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    Danger
                  </span>
                  <span className="font-semibold text-red-600">{Math.round(reliability.dangerous / reliability.total * 100) || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full transition-all" style={{ width: `${(reliability.dangerous / reliability.total * 100) || 0}%` }} />
                </div>
              </div>
            </div>

            {/* Conseil de sécurité personnalisé */}
            <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300 text-sm">Conseil sécurité</h4>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                    {reliability.dangerous > 2 
                      ? "⚠️ Vous avez analysé plusieurs contenus dangereux. Méfiez-vous des liens suspects."
                      : reliability.suspicious > 3
                      ? "👁️ Plusieurs contenus suspects détectés. Vérifiez toujours la source."
                      : "✅ Bonne hygiène numérique ! Continuez à vérifier vos sources."
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === Actions rapides === */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions rapides</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.label}
                to={action.disabled ? '#' : action.to}
                className={`card hover:shadow-md transition-all group ${
                  action.disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${action.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{action.label}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{action.description}</p>
              </Link>
            )
          })}
        </div>
      </div>

      {/* === Dernières analyses === */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dernières analyses</h2>
          <Link to="/history" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
            Voir tout <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="card flex items-center justify-center py-12">
            <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : recentAnalyses.length > 0 ? (
          <div className="card divide-y divide-gray-100 dark:divide-gray-700">
            {recentAnalyses.map((analysis) => (
              <Link
                key={analysis.id}
                to={`/analysis/${analysis.id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 py-3 first:pt-0 last:pb-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 -mx-6 px-6 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    {getTypeIcon(analysis.analysis_type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {analysis.input_data?.substring(0, 60)}...
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(analysis.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pl-11 sm:pl-0 flex-shrink-0">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {analysis.score?.toFixed(0)}/100
                  </span>
                  {getVerdictBadge(analysis.verdict)}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <Shield className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">Aucune analyse pour le moment</p>
            <Link to="/analyze/image" className="btn-primary inline-flex items-center gap-2">
              Lancer ma première analyse <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
