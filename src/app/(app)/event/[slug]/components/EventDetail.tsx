'use client'
import type React from 'react'
import { useEffect, useState } from 'react'

import { format } from 'date-fns'
import {
  Calendar,
  ChevronDown,
  Clock,
  Facebook,
  Heart,
  Instagram,
  Linkedin,
  MapPin,
  Share2,
  Star,
  Tag,
  Twitter,
  Users,
} from 'lucide-react'
import Section from './Section'
import RichText from './RichText'
import SeatMapSelector from './SeatMapSelector'
import LocationSection from './LocationSection'

type Props = {
  event: any
  branding?: {
    primaryColorCTA?: string
  }
}

export default function EventDetail({ event, branding }: Props) {
  const [isMobile, setIsMobile] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)

  const primaryColor = branding?.primaryColorCTA || event.venue?.branding?.primaryColorCTA || '#ED6D38'

  useEffect(() => {
    setIsMobile(window.matchMedia('(max-width: 768px)').matches)

    const hash = window.location.hash
    if (hash) {
      const el = document.querySelector(hash)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  const availableSeats =
    event.seatMap?.seats?.filter((seat: any) => !seat.locks || seat.locks.length === 0)?.length ?? 0

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.introText,
        url: window.location.href,
      })
    } else {
      setShowShareMenu(!showShareMenu)
    }
  }

  return (
    <main className="w-full bg-gray-50">
      {/* Enhanced Hero Section */}
      <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-110 blur-sm"
          style={{
            backgroundImage: `url(${event.image?.s3_url || event.affiche?.s3_url || '/placeholder.svg'})`,
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />

        {/* Content */}
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left: Event Info */}
              <div className="text-white space-y-6">
                {/* Event Type Badge */}
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium">
                  <Tag className="h-4 w-4" />
                  <span>{event.type}</span>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">{event.title}</h1>

                {/* Organizer */}
                <p className="text-lg text-white/90 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Georganiseerd door {event.venue?.company_details?.company_name ?? 'onbekend'}
                </p>

                {/* Availability */}
                <div className="flex items-center gap-4">
                  <div
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 backdrop-blur-sm text-green-300">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">Nog {availableSeats} plaatsen beschikbaar!</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={() => {
                      const el = document.querySelector('#seats')
                      if (el) el.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-semibold hover:shadow-xl hover:-translate-y-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{
                      backgroundColor: primaryColor,
                    }}
                  >
                    <Star className="h-5 w-5" />
                    <span>Tickets kopen</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsFavorite(!isFavorite)}
                      className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                    >
                      <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current text-red-400' : ''}`} />
                    </button>

                    <div className="relative">
                      <button
                        onClick={handleShare}
                        className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                      >
                        <Share2 className="h-5 w-5" />
                      </button>

                      {showShareMenu && (
                        <div
                          className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50">
                          <div className="flex gap-2">
                            <button className="p-2 rounded-lg hover:bg-gray-100 text-blue-600">
                              <Facebook className="h-5 w-5" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-gray-100 text-black">
                              <Twitter className="h-5 w-5" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-gray-100 text-blue-700">
                              <Linkedin className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Event Image */}
              {(event.image?.s3_url || event.affiche?.s3_url) && (
                <div className="hidden lg:block">
                  <div className="relative">
                    <div className="h-[400px] rounded-2xl overflow-hidden">
                      <img
                        src={event.image?.s3_url || event.affiche?.s3_url || '/placeholder.svg'}
                        alt="Event visual"
                        className="w-full h-full object-contain"
                      />
                    </div>

                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Info Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoBlock
              label="Datum"
              value={format(new Date(event.date), 'dd MMM yyyy')}
              icon={Calendar}
              primaryColor={primaryColor}
            />
            <InfoBlock
              label="Tijd"
              value={format(new Date(event.date), 'HH:mm')}
              icon={Clock}
              primaryColor={primaryColor}
            />
            <InfoBlock label="Type" value={event.type} icon={Tag} primaryColor={primaryColor} />
            <InfoBlock label="Locatie" value={event.venue?.name || 'TBA'} icon={MapPin} primaryColor={primaryColor} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <Section title="Intro" primaryColor={primaryColor}>

          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-700 leading-relaxed">{event.introText}</p>
          </div>
        </Section>

        {/* Seat Selection */}
        <Section title="Kies je zetels" primaryColor={primaryColor}>
          <div id="seats" className="scroll-mt-20">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <SeatMapSelector seatMap={event.seatMap} event={event} />
            </div>
          </div>
        </Section>

        {/* Description */}
        <Section title="Beschrijving" primaryColor={primaryColor}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            {/* Content */}
            <div className="lg:col-span-2">
              <div className="prose prose-lg max-w-none">
                <RichText content={event.description} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {event.affiche?.s3_url && (
                <div className="bg-white rounded-2xl p-6 ">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden">
                    <img
                      src={event.affiche.s3_url || '/placeholder.svg'}
                      alt="Event poster"
                      className="w-full h-full object-containr"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </Section>

        {/* Performers */}
        {event.performers?.length > 0 && (
          <Section title="Artiesten & Performers" primaryColor={primaryColor}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {event.performers.map((performer: any, index: number) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {performer.image?.s3_url && (
                      <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                        <img
                          src={performer.image.s3_url || '/placeholder.svg'}
                          alt={performer.stageName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{performer.realName}</h3>
                      <p className="text-sm text-gray-600 italic truncate">{performer.stageName}</p>
                      {performer.socials && (
                        <div className="flex gap-2 mt-3">
                          {performer.socials.facebook && (
                            <a
                              href={performer.socials.facebook}
                              className="p-2 rounded-lg bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 transition-colors"
                            >
                              <Facebook className="h-4 w-4" />
                            </a>
                          )}
                          {performer.socials.instagram && (
                            <a
                              href={performer.socials.instagram}
                              className="p-2 rounded-lg bg-gray-100 hover:bg-pink-100 text-gray-600 hover:text-pink-600 transition-colors"
                            >
                              <Instagram className="h-4 w-4" />
                            </a>
                          )}
                          {performer.socials.linkedin && (
                            <a
                              href={performer.socials.linkedin}
                              className="p-2 rounded-lg bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-700 transition-colors"
                            >
                              <Linkedin className="h-4 w-4" />
                            </a>
                          )}
                          {performer.socials.x && (
                            <a
                              href={performer.socials.x}
                              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                              <Twitter className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Location */}
        <Section title="Locatie & Bereikbaarheid" primaryColor={primaryColor}>
          <div className="bg-white rounded-2xl overflow-hidden">
            <LocationSection venue={event.venue} googleMapsIframe={event.googleMapsIframe} />
          </div>
        </Section>

        {/* FAQs */}
        {event.faqs?.length > 0 && (
          <Section title="Veelgestelde vragen" primaryColor={primaryColor}>
            <div className="space-y-4">
              {event.faqs.map((faq: any, index: number) => (
                <details
                  key={index}
                  className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <summary className="flex items-center justify-between p-6 cursor-pointer">
                    <h3 className="font-semibold text-gray-900 pr-4">{faq.question}</h3>
                    <ChevronDown
                      className="h-5 w-5 text-gray-500 group-open:rotate-180 transition-transform flex-shrink-0" />
                  </summary>
                  <div className="px-6 pb-6">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </Section>
        )}

        {/* Sponsors */}
        {event.sponsors?.length > 0 && (
          <Section title="Sponsors & Partners" primaryColor={primaryColor}>
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
                {event.sponsors.map((sponsor: any, index: number) =>
                  sponsor.logo?.s3_url ? (
                    <div
                      key={index}
                      className="flex items-center justify-center p-4 grayscale hover:grayscale-0 transition-all"
                    >
                      <img
                        src={sponsor.logo.s3_url || '/placeholder.svg'}
                        alt="Sponsor logo"
                        className="max-h-16 max-w-full object-contain"
                      />
                    </div>
                  ) : null,
                )}
              </div>
            </div>
          </Section>
        )}
      </div>
    </main>
  )
}

function InfoBlock({
                     label,
                     value,
                     icon: Icon,
                     primaryColor = '#ED6D38',
                   }: {
  label: string
  value: string
  icon: React.ElementType
  primaryColor?: string
}) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${primaryColor}15` }}
      >
        <Icon className="h-5 w-5" style={{ color: primaryColor }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</div>
        <div className="text-sm font-semibold text-gray-900 truncate">{value}</div>
      </div>
    </div>
  )
}
