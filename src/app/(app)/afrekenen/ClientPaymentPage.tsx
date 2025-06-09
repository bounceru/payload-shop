"use client"
import { useState } from "react"
import { CreditCard, Ticket, ShoppingBag, Euro, CheckCircle, XCircle, Loader2 } from "lucide-react"
import Section from "@/app/(app)/event/[slug]/components/Section" // adjust if needed

export default function ClientPaymentPage({ order, tickets, addonSelections, addonMap, total }: any) {
    const [loading, setLoading] = useState(false)

    const completePayment = async () => {
        setLoading(true)
        const res = await fetch('/api/createPayment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: order.id }),
        })
        if (res.ok) {
            const data = await res.json()
            if (data.redirectUrl) {
                window.location.href = data.redirectUrl
                return
            }
            window.location.href = `/bedankt?orderId=${order.id}`
        } else {
            alert('Payment failed.')
            setLoading(false)
        }
    }

    const cancelOrder = async () => {
        const seatIds = tickets.map((t: any) => `${t.seatRow}-${t.seatNumber}`)
        await fetch("/api/unlockExpiredSeats", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ eventSlug: order.event.slug, seatIds }),
        })
        window.location.href = "/"
    }

    return (
        <main className="w-full md:max-w-screen-xl mx-auto px-4 md:px-6 pt-6 md:pt-12 pb-12">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-4">
                        <CheckCircle className="h-4 w-4" />
                        <span>Bestelling bevestigd</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Bevestig je betaling</h1>
                    <p className="text-lg text-gray-600">Controleer je bestelling en voltooi de betaling</p>
                </div>

                <Section title="">
                    <div className="space-y-8">
                        {/* Order Summary Card */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                                    <CreditCard className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Bestelling Overzicht</h2>
                                    <p className="text-gray-600">Order #{order.id}</p>
                                </div>
                            </div>

                            {/* Event Info */}
                            <div className="bg-white rounded-xl p-4 mb-6 border border-blue-100">
                                <h3 className="font-semibold text-gray-900 mb-1">{order.event?.title || "Evenement"}</h3>
                                <p className="text-sm text-gray-600">
                                    {order.event?.date &&
                                        new Date(order.event.date).toLocaleDateString("nl-NL", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                </p>
                            </div>

                            {/* Tickets Section */}
                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                            <Ticket className="h-5 w-5 text-orange-600" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900">Tickets</h3>
                                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                                            {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        {tickets.map((t: any) => (
                                            <div
                                                key={t.id}
                                                className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                        <span className="font-bold text-gray-700 text-sm">
                                                            {t.seatRow}-{t.seatNumber}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900">
                                                            Rij {t.seatRow}, Stoel {t.seatNumber}
                                                        </div>
                                                        <div className="text-sm text-gray-600">{t.ticketType?.name ?? "Onbekend type"}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-gray-900">€{t.price?.toFixed(2)}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Addons Section */}
                                {addonSelections.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <ShoppingBag className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-900">Extras</h3>
                                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                                {addonSelections.length} {addonSelections.length === 1 ? "item" : "items"}
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            {addonSelections.map((sel: any, i: number) => {
                                                const addon = addonMap[sel.addonId]
                                                return (
                                                    <div
                                                        key={i}
                                                        className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                                                <span className="font-bold text-purple-700 text-sm">×{sel.quantity}</span>
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-gray-900">{addon?.name}</div>
                                                                <div className="text-sm text-gray-600">€{addon?.price?.toFixed(2)} per stuk</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-bold text-gray-900">€{(addon?.price * sel.quantity).toFixed(2)}</div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Total Section */}
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 md:p-8 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                        <Euro className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold">Totaal te betalen</h3>
                                        <p className="text-green-100 text-sm">Inclusief alle kosten</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl md:text-4xl font-bold">€{total.toFixed(2)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                onClick={completePayment}
                                disabled={loading}
                                className="flex-1 group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Bezig met betalen...</span>
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="h-5 w-5" />
                                        <span>Betaal Nu</span>
                                    </>
                                )}

                                {/* Shine effect */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full" />
                            </button>

                            <button
                                onClick={cancelOrder}
                                className="sm:flex-initial inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 hover:border-gray-400 transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                <XCircle className="h-5 w-5" />
                                <span>Annuleer Bestelling</span>
                            </button>
                        </div>

                        {/* Security Notice */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <CheckCircle className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Veilige betaling</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        Je betaling wordt veilig verwerkt. Na succesvolle betaling ontvang je direct een bevestiging en je
                                        tickets per e-mail.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Section>
            </div>
        </main>
    )
}
