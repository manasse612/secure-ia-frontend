// === Composant principal de l'application Secure IA ===
// Définit toutes les routes et la structure globale de l'application

import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Capacitor } from '@capacitor/core'
import LoadingScreen from './components/LoadingScreen'
import './styles/mobile.css'

// Pages publiques
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PricingPage from './pages/PricingPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import MentionsLegalesPage from './pages/MentionsLegalesPage'
import ConfidentialitePage from './pages/ConfidentialitePage'
import ContactPage from './pages/ContactPage'

// Pages protégées (nécessitent une connexion)
import DashboardPage from './pages/DashboardPage'
import ImageAnalysisPage from './pages/ImageAnalysisPage'
import TextAnalysisPage from './pages/TextAnalysisPage'
import UrlAnalysisPage from './pages/UrlAnalysisPage'
import VideoAnalysisPage from './pages/VideoAnalysisPage'
import HistoryPage from './pages/HistoryPage'
import AnalysisDetailPage from './pages/AnalysisDetailPage'
import ProfilePage from './pages/ProfilePage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import PaymentCancelPage from './pages/PaymentCancelPage'

// Pages admin (back-office)
import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminUsers from './pages/Admin/AdminUsers'
import AdminLogs from './pages/Admin/AdminLogs'
import AdminNotifications from './pages/Admin/AdminNotifications'
import AdminSubscriptions from './pages/Admin/AdminSubscriptions'
import AdminSettings from './pages/Admin/AdminSettings'

// Composants de mise en page
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

function App() {
  const [appReady, setAppReady] = useState(false)
  const isMobile = Capacitor.isNativePlatform()

  useEffect(() => {
    // Ajouter classe pour CSS mobile si nécessaire
    if (isMobile) {
      document.body.classList.add('is-mobile')
    }
    
    // Petit délai pour afficher le loading screen au démarrage
    const timer = setTimeout(() => setAppReady(true), 800)
    return () => clearTimeout(timer)
  }, [])

  if (!appReady) {
    return <LoadingScreen message="Chargement de Secure IA..." />
  }

  return (
    <>
      {/* Notifications toast (succès, erreur, info) */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: '#1e293b', color: '#f8fafc', borderRadius: '12px' },
        }}
      />

      {/* Définition des routes */}
      <Routes>
        {/* --- Routes publiques (sans connexion) --- */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
        <Route path="/confidentialite" element={<ConfidentialitePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/cancel" element={<PaymentCancelPage />} />

        {/* --- Routes protégées (connexion requise) --- */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/analyze/image" element={<ImageAnalysisPage />} />
            <Route path="/analyze/text" element={<TextAnalysisPage />} />
            <Route path="/analyze/url" element={<UrlAnalysisPage />} />
            <Route path="/analyze/video" element={<VideoAnalysisPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/analysis/:id" element={<AnalysisDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* --- Routes admin (administrateur uniquement) --- */}
        <Route element={<AdminRoute />}>
          <Route element={<Layout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
            <Route path="/admin/logs" element={<AdminLogs />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* --- Route par défaut : rediriger vers l'accueil --- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
