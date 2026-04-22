// === Composant de mise en page principale ===
// Contient la barre de navigation latérale et le contenu principal
// Utilisé pour toutes les pages après connexion

import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Image, FileText, Globe, History, Video,
  User, LogOut, Shield, Settings, Users, FileWarning,
  Menu, X, Sun, Moon, Bell
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { clearAuth, getUser } from '../services/auth'
import { useTheme } from '../contexts/ThemeContext'
import { authService, adminService } from '../services/api'

// Hook pour charger les notifications
function useNotifications() {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  const loadNotifications = async () => {
    try {
      let res
      try {
        res = await authService.getNotifications()
      } catch {
        res = await adminService.getNotifications()
      }
      setNotifications(res.data.notifications || [])
    } catch {
      setNotifications([])
    }
  }

  const markRead = async (id) => {
    try {
      await authService.markNotificationRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch {}
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return { notifications, unreadCount, markRead }
}

// Composant dropdown de notifications
function NotificationsDropdown({ isOpen, anchorRef, notifications, unreadCount, markRead }) {
  if (!isOpen) return null

  return (
    <div
      ref={anchorRef}
      className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50"
    >
      <div className="p-3 border-b border-gray-100 dark:border-gray-700">
        <p className="font-semibold text-gray-900 dark:text-white text-sm">Notifications</p>
        {unreadCount > 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {unreadCount} non lue(s)
          </span>
        )}
      </div>
      {notifications.length === 0 ? (
        <div className="p-6 text-center text-sm text-gray-400 dark:text-gray-500">
          Aucune notification
        </div>
      ) : (
        notifications.map(n => (
          <div
            key={n.id}
            onClick={() => !n.is_read && markRead(n.id)}
            className={`p-3 border-b border-gray-50 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
              !n.is_read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
            }`}
          >
            <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.message}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
              {n.created_at ? new Date(n.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
              }) : ''}
            </p>
          </div>
        ))
      )}
    </div>
  )
}

function Layout() {
  // État pour le menu mobile
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const user = getUser()
  const { darkMode, toggleTheme } = useTheme()

  // Notifications
  const { notifications, unreadCount, markRead } = useNotifications()
  const [showNotifs, setShowNotifs] = useState(false)
  const notifRef = useRef(null)
  const notifButtonRef = useRef(null)

  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target) &&
          notifButtonRef.current && !notifButtonRef.current.contains(e.target)) {
        setShowNotifs(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {
      // Ignorer l'erreur si le serveur est inaccessible
    }
    clearAuth()
    navigate('/login')
  }

  // Vérifier si on est dans l'espace admin
  const isAdminRoute = location.pathname.startsWith('/admin')

  // Vérifier si l'utilisateur a un plan Pro ou supérieur
  const isProUser = ['pro', 'business', 'admin'].includes(user?.role)

  // Menu principal (utilisateur)
  const mainNavLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/analyze/image', icon: Image, label: 'Analyse image' },
    { to: '/analyze/text', icon: FileText, label: 'Analyse texte' },
    { to: '/analyze/url', icon: Globe, label: 'Analyse URL' },
    { to: '/analyze/video', icon: Video, label: 'Analyse vidéo', disabled: !isProUser },
    { to: '/history', icon: History, label: 'Historique' },
    { to: '/profile', icon: User, label: 'Mon profil' },
  ]

  // Menu admin (visible seulement dans l'espace admin)
  const adminNavLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard admin' },
    { to: '/admin/users', icon: Users, label: 'Utilisateurs' },
    { to: '/admin/subscriptions', icon: Settings, label: 'Abonnements' },
    { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
    { to: '/admin/logs', icon: FileWarning, label: 'Logs système' },
    { to: '/admin/settings', icon: Settings, label: 'Paramètres' },
  ]

  // Lien de retour vers l'application (pour l'espace admin)
  const backLink = {
    to: '/dashboard',
    icon: LayoutDashboard,
    label: 'Retour à l\'application',
    className: 'mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-primary-600 dark:text-primary-400'
  }

  // Déterminer les liens à afficher selon la route
  let linksToShow = mainNavLinks
  
  // Si on est dans l'espace admin, ajouter les liens admin + retour
  if (isAdminRoute) {
    linksToShow = [
      ...adminNavLinks,
      backLink
    ]
  } 
  // Sinon, si l'utilisateur est admin mais pas dans l'espace admin,
  // ajouter un lien vers l'admin
  else if (user?.role === 'admin') {
    linksToShow = [
      ...mainNavLinks,
      {
        to: '/admin',
        icon: Shield,
        label: 'Administration',
        className: 'mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-primary-600 dark:text-primary-400'
      }
    ]
  }

  // Vérifier si un lien est actif (page courante)
  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname === path
  }

  return (
    <div className="flex h-screen bg-[#f5f5f5] dark:bg-[#0f0f0f]">
      {/* === Barre latérale (sidebar) style Gmail/Telegram === */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#1a1a1a] border-r border-gray-200 dark:border-gray-800
          transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo et nom */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center shadow-sm">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">Secure IA</h1>
            <p className="text-xs text-gray-400">Vérification de contenus</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-2 py-3 space-y-0.5 overflow-y-auto h-[calc(100vh-180px)]">
          {linksToShow.map((link) => {
            const Icon = link.icon
            const active = isActive(link.to)

            if (link.disabled) {
              return (
                <div
                  key={link.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                    opacity-50 cursor-not-allowed select-none
                    text-gray-400 dark:text-gray-600
                    ${link.className || ''}`}
                  title="Plan Pro requis"
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1">{link.label}</span>
                  <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500">Pro</span>
                </div>
              )
            }

            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${active
                    ? isAdminRoute && link.to === '/admin'
                      ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                      : 'bg-primary-600/10 text-primary-600 dark:bg-primary-600/20'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
                  }
                  ${link.className || ''}`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Pied de la sidebar (profil + actions) */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1a1a]">
          {/* Boutons d'action (thème, notifications) */}
          <div className="px-3 py-2 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 transition-all"
            >
              {darkMode ? (
                <>
                  <Sun className="w-4 h-4 text-yellow-500" />
                  <span>Clair</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-gray-400" />
                  <span>Sombre</span>
                </>
              )}
            </button>

            <div className="relative">
              <button
                ref={notifButtonRef}
                onClick={() => setShowNotifs(!showNotifs)}
                className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-600 relative rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <NotificationsDropdown
                isOpen={showNotifs}
                anchorRef={notifRef}
                notifications={notifications}
                unreadCount={unreadCount}
                markRead={markRead}
              />
            </div>
          </div>

          {/* Profil utilisateur */}
          <div className="p-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-600/10 dark:bg-primary-600/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-primary-600">
                  {user?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.full_name || user?.email}
                </p>
                <p className="text-xs text-gray-400 capitalize">
                  {user?.role === 'admin' ? 'Administrateur' : user?.role || 'free'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-50 rounded-xl transition-all"
                title="Se déconnecter"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay pour fermer le menu mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* === Contenu principal === */}
      <main className="flex-1 overflow-y-auto">
        {/* Barre supérieure mobile (visible seulement sur mobile) */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">Secure IA</span>
          </div>
          <div className="flex items-center gap-1">
            {/* Notification (mobile) */}
            <div className="relative">
              <button
                ref={notifButtonRef}
                onClick={() => setShowNotifs(!showNotifs)}
                className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-600 relative rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <NotificationsDropdown
                isOpen={showNotifs}
                anchorRef={notifRef}
                notifications={notifications}
                unreadCount={unreadCount}
                markRead={markRead}
              />
            </div>
            {/* Toggle thème mobile */}
            <button 
              onClick={toggleTheme} 
              className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Contenu de la page */}
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout
