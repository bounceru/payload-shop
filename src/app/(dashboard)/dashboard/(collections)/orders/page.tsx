import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

import { CollectionShell } from '@/app/(dashboard)/dashboard/components/ui/CollectionShell'
import OrdersTableClient from './OrdersTableClient' // import your Client Component here
// If you have a global `Order` type:
import type { Order } from '@/payload-types'

export const dynamic = 'force-dynamic'

export default async function OrdersListPage() {
  // 1) read tenant from cookies if needed
  const cookieStore = await cookies()
  const tenantId = cookieStore.get('payload-tenant')?.value || ''

  // 2) create a "where" filter
  const where: any = {}
  if (tenantId) {
    where.tenant = { equals: tenantId }
  }

  // 3) fetch from Payload
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'orders',
    where,
    limit: 50,
    sort: '-orderNr',
    depth: 1, // or 2, based on how much you want expanded
  })

  if (!result) {
    return notFound()
  }

  const orders = result.docs as Order[]

  return (
    <CollectionShell
      title="Bestellingen"
      description="Beheer van alle bestellingen."
      createHref="/dashboard/orders/new"
      createDisabled={true}
    >
      {orders.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          Geen bestellingen gevonden.
        </div>
      ) : (
        // Pass orders to the Client Component
        <OrdersTableClient orders={orders} />
      )}
    </CollectionShell>
  )
}
