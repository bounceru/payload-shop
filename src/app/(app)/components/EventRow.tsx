'use client'
import { useState } from 'react'
import { Calendar, ChevronDown, Sparkles, TrendingUp } from 'lucide-react'
import EventCard from './EventCard'

export default function EventRow({
                                   title,
                                   events,
                                   primaryColor = '#2563eb',
                                   hideMoreButton = false,
                                   initialVisible = 4,
                                   subtitle,
                                   icon,
                                   featured = false,
                                 }: {
  title: string
  events: any[]
  primaryColor?: string
  hideMoreButton?: boolean
  initialVisible?: number
  subtitle?: string
  icon?: 'trending' | 'featured' | 'calendar'
  featured?: boolean
}) {
  const [visibleCount, setVisibleCount] = useState(initialVisible)
  const [isLoading, setIsLoading] = useState(false)

  const visibleEvents = events.slice(0, visibleCount)
  const hasMore = visibleCount < events.length
  const remainingCount = events.length - visibleCount

  const handleLoadMore = async () => {
    setIsLoading(true)
    // Simulate loading delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 300))
    setVisibleCount((prev) => Math.min(prev + 4, events.length))
    setIsLoading(false)
  }

  const getIcon = () => {
    switch (icon) {
      case 'trending':
        return <TrendingUp className="h-6 w-6" style={{ color: primaryColor }} />
      case 'featured':
        return <Sparkles className="h-6 w-6" style={{ color: primaryColor }} />
      case 'calendar':
        return <Calendar className="h-6 w-6" style={{ color: primaryColor }} />
      default:
        return null
    }
  }

  if (events.length === 0) {
    return (
      <section className="my-16">
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Geen evenementen gevonden</h3>
          <p className="text-gray-500">Er zijn momenteel geen evenementen beschikbaar in deze categorie.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="my-20">
      {/* Enhanced Header */}
      <div className="mb-12">
        <div className="flex items-center justify-center mb-6">
          {getIcon() && (
            <div className="mr-3 p-2 rounded-lg" style={{ backgroundColor: `${primaryColor}15` }}>
              {getIcon()}
            </div>
          )}
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-2 relative">
              {title}

            </h2>
            {subtitle && <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>}
          </div>
        </div>

        {/* Enhanced decorative divider */}
        <div className="flex justify-center">
          <div className="relative">
            <div
              className="h-1 w-32 rounded-full"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${primaryColor} 20%, ${primaryColor} 80%, transparent 100%)`,
              }}
            />
            <div
              className="absolute top-0 left-1/2 transform -translate-x-1/2 h-1 w-8 rounded-full animate-pulse"
              style={{ backgroundColor: primaryColor }}
            />
          </div>
        </div>
      </div>

      {/* Events Grid with stagger animation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {visibleEvents.map((event, index) => (
          <div
            key={event.id}
            className="animate-in fade-in slide-in-from-bottom-4"
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both',
            }}
          >
            <EventCard event={event} primaryColor={primaryColor} />
          </div>
        ))}
      </div>

      {/* Enhanced Load More Section */}
      {hasMore && !hideMoreButton && (
        <div className="mt-12 text-center">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Toont {visibleCount} van {events.length} evenementen
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2 max-w-xs mx-auto">
              <div
                className="h-2 rounded-full transition-all duration-500 ease-out"
                style={{
                  backgroundColor: primaryColor,
                  width: `${(visibleCount / events.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
            style={{
              backgroundColor: primaryColor,
            }}
          >
            {/* Background animation */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)',
                transform: 'translateX(-100%)',
                animation: 'shimmer 2s infinite',
              }}
            />

            {/* Button content */}
            <span className="relative z-10">
                            {isLoading ? 'Laden...' : `Toon ${Math.min(4, remainingCount)} meer evenementen`}
                        </span>

            {isLoading ? (
              <div
                className="relative z-10 animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <ChevronDown className="relative z-10 h-5 w-5 transition-transform group-hover:translate-y-0.5" />
            )}
          </button>

          <p className="text-xs text-gray-500 mt-3">Nog {remainingCount} evenementen beschikbaar</p>
        </div>
      )}

      {/* All events loaded message */}
      {!hasMore && events.length > initialVisible && (
        <div className="mt-12 text-center">
          <div
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-50 text-green-700 border border-green-200">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Alle evenementen geladen!</span>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
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
    </section>
  )
}
