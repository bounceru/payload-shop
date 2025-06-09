"use client"
import { CheckCircle, Ticket, ShoppingBag, Mail, Calendar, Download, Share2, Home } from "lucide-react"
import Section from "@/app/(app)/event/[slug]/components/Section"

export default function ThankYouClient({
    order,
    shop,
    branding,
}: {
    order: {
        orderNr: number
        total: number
        tickets: any[]
        addonSelections: {
            seatId: string
            addonId: string
            quantity: number
        }[]
        addonMap: Record<string, any>
    }
    shop?: any
    branding?: any
}) {
    const primaryColor = branding?.primaryColorCTA || "#1D4ED8"

    return (
        <main className="w-full md:max-w-screen-lg mx-auto px-4 pt-8 md:pt-12 pb-24">
            <div className="max-w-3xl mx-auto">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Bestelling Gelukt!</h1>
                    <p className="text-lg text-gray-600">Je betaling is succesvol verwerkt</p>
                </div>

                <Section title="" primaryColor={primaryColor}>
                    <div className="space-y-8">
                        {/* Order Confirmation Card */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6 md:p-8">
                            <div className="text-center space-y-4">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full text-sm font-semibold">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Betaling Bevestigd</span>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-lg text-gray-700">Je bestelling is succesvol verwerkt!</p>
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-green-200">
                                        <span className="text-gray-600 font-medium">Bestelnummer:</span>
                                        <span className="font-bold text-gray-900 text-lg">#{order.orderNr}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-2 text-green-700">
                                    <Mail className="h-4 w-4" />
                                    <span className="text-sm">Een bevestiging is naar je e-mail gestuurd</span>
                                </div>
                            </div>
                        </div>

                        {/* Order Details */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Tickets Section */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                        <Ticket className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900">Je Tickets</h3>
                                        <p className="text-sm text-gray-600">
                                            {order.tickets.length} {order.tickets.length === 1 ? "ticket" : "tickets"}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {order.tickets.map((ticket: any) => (
                                        <div
                                            key={ticket.id}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-orange-200 rounded-lg flex items-center justify-center">
                                                    <span className="font-bold text-orange-800 text-sm">
                                                        {ticket.seatRow}
                                                        {ticket.seatNumber}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">
                                                        Rij {ticket.seatRow}, Stoel {ticket.seatNumber}
                                                    </div>
                                                    <div className="text-sm text-gray-600">{ticket.ticketType?.name ?? "Standaard"}</div>
                                                </div>
                                            </div>
                                            <div className="font-bold text-gray-900">€{ticket.price.toFixed(2)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Add-ons Section */}
                            {order.addonSelections?.length > 0 && (
                                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                            <ShoppingBag className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">Extras</h3>
                                            <p className="text-sm text-gray-600">
                                                {order.addonSelections.length} {order.addonSelections.length === 1 ? "item" : "items"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {order.addonSelections.map((sel, i) => {
                                            const addon = order.addonMap[sel.addonId]
                                            if (!addon) return null
                                            return (
                                                <div
                                                    key={i}
                                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center">
                                                            <span className="font-bold text-purple-800 text-sm">×{sel.quantity}</span>
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-gray-900">{addon.name}</div>
                                                            <div className="text-sm text-gray-600">€{addon.price?.toFixed(2)} per stuk</div>
                                                        </div>
                                                    </div>
                                                    <div className="font-bold text-gray-900">€{(addon.price * sel.quantity).toFixed(2)}</div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Total Section */}
                        <div
                            className="rounded-2xl p-6 md:p-8 text-white text-center"
                            style={{
                                background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}CC)`,
                            }}
                        >
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <CheckCircle className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold">Totaal Betaald</h3>
                                    <p className="text-white/80 text-sm">Inclusief alle kosten</p>
                                </div>
                            </div>
                            <div className="text-4xl font-bold">€{order.total.toFixed(2)}</div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <button
                                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2"
                                style={{ backgroundColor: primaryColor }}

                            >
                                <Download className="h-4 w-4" />
                                <span>Download Tickets</span>
                            </button>

                            <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 hover:border-gray-400 transition-all duration-200 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                                <Share2 className="h-4 w-4" />
                                <span>Delen</span>
                            </button>

                            <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400 transition-all duration-200 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                                <Home className="h-4 w-4" />
                                <span>Naar Home</span>
                            </button>
                        </div>

                        {/* Next Steps */}
                        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Wat nu?</h4>
                                    <div className="space-y-2 text-sm text-gray-700">
                                        <p>• Je tickets zijn naar je e-mail gestuurd</p>
                                        <p>• Bewaar je tickets op je telefoon of print ze uit</p>
                                        <p>• Kom 30 minuten voor aanvang naar de locatie</p>
                                        <p>• Neem een geldig identiteitsbewijs mee</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Thank You Message */}
                        <div className="text-center py-8">
                            <div className="max-w-md mx-auto">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Bedankt voor je vertrouwen!</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    We kijken ernaar uit je te zien op het evenement. Heb je vragen? Neem gerust contact met ons op.
                                </p>
                            </div>
                        </div>

                        {/* Support Contact */}
                        {shop?.company_details?.contact_email && (
                            <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
                                <p className="text-sm text-gray-600 mb-2">Vragen over je bestelling?</p>
                                <a
                                    href={`mailto:${shop.company_details.contact_email}`}
                                    className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                                    style={{ color: primaryColor }}
                                >
                                    <Mail className="h-4 w-4" />
                                    <span>{shop.company_details.contact_email}</span>
                                </a>
                            </div>
                        )}
                    </div>
                </Section>
            </div>
        </main>
    )
}
