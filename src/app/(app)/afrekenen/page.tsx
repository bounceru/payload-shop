// src/app/(app)/afrekenen/page.tsx
import { getPayload } from 'payload'
import config from '@payload-config'
import ClientPaymentPage from './ClientPaymentPage'
import { fetchShopContext } from '@/lib/fetchShopContext'
import NavBar from '@/app/(app)/components/NavBar'
import Footer from '@/app/(app)/components/Footer'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export default async function PaymentPage({
                                            searchParams,
                                          }: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams
  const orderId = resolvedSearchParams?.orderId

  if (typeof orderId !== 'string') {
    return <div className="text-center text-red-600 py-12">❌ Ongeldig bestel-ID.</div>
  }

  const payload = await getPayload({ config })

  const order = await payload.findByID({
    collection: 'orders',
    id: orderId,
    depth: 2,
    overrideAccess: true,
  })

  if (!order || !order.event) {
    return <div className="text-center text-red-600 py-12">❌ Bestelling niet gevonden.</div>
  }

  const ticketsRes = await payload.find({
    collection: 'tickets',
    where: { order: { equals: orderId } },
    overrideAccess: true,
  })
  const tickets = ticketsRes.docs

  const addonSelections = order.addonSelections || []
  const addonIds = Array.from(new Set(addonSelections.map((sel) => sel.addonId)))
  const addonDocs = await Promise.all(
    addonIds.map((id) =>
      payload.findByID({ collection: 'addons', id, overrideAccess: true }),
    ),
  )
  const addonMap = new Map(addonDocs.map((addon) => [addon.id, addon]))

  const ticketTotal = tickets.reduce((sum, t) => sum + (t.price ?? 0), 0)
  const addonTotal = addonSelections.reduce((sum, sel) => {
    const price = addonMap.get(sel.addonId)?.price ?? 0
    return sum + price * (sel.quantity || 0)
  }, 0)
  const total = ticketTotal + addonTotal

  const eventType = typeof order.event === 'string' ? undefined : order.event?.type
  const { isShop, shop, branding } = await fetchShopContext({ category: eventType ?? undefined })

  const logoUrl =
    typeof branding?.siteLogo === 'object' && branding.siteLogo?.s3_url
      ? branding.siteLogo.s3_url
      : '/static/stagepass-logo.png'

  const headerBgColor = branding?.headerBackgroundColor || '#ED6D38'
  const headerTextColor = branding?.headerTextColor || '#ffffff'

  return (
    <>
      <NavBar
        isShop={isShop}
        logoUrl={logoUrl}
        ctaColor={headerBgColor}

        shopName={isShop ? shop?.name : undefined}
      />
      <ClientPaymentPage
        order={order}
        tickets={tickets}
        addonSelections={addonSelections}
        addonMap={Object.fromEntries(addonMap)}
        total={total}
        shop={isShop ? shop : undefined}
        branding={branding}
      />
      <Footer
        branding={{
          ...branding,
          siteLogo:
            typeof branding?.siteLogo === 'object'
              ? branding.siteLogo?.s3_url ?? undefined
              : branding?.siteLogo,
          primaryColorCTA: branding?.primaryColorCTA ?? undefined,
          headerBackgroundColor: branding?.headerBackgroundColor ?? undefined,
        }}
        isShop={isShop}
        shop={shop}
      />
    </>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Betaling',
  }
}
