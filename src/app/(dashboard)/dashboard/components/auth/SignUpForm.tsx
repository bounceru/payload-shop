'use client'
import type React from 'react'
import { useState } from 'react'

import Link from 'next/link'
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Shield,
  Star,
  User,
  Users,
} from 'lucide-react'

export default function SignUpForm() {
  const [tenantName, setTenantName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      return setError('Wachtwoorden komen niet overeen')
    }

    setLoading(true)

    try {
      const res = await fetch('/api/registerTenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantName, email, password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Registratie mislukt')
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Er is een onverwachte fout opgetreden')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Left Sidebar - Success */}
        <div className="hidden lg:flex lg:w-1/2 bg-orange-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10 flex flex-col justify-center px-12 text-white">
            <div className="max-w-md">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-8">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-6">Welkom bij Stagepass! 🎉</h1>
              <p className="text-xl text-orange-100 leading-relaxed">
                Je account is succesvol aangemaakt. Begin nu met het organiseren van onvergetelijke evenementen.
              </p>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute bottom-20 right-32 w-20 h-20 bg-white/5 rounded-full" />
        </div>

        {/* Right Content - Success */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Aangemaakt!</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Je account is succesvol aangemaakt. Je kunt nu inloggen en beginnen met het organiseren van je
                evenementen.
              </p>

              <Link
                href="/signin"
                className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <span>Nu inloggen</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <div className="hidden lg:flex lg:w-1/2 bg-orange-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="max-w-md">
            {/* Logo/Brand */}
            <div

              className="mb-6 flex items-center gap-3 group transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-lg"
            >
              <div className="relative">
                <img
                  src="/static/stagepass-logo.png"
                  alt="Logo"
                  className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg shadow-sm ring-1 ring-gray-200 group-hover:shadow-md transition-shadow"
                />
              </div>


            </div>

            <h1 className="text-4xl font-bold mb-6">Start je ticket verkoop</h1>
            <p className="text-xl text-orange-100 mb-12 leading-relaxed">
              Organiseer met gemak professionele evenementen, verkoop tickets en beheer je bezoekers - alles op één
              plek.
            </p>

            {/* Features */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Evenement Beheer</h3>
                  <p className="text-orange-100">Maak en beheer je evenementen eenvoudig</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Ticket Verkoop</h3>
                  <p className="text-orange-100">Verkoop tickets online met geïntegreerde betalingen</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Analytics</h3>
                  <p className="text-orange-100">Krijg inzicht in je verkoop en bezoekers</p>
                </div>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 pt-8 border-t border-white/20">
              <div className="flex items-center gap-2 text-orange-100">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm">Vertrouwd door 500+ organisatoren</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute bottom-20 right-32 w-20 h-20 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 right-8 w-2 h-24 bg-white/20 rounded-full" />
      </div>

      {/* Right Content - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-4">
              <Building2 className="h-4 w-4" />
              <span>Voor organisatoren</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welkom bij Stagepass</h1>
            <p className="text-gray-600">Start vandaag nog met het organiseren van evenementen</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 relative overflow-hidden">
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-orange-500" />

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Aanmaken</h2>
              <p className="text-gray-600">Vul je gegevens in om te beginnen</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              {/* Organization Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Organisatienaam <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Mijn organisatie"
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20 focus:outline-none transition-all duration-200 hover:border-gray-400"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Emailadres <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="info@voorbeeld.be"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20 focus:outline-none transition-all duration-200 hover:border-gray-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Wachtwoord <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Kies een sterk wachtwoord"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20 focus:outline-none transition-all duration-200 hover:border-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bevestig wachtwoord <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Herhaal het wachtwoord"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20 focus:outline-none transition-all duration-200 hover:border-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Aan het registreren...</span>
                  </>
                ) : (
                  <>
                    <User className="h-5 w-5" />
                    <span>Account aanmaken</span>
                  </>
                )}
              </button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">Veilig & Betrouwbaar</h4>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Je gegevens worden veilig opgeslagen en nooit gedeeld met derden. We gebruiken de nieuwste
                  beveiligingstechnologieën.
                </p>
              </div>
            </div>

            {/* Sign In Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Heb je al een account?{' '}
                <Link
                  href="/signin"
                  className="font-semibold text-orange-600 hover:text-orange-700 hover:underline transition-colors"
                >
                  Log hier in
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Door een account aan te maken ga je akkoord met onze{' '}
              <Link href="/terms" className="text-orange-600 hover:underline">
                Algemene Voorwaarden
              </Link>{' '}
              en{' '}
              <Link href="/privacy" className="text-orange-600 hover:underline">
                Privacybeleid
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
