import { getPayload } from 'payload'
import config from '@payload-config'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { FaCalendarAlt, FaClock, FaEdit, FaEye, FaMapMarkerAlt, FaStar } from 'react-icons/fa'

import { CollectionShell } from '@/app/(dashboard)/dashboard/components/ui/CollectionShell'
import { fetchShopContext } from '@/lib/fetchShopContext'
import { getS3Url } from '@/utils/media'
import type { Event as EventTypeFromPayload } from '@/payload-types'

export type EventWithStatus = EventTypeFromPayload & {
  _status?: 'draft' | 'published'
}

export const dynamic = 'force-dynamic'

export default async function EventsListPage() {
  const payload = await getPayload({ config })
  const tenantId = (await cookies()).get('payload-tenant')?.value
  const { branding } = await fetchShopContext({})
  const primaryColor = branding?.primaryColorCTA || '#ED6D38'

  const events = await payload.find({
    collection: 'events',
    where: {
      ...(tenantId ? { tenant: { equals: tenantId } } : {}),
    },
    limit: 50,
    depth: 2,
  })

  return (
    <CollectionShell
      title="Evenementen"
      description="Beheer je gepubliceerde en concept evenementen"
      createHref="/dashboard/events/new"
    >
      {events.docs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="relative mb-6">
            <div
              className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl flex items-center justify-center">
              <FaCalendarAlt className="text-4xl text-gray-400" />
            </div>
            <div
              className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <FaStar className="text-white text-sm" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Nog geen evenementen</h3>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
            Begin door je eerste evenement aan te maken. Je kunt datums, locaties, tickets en meer beheren.
          </p>
          <Link
            href="/dashboard/events/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            style={{ backgroundColor: primaryColor }}
          >
            <FaCalendarAlt className="text-lg" />
            Maak je eerste evenement
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.docs.map((event) => {
            const logo = getS3Url(event.image) || ''
            const isUpcoming = event.date && new Date(event.date) > new Date()
            const isPast = event.date && new Date(event.date) < new Date()
            const isToday = event.date && new Date(event.date).toDateString() === new Date().toDateString()

            // Status bepaling
            let statusLabel = 'Gepubliceerd'
            let statusColor = 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'

            if (isToday) {
              statusLabel = 'Vandaag'
              statusColor = 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
            } else if (isUpcoming) {
              statusLabel = 'Aankomend'
              statusColor = 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
            } else if (isPast) {
              statusLabel = 'Afgelopen'
              statusColor = 'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-500'
            }

            return (
              <div
                key={event.id}
                className="group relative bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden"
              >
                {/* Afbeelding Sectie */}
                <div
                  className="relative aspect-video w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-t-2xl overflow-hidden">
                  {logo ? (
                    <img src={logo || '/placeholder.svg'} alt={event.title} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <FaCalendarAlt className="text-4xl text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Geen afbeelding</p>
                      </div>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                                        <span
                                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
                                        >
                                            {statusLabel}
                                        </span>
                  </div>

                  {/* Hover Overlay */}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Quick View Button */}
                  <div
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Link
                      href={`/dashboard/events/${event.id}`}
                      className="inline-flex items-center justify-center w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                      title="Bekijk evenement"
                    >
                      <FaEye className="text-gray-600 text-sm" />
                    </Link>
                  </div>
                </div>

                {/* Inhoud Sectie */}
                <div className="p-5 space-y-4">
                  {/* Titel en Beschrijving */}
                  <div>
                    <h3
                      className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {event.title}
                    </h3>
                    {event.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{event.description}</p>
                    )}
                  </div>

                  {/* Evenement Details */}
                  <div className="space-y-2">
                    {event.date && (
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-blue-500 flex-shrink-0" />
                          <span>{format(new Date(event.date), 'dd MMM yyyy', { locale: nl })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaClock className="text-green-500 flex-shrink-0" />
                          <span>{format(new Date(event.date), 'HH:mm')}</span>
                        </div>
                      </div>
                    )}

                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <FaMapMarkerAlt className="text-red-500 flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}

                    {/* Extra Informatie */}
                    <div
                      className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-white/10">

                      {event.createdAt && (
                        <span>Aangemaakt {format(new Date(event.createdAt), 'dd MMM', { locale: nl })}</span>
                      )}
                    </div>
                  </div>

                  {/* Actie Knop */}
                  <div className="pt-2">
                    <Link
                      href={`/dashboard/events/${event.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 text-sm"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <FaEdit className="text-sm" />
                      Bewerk evenement
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </CollectionShell>
  )
}
