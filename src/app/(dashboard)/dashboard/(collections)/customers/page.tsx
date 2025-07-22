import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

import { CollectionShell } from '@/app/(dashboard)/dashboard/components/ui/CollectionShell'
import CustomersTableClient from './CustomersTableClient' // the client component
// If you have a global `Customer` type:
import type { Customer } from '@/payload-types'

export const dynamic = 'force-dynamic'

export default async function CustomersListPage() {
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
    collection: 'customers',
    where,
    limit: 50,
    sort: '-createdAt', // or whichever field you want to sort by
    depth: 1,
  })

  if (!result) {
    return notFound()
  }

  const customers = result.docs as Customer[]

  return (
    <CollectionShell
      title="Klanten"
      description="Beheer van alle klanten."
      createHref="/dashboard/customers/new" // If you allow creation
    >
      {customers.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          Geen klanten gevonden.
        </div>
      ) : (
        <CustomersTableClient customers={customers} />
      )}
    </CollectionShell>
  )
}
