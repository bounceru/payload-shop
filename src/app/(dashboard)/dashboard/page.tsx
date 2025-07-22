import { getPayload } from 'payload'
import config from '@payload-config'
import { cookies } from 'next/headers'
import type { OnboardingStep } from './components/onboarding/OnboardingProgress'
import OnboardingProgress from './components/onboarding/OnboardingProgress'
import DashboardStats from './components/overview/DashboardStats'

export const dynamic = 'force-dynamic'

export default async function DashboardHome() {
  const payload = await getPayload({ config })
  const cookiesStore = await cookies()
  const cookieHeader = cookiesStore.toString()

  const tenantId = cookiesStore.get('payload-tenant')?.value || ''
  const where: any = tenantId ? { tenant: { equals: tenantId } } : {}

  const [shopsRes, ordersRes, eventsRes, ticketTypesRes, addonsRes, seatmapsRes] = await Promise.all([
    payload.find({ collection: 'shops', where, limit: 1 }),
    payload.find({ collection: 'orders', where }),
    payload.find({ collection: 'events', where, limit: 1 }),
    payload.find({ collection: 'event-ticket-types', where }),
    payload.find({ collection: 'addons', where, limit: 1 }),
    payload.find({ collection: 'seatMaps', where, limit: 1 }),
  ])

  const steps: OnboardingStep[] = [
    { key: 'shop', completed: shopsRes.totalDocs > 0, href: '/dashboard/shops/new' },
    { key: 'event', completed: eventsRes.totalDocs > 0, href: '/dashboard/events/new' },
    { key: 'ticketTypes', completed: ticketTypesRes.totalDocs > 0, href: '/dashboard/events' },
    { key: 'addons', completed: addonsRes.totalDocs > 0, href: '/dashboard/addons/new' },
    { key: 'seatmap', completed: seatmapsRes.totalDocs > 0, href: '/dashboard/seat-map/new' },
  ]

  const stats = [
    { label: 'Shops', value: shopsRes.totalDocs },
    { label: 'Evenementen', value: eventsRes.totalDocs },
    { label: 'Bestellingen', value: ordersRes.totalDocs },
    { label: 'Zaalplannen', value: seatmapsRes.totalDocs },
  ]

  return (
    <div className="max-w-screen-lg mx-auto space-y-8 p-4 lg:p-6">
      <OnboardingProgress steps={steps} />
      <DashboardStats stats={stats} />
    </div>
  )
}
