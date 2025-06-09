"use client"
import React, { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, LogIn, Shield, Star, Users, Calendar, BarChart3, ArrowRight } from 'lucide-react'

export default function SignInForm() {
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const router = useRouter()
    const searchParams = useSearchParams()
    const nextPath = searchParams.get("next") ?? "/dashboard"

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (loading) return

        setError(null)
        setLoading(true)
        try {
            const res = await fetch("/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            })

            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.message || "Login failed")
            }

            router.push(nextPath)
        } catch (err: any) {
            setError(err.message ?? "Something went wrong")
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Left Sidebar */}
            <div className="hidden lg:flex lg:w-1/2 bg-orange-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10 flex flex-col justify-center px-12 text-white">
                    <div className="max-w-md">
                        {/* Logo/Brand */}
                        <div className="mb-6 flex items-center gap-3 group transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-lg">
                            <div className="relative">
                                <img
                                    src="/static/stagepass-logo.png"
                                    alt="Logo"
                                    className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg shadow-sm ring-1 ring-gray-200 group-hover:shadow-md transition-shadow"
                                />
                            </div>
                        </div>

                        <h1 className="text-4xl font-bold mb-6">Welkom terug!</h1>
                        <p className="text-xl text-orange-100 mb-12 leading-relaxed">
                            Log in op je account en ga verder met het beheren van je evenementen en het verkopen van tickets.
                        </p>

                        {/* Features */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Dashboard Toegang</h3>
                                    <p className="text-orange-100">Beheer al je evenementen vanaf één centrale plek</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Users className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Verkoop Overzicht</h3>
                                    <p className="text-orange-100">Bekijk je ticket verkopen en inkomsten real-time</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <BarChart3 className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Rapportages</h3>
                                    <p className="text-orange-100">Gedetailleerde analytics en bezoekersstatistieken</p>
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
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-4">
                            <LogIn className="h-4 w-4" />
                            <span>Organisator Login</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welkom terug</h1>
                        <p className="text-gray-600">Log in op je Stagepass account</p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 relative overflow-hidden">
                        {/* Top accent */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-orange-500" />

                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Inloggen</h2>
                            <p className="text-gray-600">Vul je gegevens in om door te gaan</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Error Message */}
                            {error && (
                                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                                    <p className="text-sm text-red-700 font-medium">{error}</p>
                                </div>
                            )}

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
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="info@voorbeeld.be"
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
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="Uw wachtwoord"
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

                            {/* Forgot Password Link */}
                            <div className="flex items-center justify-end">
                                <Link
                                    href="/reset-password"
                                    className="text-sm font-medium text-orange-600 hover:text-orange-700 hover:underline transition-colors"
                                >
                                    Wachtwoord vergeten?
                                </Link>
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
                                        <span>Aan het inloggen...</span>
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="h-5 w-5" />
                                        <span>Inloggen</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Security Notice */}
                        <div className="mt-6 flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                            <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-semibold text-blue-900 mb-1">Veilige Verbinding</h4>
                                <p className="text-xs text-blue-700 leading-relaxed">
                                    Je login gegevens worden veilig versleuteld verzonden. We slaan geen gevoelige informatie op in je
                                    browser.
                                </p>
                            </div>
                        </div>

                        {/* Sign Up Link */}
                        <div className="mt-8 text-center">
                            <p className="text-gray-600">
                                Nog geen account?{" "}
                                <Link
                                    href="/registreren"
                                    className="font-semibold text-orange-600 hover:text-orange-700 hover:underline transition-colors"
                                >
                                    Registreer hier
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Additional Help */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500 mb-4">Hulp nodig bij het inloggen?</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/help"
                                className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 transition-colors"
                            >
                                <span>Bekijk onze helpgids</span>
                                <ArrowRight className="h-3 w-3" />
                            </Link>
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 transition-colors"
                            >
                                <span>Contact opnemen</span>
                                <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
