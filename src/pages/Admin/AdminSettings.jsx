// === Page Admin : Paramètres du site ===
// Configuration prix/quotas, gestion des offres
// Permet à l'admin de tout contrôler sans toucher au code

import { useState, useEffect } from 'react'
import {
  Settings, Save, Plus, Trash2, Edit3,
  DollarSign, Hash, Megaphone, X, CheckCircle, Loader2,
  Upload, ImageIcon
} from 'lucide-react'
import { adminService } from '../../services/api'
import toast from 'react-hot-toast'

function AdminSettings() {
  // État principal
  const [config, setConfig] = useState({})
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  // Formulaire offre
  const [showOfferForm, setShowOfferForm] = useState(false)
  const [editingOffer, setEditingOffer] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [offerForm, setOfferForm] = useState({
    title: '', description: '', badge_text: '', badge_color: 'primary',
    image_url: '', cta_text: '', cta_link: '', is_active: true, start_date: '', end_date: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [configRes, offersRes] = await Promise.all([
        adminService.getConfig(),
        adminService.getOffers(),
      ])
      setConfig(configRes.data.config || {})
      setOffers(offersRes.data.offers || [])
    } catch {
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  // === Sauvegarder une config ===
  const handleSaveConfig = async (key, value) => {
    setSaving(true)
    try {
      await adminService.updateConfig(key, value)
      toast.success(`${key} mis à jour`)
      setConfig(prev => ({
        ...prev,
        [key]: { ...prev[key], value }
      }))
    } catch {
      toast.error('Erreur de sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  // === Offres ===
  const resetOfferForm = () => {
    setOfferForm({
      title: '', description: '', badge_text: '', badge_color: 'primary',
      image_url: '', cta_text: '', cta_link: '', is_active: true, start_date: '', end_date: ''
    })
    setEditingOffer(null)
    setShowOfferForm(false)
  }

  const handleEditOffer = (offer) => {
    setOfferForm({
      title: offer.title || '',
      description: offer.description || '',
      badge_text: offer.badge_text || '',
      badge_color: offer.badge_color || 'primary',
      image_url: offer.image_url || '',
      cta_text: offer.cta_text || '',
      cta_link: offer.cta_link || '',
      is_active: offer.is_active,
      start_date: offer.start_date ? offer.start_date.split('T')[0] : '',
      end_date: offer.end_date ? offer.end_date.split('T')[0] : '',
    })
    setEditingOffer(offer)
    setShowOfferForm(true)
  }

  const handleSaveOffer = async () => {
    if (!offerForm.title || !offerForm.description) {
      toast.error('Titre et description requis')
      return
    }
    setSaving(true)
    try {
      if (editingOffer) {
        await adminService.updateOffer(editingOffer.id, offerForm)
        toast.success('Offre mise à jour')
      } else {
        await adminService.createOffer(offerForm)
        toast.success('Offre créée')
      }
      resetOfferForm()
      loadData()
    } catch {
      toast.error('Erreur de sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteOffer = async (id) => {
    if (!confirm('Supprimer cette offre ?')) return
    try {
      await adminService.deleteOffer(id)
      toast.success('Offre supprimée')
      loadData()
    } catch {
      toast.error('Erreur de suppression')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6" /> Paramètres du site
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Configurez la plateforme
          </p>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'general', label: 'Général', icon: Settings },
          { id: 'pricing', label: 'Prix & Quotas', icon: DollarSign },
          { id: 'offers', label: 'Offres & Annonces', icon: Megaphone },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* === Onglet Général === */}
      {activeTab === 'general' && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Configuration générale</h3>
            <div className="space-y-4">
              {Object.entries(config)
                .filter(([key]) => !key.startsWith('price_') && !key.startsWith('quota_'))
                .map(([key, conf]) => (
                  <ConfigRow
                    key={key}
                    configKey={key}
                    value={conf.value}
                    description={conf.description}
                    onSave={handleSaveConfig}
                    saving={saving}
                  />
                ))}
            </div>
          </div>
        </div>
      )}

      {/* === Onglet Prix & Quotas === */}
      {activeTab === 'pricing' && (
        <div className="space-y-4">
          {/* Prix */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" /> Prix des plans (€/mois)
            </h3>
            <div className="space-y-4">
              {Object.entries(config)
                .filter(([key]) => key.startsWith('price_'))
                .map(([key, conf]) => (
                  <ConfigRow
                    key={key}
                    configKey={key}
                    value={conf.value}
                    description={conf.description}
                    onSave={handleSaveConfig}
                    saving={saving}
                    type="number"
                    suffix="€"
                  />
                ))}
            </div>
          </div>

          {/* Quotas */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Hash className="w-5 h-5 text-blue-500" /> Quotas d'analyses par mois
            </h3>
            <div className="space-y-4">
              {Object.entries(config)
                .filter(([key]) => key.startsWith('quota_'))
                .map(([key, conf]) => (
                  <ConfigRow
                    key={key}
                    configKey={key}
                    value={conf.value}
                    description={conf.description}
                    onSave={handleSaveConfig}
                    saving={saving}
                    type="number"
                    suffix="analyses"
                  />
                ))}
            </div>
          </div>
        </div>
      )}

      {/* === Onglet Offres === */}
      {activeTab === 'offers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Offres publiées sur la page d'accueil
            </h3>
            <button
              onClick={() => { resetOfferForm(); setShowOfferForm(true) }}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Nouvelle offre
            </button>
          </div>

          {/* Formulaire offre */}
          {showOfferForm && (
            <div className="card border-2 border-primary-200 dark:border-primary-800">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {editingOffer ? 'Modifier l\'offre' : 'Nouvelle offre'}
                </h4>
                <button onClick={resetOfferForm} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre *</label>
                  <input
                    value={offerForm.title}
                    onChange={e => setOfferForm(p => ({ ...p, title: e.target.value }))}
                    className="input-field"
                    placeholder="Ex: Offre de lancement"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Badge</label>
                  <div className="flex gap-2">
                    <input
                      value={offerForm.badge_text}
                      onChange={e => setOfferForm(p => ({ ...p, badge_text: e.target.value }))}
                      className="input-field flex-1"
                      placeholder="Ex: -50%"
                    />
                    <select
                      value={offerForm.badge_color}
                      onChange={e => setOfferForm(p => ({ ...p, badge_color: e.target.value }))}
                      className="input-field w-32"
                    >
                      <option value="primary">Bleu</option>
                      <option value="green">Vert</option>
                      <option value="red">Rouge</option>
                      <option value="orange">Orange</option>
                    </select>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image</label>
                  <div className="flex gap-2 items-start">
                    <div className="flex-1">
                      <input
                        value={offerForm.image_url}
                        onChange={e => setOfferForm(p => ({ ...p, image_url: e.target.value }))}
                        className="input-field"
                        placeholder="URL de l'image ou uploadez un fichier"
                      />
                    </div>
                    <label className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm cursor-pointer transition-colors ${
                      uploading
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-wait'
                        : 'bg-primary-600 hover:bg-primary-700 text-white'
                    }`}>
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {uploading ? 'Upload...' : 'Uploader'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading}
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          setUploading(true)
                          try {
                            const res = await adminService.uploadImage(file)
                            const url = res.data.url
                            setOfferForm(p => ({ ...p, image_url: url }))
                            toast.success('Image uploadee')
                          } catch (err) {
                            toast.error(err.response?.data?.detail || 'Erreur lors de l\'upload')
                          } finally {
                            setUploading(false)
                            e.target.value = ''
                          }
                        }}
                      />
                    </label>
                  </div>
                  {offerForm.image_url && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 max-h-40 relative group">
                      <img src={offerForm.image_url} alt="Apercu" className="w-full h-40 object-cover" onError={e => e.target.style.display='none'} />
                      <button
                        type="button"
                        onClick={() => setOfferForm(p => ({ ...p, image_url: '' }))}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                  <textarea
                    value={offerForm.description}
                    onChange={e => setOfferForm(p => ({ ...p, description: e.target.value }))}
                    className="input-field"
                    rows={3}
                    placeholder="Décrivez l'offre..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Texte du bouton</label>
                  <input
                    value={offerForm.cta_text}
                    onChange={e => setOfferForm(p => ({ ...p, cta_text: e.target.value }))}
                    className="input-field"
                    placeholder="Ex: En profiter"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lien du bouton</label>
                  <input
                    value={offerForm.cta_link}
                    onChange={e => setOfferForm(p => ({ ...p, cta_link: e.target.value }))}
                    className="input-field"
                    placeholder="Ex: /pricing"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date début</label>
                  <input
                    type="date"
                    value={offerForm.start_date}
                    onChange={e => setOfferForm(p => ({ ...p, start_date: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date fin</label>
                  <input
                    type="date"
                    value={offerForm.end_date}
                    onChange={e => setOfferForm(p => ({ ...p, end_date: e.target.value }))}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={offerForm.is_active}
                    onChange={e => setOfferForm(p => ({ ...p, is_active: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Active</span>
                </label>
                <div className="flex-1" />
                <button onClick={resetOfferForm} className="btn-secondary text-sm">Annuler</button>
                <button onClick={handleSaveOffer} disabled={saving} className="btn-primary text-sm flex items-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingOffer ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </div>
          )}

          {/* Liste des offres */}
          {offers.length === 0 ? (
            <div className="card text-center py-12">
              <Megaphone className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Aucune offre publiée</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Créez une offre pour l'afficher sur la page d'accueil
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {offers.map(offer => (
                <div key={offer.id} className="card flex items-start gap-4 justify-between">
                  {offer.image_url && (
                    <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                      <img src={offer.image_url} alt="" className="w-full h-full object-cover" onError={e => e.target.parentElement.style.display='none'} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{offer.title}</h4>
                      {offer.badge_text && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          offer.badge_color === 'green' ? 'bg-green-100 text-green-700' :
                          offer.badge_color === 'red' ? 'bg-red-100 text-red-700' :
                          offer.badge_color === 'orange' ? 'bg-orange-100 text-orange-700' :
                          'bg-primary-100 text-primary-700'
                        }`}>
                          {offer.badge_text}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        offer.is_active
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {offer.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{offer.description}</p>
                    {(offer.start_date || offer.end_date) && (
                      <p className="text-xs text-gray-400 mt-1">
                        {offer.start_date && `Du ${new Date(offer.start_date).toLocaleDateString('fr-FR')}`}
                        {offer.end_date && ` au ${new Date(offer.end_date).toLocaleDateString('fr-FR')}`}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <button
                      onClick={() => handleEditOffer(offer)}
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteOffer(offer.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// === Composant ligne de configuration ===
function ConfigRow({ configKey, value, description, onSave, saving, type = 'text', suffix = '' }) {
  const [editValue, setEditValue] = useState(value)
  const [editing, setEditing] = useState(false)
  const changed = editValue !== value

  const label = configKey
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())

  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          type={type}
          value={editValue}
          onChange={e => { setEditValue(e.target.value); setEditing(true) }}
          className="input-field w-32 text-sm text-right"
        />
        {suffix && <span className="text-xs text-gray-400 w-16">{suffix}</span>}
        {changed && (
          <button
            onClick={() => { onSave(configKey, editValue); setEditing(false) }}
            disabled={saving}
            className="p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

export default AdminSettings
