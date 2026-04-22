// === Page d'accueil de Secure IA ===
// Présente la plateforme, ses fonctionnalités et les plans tarifaires
// Design premium de niveau "géant de la tech"

import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Shield, Image, FileText, Globe, Video, ArrowRight,
  CheckCircle, Zap, Lock, Eye, Users, Megaphone,
  Menu, X, Loader2, AlertTriangle, Sparkles, Cloud,
  Layers, Cpu, TrendingUp, Award, ChevronRight, Chrome, Apple,
  MessageSquare, BarChart3, Fingerprint, Server, Bell,
  Download, Share2, ThumbsUp, Clock, Heart, Facebook,
  Twitter, Linkedin, Github
} from 'lucide-react'
import { isAuthenticated } from '../services/auth'
import { publicService } from '../services/api'

function HomePage() {
  const navigate = useNavigate()
  const [offers, setOffers] = useState([])
  const [plans, setPlans] = useState(null)
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [showFAQModal, setShowFAQModal] = useState(false)
  const [showCGUModal, setShowCGUModal] = useState(false)
  const [hoveredCard, setHoveredCard] = useState(null) // AJOUTÉ : state manquant
  const heroRef = useRef(null)

  useEffect(() => {
    // Charger les offres et les plans en parallèle
    Promise.all([
      publicService.getOffers().then(res => setOffers(res.data.offers || [])).catch(() => {}),
      publicService.getConfig().then(res => {
        setPlans(res.data)
      }).catch(() => {}),
    ]).finally(() => setLoadingPlans(false))

    // Scroll handler pour navbar dynamique
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-rotation des features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const formatPrice = (val) => {
    if (val == null) return '—'
    const num = parseFloat(val)
    if (num === 0) return '0€'
    return `${num.toFixed(2).replace('.', ',')}€`
  }

  const getQuota = (planId) => {
    if (!plans) return '—'
    return plans.quotas?.[planId] ?? '—'
  }

  const getPrice = (planId) => {
    if (!plans) return '—'
    return plans.pricing?.[planId] ?? 0
  }

  const pricingCards = plans ? [
    {
      id: 'free',
      name: 'Free',
      desc: 'Pour démarrer',
      price: formatPrice(getPrice('free')),
      popular: false,
      cta: isAuthenticated() ? 'Plan actuel' : 'Commencer',
      ctaLink: isAuthenticated() ? null : '/register',
      features: [
        `${getQuota('free')} analyses/mois`,
        'Analyse d\'images',
        'Analyse de texte',
        'Analyse URL basique',
        'Historique (10 dernières)',
        'Export PDF simple',
      ],
      color: 'from-gray-500 to-gray-600'
    },
    {
      id: 'pro',
      name: 'Pro',
      desc: 'Pour les pros',
      price: formatPrice(getPrice('pro')),
      popular: true,
      cta: isAuthenticated() ? 'Souscrire' : 'Essayer Pro',
      ctaLink: isAuthenticated() ? '/pricing?plan=pro' : '/login?redirect=/pricing&plan=pro',
      features: [
        `${getQuota('pro')} analyses/mois`,
        'Analyse video deepfake',
        'Scan site web complet',
        'Fact-checking avancé',
        'Rapports PDF sans marque',
        'Support prioritaire',
      ],
      color: 'from-primary-500 to-primary-600'
    },
    {
      id: 'business',
      name: 'Business',
      desc: 'Pour les entreprises',
      price: formatPrice(getPrice('business')),
      popular: false,
      cta: isAuthenticated() ? 'Souscrire' : 'Contacter',
      ctaLink: isAuthenticated() ? '/pricing?plan=business' : '/login?redirect=/pricing&plan=business',
      features: [
        `${getQuota('business')} analyses/mois`,
        'Tout le plan Pro',
        'API + clés d\'accès',
        'Équipe (5 membres)',
        'Support dédié',
        'Exports CSV',
      ],
      color: 'from-purple-500 to-purple-600'
    },
  ] : []

  const features = [
    {
      icon: Image,
      title: 'Analyse d\'images',
      desc: 'Détection IA avancée, métadonnées EXIF, score d\'authenticité. Identifiez les images générées ou manipulées en quelques secondes.',
      color: 'from-blue-500 to-cyan-500',
      stat: '99.7% précision',
      path: '/analyze/image'
    },
    {
      icon: FileText,
      title: 'Fact-checking',
      desc: 'Analyse NLP, croisement de sources, détection de biais. Vérifiez la véracité des informations avec notre base de données de sources fiables.',
      color: 'from-green-500 to-emerald-500',
      stat: '50M+ sources',
      path: '/analyze/text'
    },
    {
      icon: Globe,
      title: 'Sécurité URL',
      desc: 'SSL, réputation, malwares, en-têtes de sécurité. Protégez-vous des sites dangereux avec notre scanner en temps réel.',
      color: 'from-purple-500 to-pink-500',
      stat: '100% temps réel',
      path: '/analyze/url'
    },
    {
      icon: Video,
      title: 'Détection deepfake',
      desc: 'Analyse vidéo trame par trame, détection de voix synthétique et de face swap par IA de dernière génération.',
      color: 'from-orange-500 to-red-500',
      stat: '98.5% précision',
      path: '/analyze/video'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-[#0a0a0a]">
      
      {/* === Navbar ultra premium avec blur === */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-gray-200/20 dark:border-gray-800/20 shadow-lg' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo avec animation */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                Secure IA
              </span>
            </Link>

            {/* Liens de navigation — desktop */}
            <div className="hidden md:flex items-center gap-1">
              <a
                href="#features"
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 rounded-full transition-all hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
              >
                Fonctionnalités
              </a>
              <a
                href="#how-it-works"
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 rounded-full transition-all hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
              >
                Solutions
              </a>
              <a
                href="#pricing"
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 rounded-full transition-all hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
              >
                Tarifs
              </a>
              <Link
                to="/contact"
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 rounded-full transition-all hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
              >
                Contact
              </Link>
            </div>

            {/* Boutons d'action — desktop */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated() ? (
                <Link 
                  to="/dashboard" 
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-sm font-medium rounded-full transition-all shadow-md hover:shadow-xl"
                >
                  Tableau de bord <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link to="/login" className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 rounded-full transition-all">
                    Connexion
                  </Link>
                  <Link 
                    to="/register" 
                    className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-sm font-medium rounded-full transition-all shadow-md hover:shadow-xl"
                  >
                    Essai gratuit
                  </Link>
                </>
              )}
            </div>

            {/* Hamburger — mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu premium */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-gray-200/20 dark:border-gray-800/20 shadow-xl">
            <div className="px-4 py-6 space-y-3">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 rounded-xl transition-all"
              >
                Fonctionnalités
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 rounded-xl transition-all"
              >
                Solutions
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 rounded-xl transition-all"
              >
                Tarifs
              </a>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 rounded-xl transition-all"
              >
                Contact
              </Link>
              <div className="pt-4 space-y-3">
                {isAuthenticated() ? (
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-sm font-medium rounded-full transition-all">
                    Tableau de bord
                  </Link>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 rounded-full transition-all">
                      Connexion
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-sm font-medium rounded-full transition-all">
                      Essai gratuit
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* === Hero section avec animation et gradient === */}
      <section ref={heroRef} className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background gradient animé */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-transparent to-purple-50 dark:from-primary-950/20 dark:via-transparent dark:to-purple-950/20"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge premium */}
            <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-full px-4 py-2 mb-8 shadow-sm">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-medium bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                L'IA la plus avancée pour la vérification de contenu
              </span>
            </div>

            {/* Titre principal avec gradient animé */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                Vérifiez l'authenticité
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-primary-600 bg-clip-text text-transparent animate-gradient">
                de tout contenu numérique
              </span>
            </h1>

            {/* Sous-titre */}
            <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Détectez les deepfakes, vérifiez les informations et analysez la sécurité des sites web.
              Une plateforme unique pour lutter contre la désinformation.
            </p>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link 
                to="/register" 
                className="group flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-base font-medium rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 w-full sm:w-auto"
              >
                Commencer gratuitement
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Stats section */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-8 border-t border-gray-200/50 dark:border-gray-800/50">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <CheckCircle className="w-4 h-4 text-primary-500" />
                <span className="text-sm">Aucune carte requise</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Lock className="w-4 h-4 text-primary-500" />
                <span className="text-sm">Chiffrement AES-256</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Zap className="w-4 h-4 text-primary-500" />
                <span className="text-sm">Analyse instantanée</span>
              </div>
            </div>
          </div>

          {/* Hero illustration */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0a0a0a] to-transparent"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700/50">
              <div className="p-6 border-b border-gray-700/50 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 bg-gray-800 rounded-lg px-4 py-1.5 text-sm text-gray-400 text-center">
                  secure-ia.com/dashboard
                </div>
                <div className="flex gap-2">
                  <button className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors">
                    <Download className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors">
                    <Share2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
              <div className="p-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                          <Image className="w-5 h-5 text-primary-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Analyse en cours</p>
                          <p className="text-xs text-gray-400">2.3 secondes restantes</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div className="bg-gradient-to-r from-primary-500 to-purple-500 h-1.5 rounded-full w-3/4 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="text-green-400 font-medium">Analyse complète</p>
                          <p className="text-xs text-gray-400">Score de fiabilité: 98.5%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Authenticité</span>
                      <span className="text-green-400 font-medium">98.5%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full w-[98.5%]"></div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Manipulation détectée</span>
                      <span className="text-yellow-400 font-medium">1.2%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full w-[1.2%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === Section partenaires === */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-y border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-8">Reconnu par les leaders de l'industrie</p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-50">
            <Chrome className="w-8 h-8 text-gray-400 dark:text-gray-600" />
            <Apple className="w-8 h-8 text-gray-400 dark:text-gray-600" />
            <Github className="w-8 h-8 text-gray-400 dark:text-gray-600" />
            <Twitter className="w-8 h-8 text-gray-400 dark:text-gray-600" />
            <Facebook className="w-8 h-8 text-gray-400 dark:text-gray-600" />
            <Linkedin className="w-8 h-8 text-gray-400 dark:text-gray-600" />
          </div>
        </div>
      </section>

      {/* === Section fonctionnalités améliorée === */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
              Fonctionnalités
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
              Tout ce dont vous avez besoin
              <br />
              <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                en un seul endroit
              </span>
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Notre plateforme combine plusieurs technologies d'IA pour vous offrir une analyse complète et fiable.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Grille de features */}
            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="group relative bg-white dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 hover:border-primary-500/50 transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                  onMouseEnter={() => setHoveredCard(idx)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => navigate(feature.path)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                  <div className="relative">
                    <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-3">{feature.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-primary-600 dark:text-primary-400">{feature.stat}</span>
                      <ChevronRight className={`w-4 h-4 text-gray-400 transition-all ${hoveredCard === idx ? 'translate-x-1 text-primary-500' : ''}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Feature showcase interactif */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700/50">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {features[activeFeature] && (() => {
                    const FeatureIcon = features[activeFeature].icon;
                    return <FeatureIcon className="w-8 h-8 text-primary-400" />;
                  })()}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{features[activeFeature]?.title}</h3>
                <p className="text-gray-400">{features[activeFeature]?.desc}</p>
              </div>
              
              {/* Indicateurs de progression */}
              <div className="flex justify-center gap-2 mt-6">
                {features.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveFeature(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      activeFeature === idx ? 'w-8 bg-primary-500' : 'w-1.5 bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              {/* Call to action */}
              <button 
                onClick={() => navigate(features[activeFeature]?.path || '/dashboard')}
                className="w-full mt-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all"
              >
                En savoir plus
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* === Section comment ça marche === */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
              Processus simple
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
              Analysez en{' '}
              <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                3 étapes simples
              </span>
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Une interface intuitive pour des résultats professionnels en quelques secondes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Soumettez', desc: 'Uploadez une image, collez un texte ou entrez une URL', icon: Cloud },
              { step: '02', title: 'Analysez', desc: 'Notre IA analyse le contenu avec plusieurs moteurs', icon: Cpu },
              { step: '03', title: 'Consultez', desc: 'Obtenez un rapport détaillé avec score et verdict', icon: BarChart3 },
            ].map((item, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-white dark:bg-gray-900/50 rounded-2xl p-8 text-center border border-gray-200/50 dark:border-gray-800/50 hover:border-primary-500/50 transition-all">
                  <div className="text-5xl font-bold bg-gradient-to-r from-primary-500 to-purple-500 bg-clip-text text-transparent mb-4">
                    {item.step}
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-gray-300 dark:text-gray-700" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === Section tarifs === */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
              Tarifs
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
              Des plans pour tous les besoins
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Commencez gratuitement, évoluez quand vous le souhaitez
            </p>
          </div>

          {loadingPlans ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-8">
                {pricingCards.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden transition-all hover:-translate-y-2 hover:shadow-xl ${
                      plan.popular ? 'ring-2 ring-primary-500 shadow-xl' : 'border border-gray-200/50 dark:border-gray-800/50'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-gradient-to-r from-primary-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                          POPULAIRE
                        </div>
                      </div>
                    )}
                    <div className="p-8">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">{plan.desc}</p>
                      <div className="mb-6">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                        <span className="text-gray-500">/mois</span>
                      </div>
                      <Link
                        to={plan.ctaLink || '#'}
                        className={`w-full block text-center py-3 rounded-xl font-semibold transition-all mb-6 ${
                          plan.popular
                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {plan.cta}
                      </Link>
                      <ul className="space-y-3">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* === Section CTA finale === */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-primary-600 to-purple-600 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Prêt à vérifier l'authenticité de vos contenus ?
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Rejoignez les milliers d'utilisateurs qui font confiance à Secure IA
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
              >
                Commencer gratuitement
              </Link>
              <Link
                to="/contact"
                className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
              >
                Contacter les ventes
              </Link>
            </div>
            <p className="text-white/60 text-sm mt-6">
              Aucune carte de crédit requise. Commencez avec 50 analyses gratuites.
            </p>
          </div>
        </div>
      </section>

      {/* === Footer amélioré === */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Secure IA</span>
              </div>
              <p className="text-sm mb-4">
                La plateforme leader de vérification de contenu par IA. Protégez-vous contre la désinformation.
              </p>
              <div className="flex gap-4">
                <a href="https://twitter.com/secureia" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="https://linkedin.com/company/secureia" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="https://github.com/secureia" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <Github className="w-4 h-4" />
                </a>
                <a href="https://facebook.com/secureia" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><Link to="/analyze/image" className="hover:text-white transition-colors">Analyse d'images</Link></li>
                <li><Link to="/analyze/text" className="hover:text-white transition-colors">Vérification de texte</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Ressources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/contact" className="hover:text-white transition-colors">Support client</Link></li>
                <li><button onClick={() => setShowFAQModal(true)} className="hover:text-white transition-colors text-left">FAQ</button></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Mon compte</Link></li>
                <li><Link to="/history" className="hover:text-white transition-colors">Historique</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link></li>
                <li><Link to="/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link></li>
                <li><button onClick={() => setShowCGUModal(true)} className="hover:text-white transition-colors text-left">CGU</button></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-center text-sm">
            &copy; 2026 Secure IA. Tous droits réservés.
          </div>
        </div>
      </footer>

      {/* Modal FAQ */}
      {showFAQModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowFAQModal(false)}
        >
          <div 
            className="relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Questions fréquentes</h3>
              <button 
                onClick={() => setShowFAQModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { q: "Comment fonctionne l'analyse d'image ?", a: "Notre IA analyse les métadonnées EXIF, détecte les patterns de génération IA et vérifie la cohérence des pixels." },
                { q: "Quelle est la précision de détection ?", a: "Nos modèles atteignent 99.7% de précision sur les deepfakes courants." },
                { q: "Combien d'analyses gratuites ?", a: "Le plan gratuit permet 10 analyses par mois." },
                { q: "Mes données sont-elles sécurisées ?", a: "Oui, toutes les données sont chiffrées AES-256 et ne sont pas conservées après analyse." },
                { q: "Puis-je annuler mon abonnement ?", a: "Oui, vous pouvez annuler à tout moment depuis votre profil." },
              ].map((faq, idx) => (
                <div key={idx} className="border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{faq.q}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal CGU */}
      {showCGUModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowCGUModal(false)}
        >
          <div 
            className="relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Conditions Générales d'Utilisation</h3>
              <button 
                onClick={() => setShowCGUModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <section>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">1. Service</h4>
                <p className="text-gray-600 dark:text-gray-400">Secure IA est une plateforme de vérification de contenu utilisant l'IA pour détecter les manipulations.</p>
              </section>
              <section>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">2. Compte utilisateur</h4>
                <p className="text-gray-600 dark:text-gray-400">Vous êtes responsable de la confidentialité de votre mot de passe et de toutes les activités sur votre compte.</p>
              </section>
              <section>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">3. Utilisation autorisée</h4>
                <p className="text-gray-600 dark:text-gray-400">Vous vous engagez à utiliser le service conformément aux lois et à ne pas tenter de contourner les limites.</p>
              </section>
              <section>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">4. Abonnements</h4>
                <p className="text-gray-600 dark:text-gray-400">Les abonnements sont facturés mensuellement via Stripe. Annulation possible à tout moment.</p>
              </section>
              <section>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">5. Limitation de responsabilité</h4>
                <p className="text-gray-600 dark:text-gray-400">Les résultats sont indicatifs. Nous ne garantissons pas une détection à 100%.</p>
              </section>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default HomePage