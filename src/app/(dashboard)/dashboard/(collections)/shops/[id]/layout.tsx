// File: src/app/(dashboard)/dashboard/(collections)/shops/[id]/layout.tsx

import { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

import Link from 'next/link'

import type { Shop } from '@/payload-types'
import { ShopProvider } from './shop-context' // your context

export default async function ShopTabsLayout({
                                               // 1) Declare params as a Promise returning {id: string}
                                               //    (same pattern as your seatmaps approach).
                                               params: promiseParams,
                                               children,
                                             }: {
  params: Promise<{ id: string }>;
  children: ReactNode;
}) {
  // 2) Destructure `id` from the awaited promise
  const { id } = await promiseParams

  const tenantId = (await cookies()).get('payload-tenant')?.value
  const payload = await getPayload({ config })

  // If "id" is "new", skip fetching from Payload
  if (id === 'new') {
    return <>{children}</>
  }

  // Otherwise, fetch from Payload
  const shop = await payload.findByID({
    collection: 'shops',
    id,
    depth: 2,
  })

  if (!shop) {
    return notFound()
  }

  // Tenant check
  const shopTenant =
    typeof shop.tenant === 'object' && shop.tenant !== null
      ? shop.tenant.id
      : shop.tenant
  if (tenantId && shopTenant !== tenantId) {
    return notFound()
  }

  // Define the tabs
  const tabs = [
    { label: 'Settings', path: 'settings' },
    { label: 'Venue Branding', path: 'branding' },
    // ... etc.
  ]

  // Return your layout with <ShopProvider> and the tab nav
  return (
    <ShopProvider value={shop as Shop}>
      <div className="space-y-4">
        <div className="border-b border-gray-200 pb-2">
          <h1 className="text-2xl font-bold">{shop.name}</h1>
          <nav className="mt-2 flex gap-4">
            {tabs.map((tab) => (
              <Link
                key={tab.path}
                href={`/dashboard/shops/${shop.id}/${tab.path}`}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* The nested (tabs) pages render here */}
        <div>{children}</div>
      </div>
    </ShopProvider>
  )
}
