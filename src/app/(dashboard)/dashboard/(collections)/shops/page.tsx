// File: src/app/(dashboard)/dashboard/(collections)/shops/page.tsx

import { getPayload } from 'payload'
import config from '@payload-config'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { FaEdit } from 'react-icons/fa'

import { CollectionShell } from '@/app/(dashboard)/dashboard/components/ui/CollectionShell'
import { fetchShopContext } from '@/lib/fetchShopContext'
import type { Shop } from '@/payload-types' // If you have a generated type

export const dynamic = 'force-dynamic'

export default async function ShopsListPage() {
  const payload = await getPayload({ config })
  const tenantId = (await cookies()).get('payload-tenant')?.value
  const { branding } = await fetchShopContext({})
  const primaryColor = branding?.primaryColorCTA || '#ED6D38'

  // 1) Fetch shops from Payload (limit 50) & filter by tenant
  const shopsResult = await payload.find({
    collection: 'shops',
    where: {
      ...(tenantId ? { tenant: { equals: tenantId } } : {}),
    },
    limit: 50,
    sort: '-createdAt',
  })

  const shops = shopsResult.docs as Shop[]

  return (
    <CollectionShell
      title="Locaties"
      description="Beheer locaties"
      createHref="/dashboard/shops/new"
    >
      {shops.length === 0 ? (
        <div className="text-center text-gray-500 py-12">Geen locaties gevonden.</div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <li
              key={shop.id}
              className="w-full rounded-xl bg-white p-4 shadow-md hover:shadow-lg transition flex flex-col"
            >
              <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {shop.name}
                  </h2>
                  {shop.domain && (
                    <p className="text-sm text-gray-500 mt-1">
                      {shop.domain}
                    </p>
                  )}
                </div>
                <div className="flex justify-between items-center pt-4">
                  <Link
                    href={`/dashboard/shops/${shop.id}`}
                    className="flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-md shadow hover:scale-105 transition"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <FaEdit className="text-white" />
                    Bewerken
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </CollectionShell>
  )
}
