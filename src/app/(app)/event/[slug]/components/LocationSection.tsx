"use client"
import { useState } from "react"
import { MapPin, Navigation, Phone, Mail, Globe, ExternalLink, Copy, Check } from "lucide-react"

export default function LocationSection({ venue, googleMapsIframe }: { venue: any; googleMapsIframe?: string }) {
    const [copied, setCopied] = useState(false)

    if (!venue) return null

    const address =
        `${venue.company_details?.street ?? ""} ${venue.company_details?.house_number ?? ""}, ${venue.company_details?.postal ?? ""} ${venue.company_details?.city ?? ""}`.trim()

    const handleCopyAddress = async () => {
        try {
            await navigator.clipboard.writeText(address)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error("Failed to copy address:", err)
        }
    }

    const handleDirections = () => {
        const encodedAddress = encodeURIComponent(address)
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, "_blank")
    }

    return (

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Venue Information */}
            <div className="space-y-6">
                {/* Venue Name & Address */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <MapPin className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {venue.company_details?.company_name ?? venue.name ?? "Locatie"}
                            </h3>
                            <p className="text-gray-600 leading-relaxed mb-4">{address}</p>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={handleDirections}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                                >
                                    <Navigation className="h-4 w-4" />
                                    <span>Routebeschrijving</span>
                                </button>

                                <button
                                    onClick={handleCopyAddress}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-4 w-4 text-green-600" />
                                            <span className="text-green-600">Gekopieerd!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4" />
                                            <span>Kopieer adres</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                {(venue.company_details?.phone ||
                    venue.company_details?.contact_email ||
                    venue.company_details?.website_url) && (
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact informatie</h4>
                            <div className="space-y-3">
                                {venue.company_details?.phone && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Phone className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <a
                                            href={`tel:${venue.company_details.phone}`}
                                            className="text-gray-700 hover:text-blue-600 transition-colors"
                                        >
                                            {venue.company_details.phone}
                                        </a>
                                    </div>
                                )}

                                {venue.company_details?.contact_email && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                            <Mail className="h-4 w-4 text-green-600" />
                                        </div>
                                        <a
                                            href={`mailto:${venue.company_details.contact_email}`}
                                            className="text-gray-700 hover:text-green-600 transition-colors"
                                        >
                                            {venue.company_details.contact_email}
                                        </a>
                                    </div>
                                )}

                                {venue.company_details?.website_url && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <Globe className="h-4 w-4 text-purple-600" />
                                        </div>
                                        <a
                                            href={venue.company_details.website_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-700 hover:text-purple-600 transition-colors flex items-center gap-1"
                                        >
                                            <span>Website bezoeken</span>
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                {/* Additional Info */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border border-orange-200 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Bereikbaarheid</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                        <p>• Openbaar vervoer: Controleer de laatste dienstregeling</p>
                        <p>• Parkeren: Betaald parkeren beschikbaar in de omgeving</p>
                        <p>• Toegankelijkheid: Neem contact op voor specifieke behoeften</p>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <div className="space-y-4">
                {googleMapsIframe ? (
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-4 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-gray-900">Kaart</h4>
                                <button
                                    onClick={handleDirections}
                                    className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 transition-colors"
                                >
                                    <span>Volledig scherm</span>
                                    <ExternalLink className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                        <div className="aspect-video relative">
                            <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: googleMapsIframe }} />
                            {/* Overlay for better interaction */}
                            <div className="absolute inset-0 bg-transparent hover:bg-black/5 transition-colors pointer-events-none" />
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MapPin className="h-8 w-8 text-gray-400" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Kaart niet beschikbaar</h4>
                        <p className="text-gray-600 mb-4">De kaart kan momenteel niet worden geladen.</p>
                        <button
                            onClick={handleDirections}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                            <Navigation className="h-4 w-4" />
                            <span>Open in Google Maps</span>
                        </button>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => {
                            const encodedAddress = encodeURIComponent(address)
                            window.open(`https://www.google.com/maps/search/?api=1&query=parking+near+${encodedAddress}`, "_blank")
                        }}
                        className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                    >
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 text-xs">🅿️</span>
                        </div>
                        <span>Parkeren</span>
                    </button>

                    <button
                        onClick={() => {
                            const encodedAddress = encodeURIComponent(address)
                            window.open(
                                `https://www.google.com/maps/search/?api=1&query=public+transport+${encodedAddress}`,
                                "_blank",
                            )
                        }}
                        className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                    >
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-green-600 text-xs">🚌</span>
                        </div>
                        <span>OV info</span>
                    </button>
                </div>
            </div>
        </div>

    )
}
