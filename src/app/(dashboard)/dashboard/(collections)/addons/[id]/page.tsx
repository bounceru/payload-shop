// File: src/app/(dashboard)/dashboard/(collections)/addons/[id]/page.tsx

import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import type { Addon } from '@/payload-types'
import AddonAdminDetail from './AddonAdminDetail'

export default async function AddonDetailPage({
                                                params: promisedParams,
                                              }: {
  params: Promise<{ id: string }>
}) {
  const { id } = await promisedParams

  // If “new,” we render a blank form
  if (id === 'new') {
    return <AddonAdminDetail addon={{ id: 'new' }} isNew events={[]} />
  }

  // 1) Tenant check
  const cookieStore = await cookies()
  const tenantId = cookieStore.get('payload-tenant')?.value
  if (!tenantId) {
    return notFound()
  }

  // 2) Fetch the single add-on
  const payload = await getPayload({ config })
  const addon = await payload.findByID({
    collection: 'addons',
    id,
    depth: 2, // or more if you need relationships expanded
  })
  if (!addon) {
    return notFound()
  }

  // 3) Confirm tenant
  const addonTenant =
    typeof addon.tenant === 'object' && addon.tenant !== null
      ? addon.tenant.id
      : addon.tenant
  if (addonTenant !== tenantId) {
    return notFound()
  }

  // 4) Also fetch all events for this tenant
  const eventsResult = await payload.find({
    collection: 'events',
    where: { tenant: { equals: tenantId } },
    limit: 200,
    sort: '-createdAt',
    depth: 0, // or more if needed
  })
  const serverEvents = eventsResult.docs.map((ev) => ({
    id: ev.id,
    title: ev.title ?? '',
  }))

  // 5) Convert any null fields in the add-on to undefined
  const safeAddon: Addon = {
    ...addon,
    maxQuantity: addon.maxQuantity ?? undefined,
    price: addon.price ?? 0,
  }

  return (
    <AddonAdminDetail
      addon={safeAddon}
      events={serverEvents}  // pass them along
    />
  )
}
