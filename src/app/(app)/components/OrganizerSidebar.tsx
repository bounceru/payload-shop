'use client'
import { Building2, Calendar, Globe, Mail, MapPin, Phone, Star, Users } from 'lucide-react'

export default function OrganizerSidebar({
                                           shop,
                                           branding,
                                           primaryColor = '#ED6D38',
                                         }: {
  shop: any
  branding: any
  primaryColor?: string
}) {
  if (!shop) {
    return (
      <div className="bg-gray-50 rounded-2xl p-8 text-center">
        <Building2 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Geen organisator informatie</h3>
        <p className="text-gray-500">Er is momenteel geen informatie beschikbaar over deze organisator.</p>
      </div>
    )
  }

  const contactItems = [
    {
      icon: Building2,
      label: 'Bedrijf',
      value: shop.company_details?.company_name,
      type: 'text',
    },
    {
      icon: MapPin,
      label: 'Locatie',
      value: shop.company_details?.city,
      type: 'text',
    },
    {
      icon: Phone,
      label: 'Telefoon',
      value: shop.company_details?.phone,
      type: 'tel',
      href: `tel:${shop.company_details?.phone}`,
    },
    {
      icon: Mail,
      label: 'Email',
      value: shop.company_details?.contact_email,
      type: 'email',
      href: `mailto:${shop.company_details?.contact_email}`,
    },
    {
      icon: Globe,
      label: 'Website',
      value: shop.company_details?.website_url,
      type: 'url',
      href: shop.company_details?.website_url,
      external: true,
    },
  ].filter((item) => item.value)

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div
        className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex flex-col lg:flex-row">
          {/* Logo Section */}
          {branding?.siteLogo?.s3_url && (
            <div className="lg:w-1/3 p-6 lg:p-8 flex items-center justify-center bg-gray-50">
              <div className="relative group">
                <img
                  src={branding.siteLogo.s3_url || '/placeholder.svg'}
                  alt="Organisator logo"
                  className="w-full max-w-[200px] h-auto object-contain rounded-xl shadow-sm group-hover:shadow-md transition-shadow duration-300"
                />
                <div
                  className="absolute inset-0 rounded-xl bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
              </div>
            </div>
          )}

          {/* Content Section */}
          <div className="lg:w-2/3 p-6 lg:p-8">
            <div className="flex items-start gap-4 mb-6">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <Building2 className="h-6 w-6" style={{ color: primaryColor }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Over de organisator</h2>
                <p className="text-gray-600">Leer meer over wie dit evenement organiseert</p>
              </div>
            </div>

            {/* Intro Text */}
            {branding?.venueIntroText && (
              <div className="prose prose-gray max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                  {branding.venueIntroText}
                </div>
              </div>
            )}

            {/* Stats (if available) */}
            {(shop.stats?.total_events || shop.stats?.total_attendees) && (
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
                {shop.stats?.total_events && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Calendar className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <div className="text-2xl font-bold text-gray-900">{shop.stats.total_events}</div>
                    <div className="text-sm text-gray-600">Evenementen</div>
                  </div>
                )}
                {shop.stats?.total_attendees && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Users className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <div className="text-2xl font-bold text-gray-900">{shop.stats.total_attendees}</div>
                    <div className="text-sm text-gray-600">Bezoekers</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div
        className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${primaryColor}15` }}
          >
            <Mail className="h-5 w-5" style={{ color: primaryColor }} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Contactgegevens</h3>
        </div>

        <div className="space-y-4">
          {contactItems.map((item, index) => {
            const Icon = item.icon
            const isLink = item.href

            const content = (
              <div
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200 group">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <Icon className="h-5 w-5" style={{ color: primaryColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-600 mb-1">{item.label}</div>
                  <div className="text-gray-900 font-medium truncate group-hover:text-gray-700 transition-colors">
                    {item.value}
                  </div>
                </div>
                {isLink && (
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center">
                                            <span className="text-xs" style={{ color: primaryColor }}>
                                                →
                                            </span>
                    </div>
                  </div>
                )}
              </div>
            )

            if (isLink) {
              return (
                <a
                  key={index}
                  href={item.href}
                  className="block focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-xl"
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                >
                  {content}
                </a>
              )
            }

            return <div key={index}>{content}</div>
          })}
        </div>

        {/* Trust indicators */}
        {shop.verified && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                <Star className="h-3 w-3 text-green-600 fill-current" />
              </div>
              <span className="text-green-700 font-medium">Geverifieerde organisator</span>
            </div>
          </div>
        )}
      </div>

      {/* Additional Info */}
      {shop.company_details?.description && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Meer informatie</h3>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed">{shop.company_details.description}</p>
          </div>
        </div>
      )}
    </div>
  )
}
