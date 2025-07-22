// File: src/app/(dashboard)/dashboard/(collections)/seatmaps/page.tsx

import { getPayload } from 'payload'
import config from '@payload-config'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { FaEdit } from 'react-icons/fa'

import { CollectionShell } from '@/app/(dashboard)/dashboard/components/ui/CollectionShell'
// <— a shell layout if you have one, else remove or replace
import { fetchShopContext } from '@/lib/fetchShopContext'
import type { SeatMap } from '@/payload-types'

export const dynamic = 'force-dynamic'

export default async function SeatMapsListPage() {
  const payload = await getPayload({ config })
  const tenantId = (await cookies()).get('payload-tenant')?.value
  const { branding } = await fetchShopContext({})
  const primaryColor = branding?.primaryColorCTA || '#ED6D38'

  // 1) Fetch seat maps from Payload (limit 50)
  const seatMapsResult = await payload.find({
    collection: 'seatMaps',
    where: {
      ...(tenantId ? { tenant: { equals: tenantId } } : {}),
    },
    limit: 50,
  })

  const seatMaps = seatMapsResult.docs as SeatMap[]

  return (
    <CollectionShell
      title="Zaalplannen"
      description="Beheer je zaalplannen"
      createHref="/dashboard/seat-map/new"
    >
      {seatMaps.length === 0 ? (
        <div className="text-center text-gray-500 py-12">Geen zaalplannen gevonden.</div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {seatMaps.map((seatMap) => {
            // We can show the seat map name, row/column counts, etc.
            return (
              <li
                key={seatMap.id}
                className="w-full rounded-xl bg-white p-4 shadow-md hover:shadow-lg transition flex flex-col"
              >
                <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {seatMap.name}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Rijen: {seatMap.rows}, Kolommen: {seatMap.columns}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <Link
                      href={`/dashboard/seat-map/${seatMap.id}`}
                      className="flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-md shadow hover:scale-105 transition"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <FaEdit className="text-white" />
                      Bewerken
                    </Link>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </CollectionShell>
  )
}
