// === Page du tableau de bord administrateur ===
// Affiche les KPIs principaux : utilisateurs, analyses, revenus
// Réservée aux utilisateurs avec le rôle "admin"

import { useState, useEffect } from 'react'
import { 
  Users, 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Shield, 
  Loader2,
  AlertCircle,
  RefreshCw,
  DollarSign,
  CreditCard,
  PieChart,
  Image,
  FileText,
  Globe,
  Video,
  Clock,
  Zap
} from 'lucide-react'
import { adminService, publicService } from '../../services/api'

function AdminDashboard() {
  // Mode démo (données simulées)
  const isDemoMode = false
  
  // État du composant avec valeurs par défaut sécurisées
  const [stats, setStats] = useState({
    users: { 
      total: 0, 
      active: 0, 
      by_role: { 
        free: 0, 
        pro: 0, 
        business: 0, 
        admin: 0 
      } 
    },
    analyses: { 
      total: 0, 
      today: 0 
    },
    revenue: {
      total: 0,
      by_plan: {},
      currency: 'EUR'
    }
  })

  const [activity, setActivity] = useState({
    daily: [],
    by_type: {},
    recent: [],
    api_usage: {},
    total_api_cost: 0,
  })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [dynamicPricing, setDynamicPricing] = useState({ pro: 29.90, business: 99.90 })

  // Charger les statistiques et la config au montage
  useEffect(() => {
    publicService.getConfig()
      .then(res => {
        const p = res.data?.pricing || {}
        setDynamicPricing({ pro: parseFloat(p.pro) || 29.90, business: parseFloat(p.business) || 99.90 })
      })
      .catch(() => {})
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [dashRes, actRes] = await Promise.allSettled([
        adminService.getDashboard(),
        adminService.getActivity(),
      ])

      if (dashRes.status === 'fulfilled') {
        setStats(dashRes.value.data)
      } else {
        throw dashRes.reason
      }

      if (actRes.status === 'fulfilled') {
        setActivity(actRes.value.data)
      }

      setLastUpdate(new Date())
      
    } catch (error) {
      console.error('Erreur chargement dashboard:', error)
      
      // Gestion des erreurs spécifiques
      if (error.response?.status === 401) {
        setError("Non autorisé. Veuillez vous reconnecter.")
      } else if (error.response?.status === 403) {
        setError("Accès refusé. Droits administrateur requis.")
      } else if (error.code === 'ERR_NETWORK') {
        setError("Impossible de contacter le serveur.")
      }
      
    } finally {
      setLoading(false)
    }
  }

  // Calculer le pourcentage pour les barres de progression
  const calculatePercentage = (count, total) => {
    if (!total || total === 0) return 0
    return Math.max(1, (count / total) * 100)
  }

  // Formater les nombres
  const formatNumber = (num) => {
    return num?.toLocaleString('fr-FR') || '0'
  }

  // Formater la devise
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: stats.revenue.currency || 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0)
  }

  // Calculer les pourcentages de variation (simulés pour l'instant)
  // Dans une vraie app, ces données viendraient du backend
  const getChangePercentage = (key) => {
    const changes = {
      users: '+12',
      active: '+8',
      analyses: '+23',
      today: '+5'
    }
    return changes[key] || '0'
  }

  // Cartes de KPIs avec données sécurisées
  const kpis = [
    {
      label: 'Utilisateurs totaux',
      value: formatNumber(stats?.users?.total),
      icon: Users,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      change: getChangePercentage('users'),
      bgColor: 'dark:bg-blue-900/30'
    },
    {
      label: 'Utilisateurs actifs',
      value: formatNumber(stats?.users?.active),
      icon: Activity,
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      change: getChangePercentage('active'),
    },
    {
      label: 'Analyses totales',
      value: formatNumber(stats?.analyses?.total),
      icon: BarChart3,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
      change: getChangePercentage('analyses'),
    },
    {
      label: "Analyses aujourd'hui",
      value: formatNumber(stats?.analyses?.today),
      icon: TrendingUp,
      color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
      change: getChangePercentage('today'),
    },
  ]

  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Chargement du tableau de bord...</p>
      </div>
    )
  }

  // Affichage en cas d'erreur critique
  if (error && !isDemoMode) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
            Erreur de chargement
          </h2>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={loadDashboard}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* En-tête avec mode démo et rafraîchissement */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Administration</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            Vue d'ensemble de la plateforme Secure IA.
            {lastUpdate && (
              <span className="text-xs ml-2 text-gray-400">
                Dernière mise à jour : {lastUpdate.toLocaleTimeString('fr-FR')}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={loadDashboard}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grille de KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div 
              key={kpi.label} 
              className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                  +{kpi.change}%
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{kpi.label}</p>
            </div>
          )
        })}
      </div>

      {/* Répartition par rôle et revenus */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Carte : Répartition par plan */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Répartition par plan
          </h2>
          <div className="space-y-4">
            {[
              { 
                label: 'Gratuit (Public)', 
                key: 'public',
                color: 'bg-gray-400 dark:bg-gray-500',
                textColor: 'text-gray-600 dark:text-gray-400'
              },
              { 
                label: 'Pro', 
                key: 'pro',
                color: 'bg-primary-500',
                textColor: 'text-primary-600 dark:text-primary-400'
              },
              { 
                label: 'Business', 
                key: 'business',
                color: 'bg-accent-500',
                textColor: 'text-accent-600 dark:text-accent-400'
              },
              { 
                label: 'Administrateur', 
                key: 'admin',
                color: 'bg-red-500',
                textColor: 'text-red-600 dark:text-red-400'
              },
            ].map((item) => {
              const count = stats?.users?.by_role?.[item.key] || 0
              const total = stats?.users?.total || 1
              const percentage = calculatePercentage(count, total)
              
              return (
                <div key={item.key}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {count.toLocaleString('fr-FR')}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        ({Math.round(percentage)}%)
                      </span>
                    </div>
                  </div>
                  <div 
                    className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-label={`${item.label} : ${percentage}%`}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Total utilisateurs */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">Total</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {formatNumber(stats?.users?.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Carte : Revenus réels (basés sur les abonnements) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Revenus mensuels
              </h2>
              <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                Abonnements actifs
              </span>
            </div>
            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          
          <div className="space-y-3">
            {/* Parcourir les revenus par plan */}
            {Object.entries(stats.revenue?.by_plan || {}).map(([plan, amount]) => {
              if (amount === 0) return null
              
              const planLabels = {
                pro: 'Plan Pro',
                business: 'Plan Business',
                enterprise: 'Plan Enterprise'
              }
              
              const planColors = {
                pro: 'bg-blue-50 dark:bg-blue-900/20',
                business: 'bg-purple-50 dark:bg-purple-900/20',
                enterprise: 'bg-green-50 dark:bg-green-900/20'
              }
              
              return (
                <div 
                  key={plan} 
                  className={`flex items-center justify-between p-3 rounded-lg ${planColors[plan] || 'bg-gray-50 dark:bg-gray-700/50'}`}
                >
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                      {planLabels[plan] || plan}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {stats.users?.by_role?.[plan] || 0} abonnements actifs
                    </span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatCurrency(amount)}
                  </span>
                </div>
              )
            })}

            {/* Si aucun revenu */}
            {(!stats.revenue?.by_plan || Object.keys(stats.revenue.by_plan).length === 0) && (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucun revenu enregistré</p>
              </div>
            )}

            {/* Séparateur */}
            {(stats.revenue?.by_plan && Object.keys(stats.revenue.by_plan).length > 0) && (
              <>
                <hr className="border-gray-200 dark:border-gray-600 my-4" />

                {/* Total */}
                <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <div>
                    <span className="text-sm font-semibold text-primary-800 dark:text-primary-300">
                      Total mensuel
                    </span>
                    {isDemoMode && (
                      <span className="text-xs text-primary-600 dark:text-primary-400 block">
                        * hors taxes
                      </span>
                    )}
                  </div>
                  <span className="text-xl font-bold text-primary-700 dark:text-primary-400">
                    {formatCurrency(stats.revenue?.total || 0)}
                  </span>
                </div>
              </>
            )}

            {/* Note pour les abonnements annuels */}
            <p className="text-xs text-center text-gray-500 dark:text-gray-500 mt-4">
              Les montants affichés correspondent aux abonnements mensuels actifs
            </p>
          </div>
        </div>
      </div>

      {/* Graphique d'activité + Utilisation APIs */}
      <div className="mt-8 grid lg:grid-cols-2 gap-6">

        {/* Graphique : Analyses par jour (7 derniers jours) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Activité (7 derniers jours)
              </h2>
            </div>
            {activity.by_type && (
              <div className="flex gap-2">
                {[
                  { key: 'image', icon: Image, color: 'text-blue-500' },
                  { key: 'text', icon: FileText, color: 'text-green-500' },
                  { key: 'url', icon: Globe, color: 'text-purple-500' },
                  { key: 'video', icon: Video, color: 'text-orange-500' },
                ].map(t => (
                  <span key={t.key} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400" title={`${t.key}: ${activity.by_type[t.key] || 0}`}>
                    <t.icon className={`w-3 h-3 ${t.color}`} />
                    {activity.by_type[t.key] || 0}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Bar chart CSS */}
          {activity.daily?.length > 0 ? (
            <div className="flex items-end gap-2 h-40">
              {(() => {
                const maxCount = Math.max(...activity.daily.map(d => d.count), 1)
                return activity.daily.map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{day.count}</span>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-t-md relative" style={{ height: '120px' }}>
                      <div
                        className="absolute bottom-0 w-full bg-primary-500 dark:bg-primary-400 rounded-t-md transition-all duration-500"
                        style={{ height: `${Math.max((day.count / maxCount) * 100, day.count > 0 ? 8 : 2)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate w-full text-center">{day.label}</span>
                  </div>
                ))
              })()}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BarChart3 className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-sm text-gray-400">Aucune activité récente</p>
            </div>
          )}

          {/* Dernières analyses */}
          {activity.recent?.length > 0 && (
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Dernières analyses
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {activity.recent.slice(0, 5).map((a) => {
                  const typeIcons = { image: Image, text: FileText, url: Globe, video: Video }
                  const typeColors = { image: 'text-blue-500', text: 'text-green-500', url: 'text-purple-500', video: 'text-orange-500' }
                  const TypeIcon = typeIcons[a.type] || FileText
                  return (
                    <div key={a.id} className="flex items-center justify-between text-sm py-1.5 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <div className="flex items-center gap-2">
                        <TypeIcon className={`w-4 h-4 ${typeColors[a.type] || 'text-gray-400'}`} />
                        <span className="text-gray-600 dark:text-gray-400 capitalize">{a.type}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {a.score != null && (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            a.score >= 70 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            a.score >= 40 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>{Math.round(a.score)}%</span>
                        )}
                        <span className="text-xs text-gray-400">
                          {a.created_at ? new Date(a.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Utilisation des APIs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Utilisation des APIs
              </h2>
            </div>
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
              Coût total estimé : ${activity.total_api_cost?.toFixed(2) || '0.00'}
            </span>
          </div>

          <div className="space-y-4">
            {[
              { key: 'hive_ai', label: 'Hive AI', color: 'bg-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20', textColor: 'text-blue-700 dark:text-blue-400', icon: '🐝' },
              { key: 'openai', label: 'OpenAI', color: 'bg-green-500', bgColor: 'bg-green-50 dark:bg-green-900/20', textColor: 'text-green-700 dark:text-green-400', icon: '🤖' },
              { key: 'virustotal', label: 'VirusTotal', color: 'bg-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-900/20', textColor: 'text-purple-700 dark:text-purple-400', icon: '🛡️' },
            ].map((api) => {
              const data = activity.api_usage?.[api.key] || { calls: 0, estimated_cost: 0, description: '' }
              const totalCalls = Object.values(activity.api_usage || {}).reduce((sum, v) => sum + (v.calls || 0), 0) || 1
              const pct = Math.round((data.calls / totalCalls) * 100)
              
              return (
                <div key={api.key} className={`p-4 rounded-xl ${api.bgColor}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{api.icon}</span>
                      <div>
                        <p className={`text-sm font-semibold ${api.textColor}`}>{api.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{data.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{data.calls.toLocaleString('fr-FR')}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">appels</p>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-white/50 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${api.color}`}
                      style={{ width: `${Math.max(pct, data.calls > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{pct}% du total</span>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      ~${data.estimated_cost?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Résumé coûts */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Coût total estimé</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                ${activity.total_api_cost?.toFixed(2) || '0.00'}
              </span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Estimations basées sur le nombre d'appels API enregistrés
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard