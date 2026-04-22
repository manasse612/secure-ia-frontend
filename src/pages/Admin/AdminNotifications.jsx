// === Page admin : Gestion des notifications ===
// Permet à l'admin d'envoyer des notifications aux utilisateurs
// Notifications ciblées ou globales

import { useState, useEffect } from 'react'
import {
  Bell, Send, Loader2, Users, User, Info, AlertTriangle,
  CheckCircle, XCircle, Search
} from 'lucide-react'
import { adminService } from '../../services/api'
import toast from 'react-hot-toast'

function AdminNotifications() {
  // Formulaire
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState('info')
  const [targetMode, setTargetMode] = useState('all') // 'all' ou 'user'
  const [targetUserId, setTargetUserId] = useState('')
  const [sending, setSending] = useState(false)

  // Recherche utilisateur
  const [userSearch, setUserSearch] = useState('')
  const [userResults, setUserResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)

  // Historique
  const [notifications, setNotifications] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const res = await adminService.getNotifications({ page: 1, per_page: 20 })
      setNotifications(res.data.notifications || [])
    } catch {
      setNotifications([])
    } finally {
      setLoadingHistory(false)
    }
  }

  // Rechercher un utilisateur
  const handleSearchUser = async () => {
    if (!userSearch.trim()) return
    setSearchLoading(true)
    try {
      const res = await adminService.getUsers({ search: userSearch, per_page: 5 })
      setUserResults(res.data.users || [])
    } catch {
      setUserResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  // Envoyer la notification
  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Veuillez remplir le titre et le message')
      return
    }
    if (targetMode === 'user' && !targetUserId) {
      toast.error('Veuillez sélectionner un utilisateur')
      return
    }

    setSending(true)
    try {
      await adminService.sendNotification({
        user_id: targetMode === 'user' ? targetUserId : null,
        title: title.trim(),
        message: message.trim(),
        type,
      })
      toast.success('Notification envoyée !')
      setTitle('')
      setMessage('')
      setTargetUserId('')
      setUserSearch('')
      setUserResults([])
      loadHistory()
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors de l'envoi")
    } finally {
      setSending(false)
    }
  }

  const typeStyles = {
    info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    warning: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    success: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    error: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
  }

  return (
    <div className="animate-fade-in">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          Envoyez des notifications aux utilisateurs de la plateforme.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* === Formulaire d'envoi === */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Nouvelle notification</h2>

          {/* Destinataire */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Destinataire</label>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => { setTargetMode('all'); setTargetUserId('') }}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  targetMode === 'all'
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                <Users className="w-4 h-4" /> Tous
              </button>
              <button
                onClick={() => setTargetMode('user')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  targetMode === 'user'
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                <User className="w-4 h-4" /> Utilisateur
              </button>
            </div>

            {/* Recherche utilisateur */}
            {targetMode === 'user' && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
                      placeholder="Rechercher par email..."
                      className="input-field pl-10 text-sm"
                    />
                  </div>
                  <button onClick={handleSearchUser} className="btn-secondary text-sm py-2" disabled={searchLoading}>
                    {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Chercher'}
                  </button>
                </div>
                {userResults.length > 0 && (
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                    {userResults.map(u => (
                      <button
                        key={u.id}
                        onClick={() => { setTargetUserId(u.id); setUserResults([]) }}
                        className={`w-full flex items-center gap-3 p-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          targetUserId === u.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                        }`}
                      >
                        <div className="w-7 h-7 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-bold">
                          {u.email?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{u.email}</p>
                          <p className="text-xs text-gray-400">{u.full_name || 'Sans nom'} – {u.role}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {targetUserId && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Utilisateur sélectionné : {targetUserId.substring(0, 8)}...
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(typeStyles).map(([key, style]) => {
                const Icon = style.icon
                return (
                  <button
                    key={key}
                    onClick={() => setType(key)}
                    className={`py-2 px-2 rounded-lg text-xs font-medium flex flex-col items-center gap-1 transition-colors border-2 ${
                      type === key
                        ? `border-primary-500 ${style.bg}`
                        : 'border-transparent bg-gray-50 dark:bg-gray-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${style.color}`} />
                    <span className="capitalize text-gray-700 dark:text-gray-300">{key}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Titre */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Titre</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de la notification"
              className="input-field"
              maxLength={255}
            />
          </div>

          {/* Message */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Contenu du message..."
              rows={4}
              className="input-field resize-none"
            />
          </div>

          {/* Bouton envoyer */}
          <button
            onClick={handleSend}
            disabled={sending || !title.trim() || !message.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {sending ? 'Envoi...' : 'Envoyer la notification'}
          </button>
        </div>

        {/* === Historique === */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Historique</h2>
          {loadingHistory ? (
            <div className="card flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="card text-center py-12">
              <Bell className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Aucune notification envoyée</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map(n => {
                const style = typeStyles[n.type] || typeStyles.info
                const Icon = style.icon
                return (
                  <div key={n.id} className="card py-3 px-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-lg ${style.bg}`}>
                        <Icon className={`w-4 h-4 ${style.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.message}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] text-gray-400">
                            {n.created_at ? new Date(n.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                            }) : ''}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {n.user_id ? `→ ${n.user_id.substring(0, 8)}...` : '→ Tous'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminNotifications
