"use client"
import Link from "next/link"
import type React from "react"

import { Mail, Send, ExternalLink } from "lucide-react"
import { useState } from "react"

type Branding = {
    siteLogo?: string | { s3_url?: string } | null
    primaryColorCTA?: string
    footerBackgroundColor?: string
    headerBackgroundColor?: string
    footerTextColor?: string
    companyName?: string
    contactEmail?: string
    footerLinks?: { label: string; href: string }[]
}

export default function Footer({
    branding,
    isShop = false,
    shop,
}: {
    branding?: Branding
    isShop?: boolean
    shop?: any
}) {
    const [email, setEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const bg = branding?.footerBackgroundColor || "#1D2A36"
    const headerbgColor = branding?.headerBackgroundColor || "#ED6D38"
    const text = branding?.footerTextColor || "#ffffff"
    const logoUrl =
        typeof branding?.siteLogo === "string"
            ? branding.siteLogo
            : branding?.siteLogo?.s3_url || "/static/stage-pass-logo-inverted.png"

    const primaryColor = branding?.primaryColorCTA || "#ED6D38"

    const companyName = branding?.companyName || shop?.company_details?.company_name || "Stagepass"
    const contactEmail = branding?.contactEmail || shop?.company_details?.contact_email
    const vatNumber = shop?.company_details?.vat_nr

    const quickLinks =
        branding?.footerLinks ||
        (isShop
            ? [
                { label: "Evenementen", href: "/" },
                { label: "Support", href: "/support" },
            ]
            : [
                { label: "Evenementen", href: "/" },
                { label: "Voor organisatoren", href: "/evenementen" },
                { label: "Support", href: "/support" },
                { label: "Login", href: "/login" },
            ])

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        alert("Bedankt voor je aanmelding!")
        setEmail("")
        setIsSubmitting(false)
    }

    return (
        <footer className="relative overflow-hidden" style={{ backgroundColor: bg, color: text }}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `radial-gradient(circle at 25% 25%, ${primaryColor} 2px, transparent 2px)`,
                        backgroundSize: "24px 24px",
                    }}
                />
            </div>

            <div className="relative">
                {/* Main Footer Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                        {/* Company Info */}
                        <div className="lg:col-span-1">
                            <div className="flex items-center gap-3 mb-6">
                                {!isShop ? (
                                    <>
                                        <img
                                            src={logoUrl || "/placeholder.svg"}
                                            alt="Logo"
                                            className="h-10 w-auto object-contain filter brightness-0 invert"
                                        />
                                        <div>
                                            <span className="font-bold text-lg tracking-tight">{companyName}</span>
                                            <p className="text-xs opacity-75 mt-1">Event Platform</p>
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        <img
                                            src={logoUrl || "/placeholder.svg"}
                                            alt="Logo"
                                            className="h-12 w-auto object-contain mb-3 filter brightness-0 invert"
                                        />
                                        {companyName && <h3 className="text-xl font-bold mb-2">{companyName}</h3>}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 text-sm opacity-90">
                                {contactEmail && (
                                    <div className="flex items-center gap-3 group">
                                        <Mail className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                                        <a
                                            href={`mailto:${contactEmail}`}
                                            className="hover:underline hover:opacity-100 transition-all duration-200"
                                        >
                                            {contactEmail}
                                        </a>
                                    </div>
                                )}
                                {vatNumber && (
                                    <div className="flex items-center gap-3">
                                        <div className="h-4 w-4 opacity-70 flex items-center justify-center">
                                            <span className="text-xs font-bold">€</span>
                                        </div>
                                        <span>BTW: {vatNumber}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="lg:col-span-1">
                            <h4 className="font-semibold text-lg mb-6 relative">
                                Menu
                                <div
                                    className="absolute -bottom-2 left-0 h-0.5 w-8 rounded-full"
                                    style={{ backgroundColor: primaryColor }}
                                />
                            </h4>
                            <ul className="space-y-3">
                                {quickLinks.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-sm opacity-90 hover:opacity-100 hover:translate-x-1 transition-all duration-200 flex items-center gap-2 group"
                                        >
                                            <span>{link.label}</span>
                                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-70 transition-opacity" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Newsletter */}
                        <div className="lg:col-span-2">
                            <h4 className="font-semibold text-lg mb-6 relative">
                                Blijf op de hoogte
                                <div
                                    className="absolute -bottom-2 left-0 h-0.5 w-8 rounded-full"
                                    style={{ backgroundColor: primaryColor }}
                                />
                            </h4>
                            <p className="text-sm opacity-90 mb-6 max-w-md">
                                Ontvang updates over nieuwe evenementen, exclusieve acties en de laatste nieuwtjes direct in je inbox.
                            </p>

                            <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1 relative">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Je e-mailadres"
                                            className="w-full px-4 py-3 rounded-lg text-gray-900 bg-white/95 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200 placeholder:text-gray-500"
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 min-w-[120px]"
                                        style={{ backgroundColor: headerbgColor }}
                                    >
                                        {isSubmitting ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4" />
                                                <span>Verstuur</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs opacity-70">
                                    Door je aan te melden ga je akkoord met onze voorwaarden en privacybeleid.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="text-sm opacity-75">
                                &copy; {new Date().getFullYear()} {companyName}. Alle rechten voorbehouden.
                            </div>

                            <div className="flex items-center gap-6 text-sm">
                                <Link href="/privacy" className="opacity-75 hover:opacity-100 transition-opacity">
                                    Privacy
                                </Link>
                                <Link href="/terms" className="opacity-75 hover:opacity-100 transition-opacity">
                                    Voorwaarden
                                </Link>
                                <Link href="/cookies" className="opacity-75 hover:opacity-100 transition-opacity">
                                    Cookies
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
