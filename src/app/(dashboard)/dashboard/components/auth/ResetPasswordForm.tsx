"use client"
import { useState } from "react"
import type React from "react"
import Link from "next/link"
import {
    Mail,
    CheckCircle,
    AlertCircle,
    Loader2,
    Shield,
    Clock,
    ArrowLeft,
    Star,
    Lock,
    RefreshCw,
    HelpCircle,
    ArrowRight,
} from "lucide-react"

export default function ResetPasswordForm() {
    const [email, setEmail] = useState("")
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const res = await fetch("/api/users/password-reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })

            if (!res.ok) {
                const data = await res.json()
                setError(data.message || "Reset mislukt")
            } else {
                setSuccess(true)
            }
        } catch {
            setError("Er is een onverwachte fout opgetreden")
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
                            <h1 className="text-4xl font-bold mb-6">Email verzonden! 📧</h1>
                            <p className="text-xl text-orange-100 leading-relaxed">
                                We hebben een resetlink naar je e-mailadres gestuurd. Controleer je inbox en volg de instructies.
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

                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Resetlink Verzonden!</h2>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                We hebben een resetlink naar <strong>{email}</strong> gestuurd. Controleer je inbox en volg de
                                instructies om je wachtwoord te resetten.
                            </p>

                            <div className="space-y-4">
                                <Link
                                    href="/signin"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    <span>Terug naar inloggen</span>
                                </Link>

                                <button
                                    onClick={() => {
                                        setSuccess(false)
                                        setEmail("")
                                    }}
                                    className="block w-full px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 hover:border-gray-400 rounded-xl font-medium transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Andere email gebruiken
                                </button>
                            </div>

                            {/* Help text */}
                            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-left">
                                        <h4 className="text-sm font-semibold text-blue-900 mb-1">Geen email ontvangen?</h4>
                                        <p className="text-xs text-blue-700 leading-relaxed">
                                            Controleer je spam/junk folder. De email kan tot 5 minuten duren om aan te komen.
                                        </p>
                                    </div>
                                </div>
                            </div>
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
                        <div className="mb-6 flex items-center gap-3 group transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-lg">
                            <div className="relative">
                                <img
                                    src="/static/stagepass-logo.png"
                                    alt="Logo"
                                    className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg shadow-sm ring-1 ring-gray-200 group-hover:shadow-md transition-shadow"
                                />
                            </div>
                        </div>

                        <h1 className="text-4xl font-bold mb-6">Wachtwoord vergeten?</h1>
                        <p className="text-xl text-orange-100 mb-12 leading-relaxed">
                            Geen probleem! We helpen je snel en veilig weer toegang te krijgen tot je account.
                        </p>

                        {/* Features */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Shield className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Veilig Proces</h3>
                                    <p className="text-orange-100">Je gegevens blijven altijd beschermd en versleuteld</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Clock className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Snel Herstel</h3>
                                    <p className="text-orange-100">Ontvang binnen enkele minuten een resetlink</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <HelpCircle className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">24/7 Support</h3>
                                    <p className="text-orange-100">Hulp nodig? Ons team staat altijd voor je klaar</p>
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
                            <Lock className="h-4 w-4" />
                            <span>Wachtwoord Reset</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Wachtwoord vergeten?</h1>
                        <p className="text-gray-600">We helpen je weer toegang te krijgen</p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 relative overflow-hidden">
                        {/* Top accent */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-orange-500" />

                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Wachtwoord Resetten</h2>
                            <p className="text-gray-600">Vul je emailadres in en we sturen je een resetlink</p>
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
                                        placeholder="info@voorbeeld.be"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20 focus:outline-none transition-all duration-200 hover:border-gray-400"
                                    />
                                </div>
                                <p className="mt-2 text-xs text-gray-500">We sturen een veilige resetlink naar dit emailadres</p>
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
                                        <span>Bezig met verzenden...</span>
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="h-5 w-5" />
                                        <span>Verstuur Resetlink</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Security Notice */}
                        <div className="mt-6 flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                            <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-semibold text-blue-900 mb-1">Veiligheid Gegarandeerd</h4>
                                <p className="text-xs text-blue-700 leading-relaxed">
                                    De resetlink is 1 uur geldig en kan maar één keer gebruikt worden. Je huidige wachtwoord blijft actief
                                    tot je een nieuw wachtwoord instelt.
                                </p>
                            </div>
                        </div>

                        {/* Back to Sign In Link */}
                        <div className="mt-8 text-center">
                            <p className="text-gray-600">
                                Weet je het wachtwoord weer?{" "}
                                <Link
                                    href="/signin"
                                    className="font-semibold text-orange-600 hover:text-orange-700 hover:underline transition-colors"
                                >
                                    Terug naar inloggen
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Additional Help */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500 mb-4">Nog steeds problemen met inloggen?</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/help/password-reset"
                                className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 transition-colors"
                            >
                                <span>Bekijk de handleiding</span>
                                <ArrowRight className="h-3 w-3" />
                            </Link>
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 transition-colors"
                            >
                                <span>Contact support</span>
                                <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
