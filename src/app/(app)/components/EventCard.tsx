'use client'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowRight, Calendar, Clock, MapPin, Star } from 'lucide-react'
import { useState } from 'react'

export default function EventCard({ event, primaryColor }: { event: any; primaryColor?: string }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const resolvedColor = primaryColor?.trim() || '#ED6D38'

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoaded(true)
  }

  return (
    <Link
      href={`/${event.type}/${event.slug}`}
      className="group block h-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-xl"
    >
      <div
        className="h-full flex flex-col bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-gray-100 group-hover:border-gray-200">
        {/* Image Container */}
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
          )}

          {/* Image */}
          {event.image?.s3_url && !imageError ? (
            <img
              src={event.image.s3_url || '/placeholder.svg'}
              alt={event.title}
              className={`object-cover w-full h-full transition-all duration-500 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="text-center text-gray-400">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">Geen afbeelding</p>
              </div>
            </div>
          )}

          {/* Gradient overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Event type badge */}
          {event.type && (
            <div className="absolute top-4 right-4">
              <span
                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-sm text-gray-700 shadow-sm border border-white/20">
                {event.type}
              </span>
            </div>
          )}

          {/* Featured badge (if applicable) */}
          {event.featured && (
            <div className="absolute top-4 left-4">
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white shadow-sm"
                style={{ backgroundColor: resolvedColor }}
              >
                <Star className="h-3 w-3 fill-current" />
                Featured
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-6">
          {/* Header */}
          <div className="mb-4">
            <h3
              className="text-xl font-bold text-gray-900 leading-tight mb-2 group-hover:text-gray-700 transition-colors line-clamp-2">
              {event.title}
            </h3>

          </div>

          {/* Event details */}
          <div className="space-y-3 mb-6 flex-1">
            <div className="flex items-center gap-3 text-gray-600">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-lg"
                style={{ backgroundColor: `${resolvedColor}15` }}
              >
                <Calendar className="h-4 w-4" style={{ color: resolvedColor }} />
              </div>
              <span className="text-sm font-medium">{format(new Date(event.date), 'dd MMM yyyy')}</span>
            </div>

            <div className="flex items-center gap-3 text-gray-600">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-lg"
                style={{ backgroundColor: `${resolvedColor}15` }}
              >
                <Clock className="h-4 w-4" style={{ color: resolvedColor }} />
              </div>
              <span className="text-sm font-medium">{format(new Date(event.date), 'HH:mm')}</span>
            </div>

            <div className="flex items-center gap-3 text-gray-600">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-lg"
                style={{ backgroundColor: `${resolvedColor}15` }}
              >
                <MapPin className="h-4 w-4" style={{ color: resolvedColor }} />
              </div>
              <span className="text-sm font-medium line-clamp-1">
                {event.venue?.address ?? 'Locatie wordt nog bekendgemaakt'}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            {/* Price */}
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Vanaf</span>
              <span className="text-2xl font-bold text-gray-900">
                {event.lowestPrice ? `€${event.lowestPrice.toFixed(2)}` : 'Gratis'}
              </span>
            </div>

            {/* CTA Button */}
            <button
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 group-hover:gap-3"
              style={{
                backgroundColor: resolvedColor,
              }}
            >
              <span className="text-sm">Tickets</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
