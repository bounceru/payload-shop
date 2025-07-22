import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { fetchShopContext } from '@/lib/fetchShopContext'
import EventAdminDetail from './EventAdminDetail'

export const dynamic = 'force-dynamic'

export default async function EventDetailPage({
                                                params: promiseParams,
                                              }: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await promiseParams
  const payload = await getPayload({ config })
  const tenantId = (await cookies()).get('payload-tenant')?.value
  const { branding } = await fetchShopContext({})

  const event = await payload.findByID({
    collection: 'events',
    id,
    depth: 2,
  })

  const eventTenantId =
    typeof event.tenant === 'object' && event.tenant !== null
      ? event.tenant.id
      : event.tenant

  if (!event || (tenantId && eventTenantId !== tenantId)) {
    return notFound()
  }

  // Ensure event.type, introText, googleMapsIframe, and affiche are never null and affiche matches expected shape
  const eventWithStringType = {
    ...event,
    type: event.type === null ? undefined : event.type,
    introText: event.introText === null ? undefined : event.introText,
    googleMapsIframe: event.googleMapsIframe === null ? undefined : event.googleMapsIframe,
    end: event.end === null ? undefined : event.end,
    description: event.description === null ? undefined : event.description,
    image:
      event.image && typeof event.image === 'object'
        ? {
          id: event.image.id,
          s3_url: event.image.s3_url ?? undefined,
        }
        : undefined,
    affiche:
      event.affiche && typeof event.affiche === 'object'
        ? {
          id: event.affiche.id,
          s3_url: event.affiche.s3_url ?? undefined,
        }
        : undefined,
    sponsors:
      Array.isArray(event.sponsors)
        ? event.sponsors.map((s: any) => ({
          ...s,
          logo:
            s.logo && typeof s.logo === 'object'
              ? {
                id: s.logo.id,
                s3_url: s.logo.s3_url ?? undefined,
              }
              : undefined,
        }))
        : undefined,
    performers:
      Array.isArray(event.performers)
        ? event.performers.map((p: any) => ({
          ...p,
          image:
            p.image && typeof p.image === 'object'
              ? {
                id: p.image.id,
                s3_url: p.image.s3_url ?? undefined,
              }
              : undefined,
        }))
        : undefined,
    tenant:
      typeof event.tenant === 'object' && event.tenant !== null
        ? { id: event.tenant.id }
        : typeof event.tenant === 'string'
          ? { id: event.tenant }
          : undefined,
    isPublished:
      event.isPublished === null || event.isPublished === undefined
        ? undefined
        : event.isPublished,
    location:
      event.location === null ? undefined : event.location,
    embedAllowed:
      event.embedAllowed === null ? undefined : event.embedAllowed,
    language:
      event.language === null ? undefined : event.language,

    faqs:
      event.faqs === null
        ? undefined
        : Array.isArray(event.faqs)
          ? event.faqs.map((faq: any) => ({
            ...faq,
            id: faq.id === null ? undefined : faq.id,
          }))
          : undefined,
    venue:
      typeof event.venue === 'object' && event.venue !== null
        ? event.venue
        : undefined,
    seatMap:
      event.seatMap === null ? undefined : event.seatMap,
    seatAssignments:
      event.seatAssignments && typeof event.seatAssignments === 'object' && !Array.isArray(event.seatAssignments)
        ? Object.fromEntries(
          Object.entries(event.seatAssignments)
            .filter(([k, v]) => typeof k === 'string' && typeof v === 'string')
            .map(([k, v]) => [k, String(v)]),
        ) as Record<string, string>
        : undefined,
    ticketTypes:
      event.ticketTypes === null
        ? undefined
        : Array.isArray(event.ticketTypes)
          ? event.ticketTypes
            .filter((tt: any) => tt.id !== null)
            .map((tt: any) => ({
              ...tt,
              id: tt.id as string,
            }))
          : undefined,
  }

  return (
    <EventAdminDetail
      event={eventWithStringType}
      primaryColor={branding?.primaryColorCTA || '#ED6D38'}
    />
  )
}
