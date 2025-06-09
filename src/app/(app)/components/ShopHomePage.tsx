"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, Calendar, Search, Filter, Star } from "lucide-react"

import InterestTypeGrid from "./InterestTypeGrid"
import OrganizerSidebar from "./OrganizerSidebar"
import EventCard from "./EventCard"

export default function ShopHomePage({
  events,
  emptyCategory,
  shop,
  branding,
}: {
  events: any[]
  emptyCategory?: string
  shop?: any
  branding?: any
}) {
  const [modalOpen, setModalOpen] = useState<null | "events" | "shop">(null)
  const isCategoryPage = !!emptyCategory
  const primaryCTA = branding?.primaryColorCTA || "#ED6D38"

  const [filters, setFilters] = useState({
    location: "",
    type: "",
    start: "",
    end: "",
  })
  const searchParams = useSearchParams()

  useEffect(() => {
    setFilters({
      location: searchParams.get("location") || "",
      type: searchParams.get("type") || "",
      start: searchParams.get("start") || "",
      end: searchParams.get("end") || "",
    })
  }, [searchParams])

  const availableTypes = Array.from(
    new Set(events.map((e) => e.type).filter((type): type is string => typeof type === "string")),
  )

  const hasActiveFilters = Object.values(filters).some((filter) => filter !== "")

  return (
    <main className="w-full">
      {/* Enhanced Hero Section */}
      {!hasActiveFilters && (
      <> 
      {branding?.headerImage?.s3_url ? (
        <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${branding.headerImage.s3_url})`,
            }}
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Content */}
          <div className="relative h-full flex items-center justify-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="max-w-4xl mx-auto">
                {/* Badge */}
                {shop?.verified && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-6">
                    <Star className="h-4 w-4 fill-current" />
                    <span>Geverifieerde organisator</span>
                  </div>
                )}

                {/* Title */}
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                  {shop?.name || "Welkom bij onze evenementen"}
                </h1>

                {/* Subtitle */}
                {branding?.venueHeaderText && (
                  <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
                    {branding.venueHeaderText}
                  </p>
                )}

                {/* Stats */}
                {(shop?.stats?.total_events || shop?.stats?.total_attendees) && (
                  <div className="flex flex-wrap justify-center gap-8 mb-8">
                    {shop.stats.total_events && (
                      <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-white">{shop.stats.total_events}+</div>
                        <div className="text-white/80 text-sm uppercase tracking-wide">Evenementen</div>
                      </div>
                    )}
                    {shop.stats.total_attendees && (
                      <div className="text-center">
                        <div className="text-3xl md:text-4xl font-bold text-white">
                          {shop.stats.total_attendees.toLocaleString()}+
                        </div>
                        <div className="text-white/80 text-sm uppercase tracking-wide">Bezoekers</div>
                      </div>
                    )}
                  </div>
                )}

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {events.length > 0 && (
                    <a
                      href="#events"
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-white text-white font-semibold hover:bg-white hover:text-gray-900 transition-all duration-200"
                    >
                      <Calendar className="h-5 w-5" />
                      <span>Bekijk evenementen</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Fallback hero without image
        <div className="bg-gray-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{shop?.name || "Welkom bij onze evenementen"}</h1>
            {branding?.venueHeaderText && (
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">{branding.venueHeaderText}</p>
            )}
          </div>
        </div>
      )}
      </>
      )}



      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Header */}
        {isCategoryPage && (
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm font-medium mb-4">
              <span className="text-2xl">🎭</span>
              <span>Categorie</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{emptyCategory} Evenementen</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ontdek alle aankomende {emptyCategory.toLowerCase()} evenementen bij deze organisator.
            </p>
          </div>
        )}

        {/* Events Section */}
        <section id="events" className="mb-16">
          {events.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <Calendar className="h-24 w-24 mx-auto text-gray-300 mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Geen evenementen gevonden</h3>
                <p className="text-gray-600 mb-8">
                  {hasActiveFilters
                    ? "Er zijn geen evenementen die voldoen aan je filters. Probeer je zoekcriteria aan te passen."
                    : "Er zijn momenteel geen aankomende evenementen gepland bij deze organisator."}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {hasActiveFilters && (
                    <button
                      onClick={() => {
                        setFilters({ location: "", type: "", start: "", end: "" })
                        window.history.pushState({}, "", window.location.pathname)
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      <Filter className="h-4 w-4" />
                      <span>Filters wissen</span>
                    </button>
                  )}
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                    style={{ backgroundColor: primaryCTA }}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Alle evenementen bekijken</span>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Events Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {isCategoryPage ? `${emptyCategory} Evenementen` : "Aankomende Evenementen"}
                  </h2>
                  <p className="text-gray-600">
                    {events.length} {events.length === 1 ? "evenement" : "evenementen"} gevonden
                  </p>
                </div>
                {events.length > 6 && null}
              </div>

              {/* Events Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {events.map((event, index) => (
                  <div
                    key={event.id}
                    className="animate-in fade-in slide-in-from-bottom-4"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: "both",
                    }}
                  >
                    <EventCard event={event} primaryColor={primaryCTA} />
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Organizer Section */}
        {shop && (
          <section className="mb-16">
            <OrganizerSidebar shop={shop} branding={branding} primaryColor={primaryCTA} />
          </section>
        )}
      </div>

      {/* Interest Types Section */}
      {availableTypes.length > 0 && (
        <section>
          <InterestTypeGrid availableTypes={availableTypes} />
        </section>
      )}

      {/* Debug Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setModalOpen(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{modalOpen === "events" ? "Fetched Events" : "Shop & Branding"}</h2>
              <button onClick={() => setModalOpen(null)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                ✕
              </button>
            </div>
            <pre className="text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded-lg overflow-auto">
              {modalOpen === "events" ? JSON.stringify(events, null, 2) : JSON.stringify({ shop, branding }, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slide-in-from-bottom-4 {
          from {
            transform: translateY(1rem);
          }
          to {
            transform: translateY(0);
          }
        }
        
        .animate-in {
          animation-duration: 0.6s;
          animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </main>
  )
}
