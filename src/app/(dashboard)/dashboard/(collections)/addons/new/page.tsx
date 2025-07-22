// File: src/app/(dashboard)/dashboard/(collections)/addons/new/page.tsx

import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

import CreateAddonWizard from './CreateAddonWizard'

export default async function NewAddonWizardPage() {
  const tenantId = (await cookies()).get('payload-tenant')?.value
  if (!tenantId) {
    return notFound()
  }

  // Optional check for tenant existence
  const payload = await getPayload({ config })
  const tenantDoc = await payload.findByID({
    collection: 'tenants',
    id: tenantId,
  })
  if (!tenantDoc) {
    return notFound()
  }

  // 1) Also fetch the events for this tenant on the server
  const eventsResult = await payload.find({
    collection: 'events',
    where: { tenant: { equals: tenantId } },
    sort: '-createdAt',
    limit: 200,
    depth: 0, // or more if you want relationships expanded
  })
  const serverEvents = eventsResult.docs.map((ev) => ({
    id: ev.id,
    title: ev.title || '',
  }))

  // 2) Pass them as a prop to the wizard
  return (
    <CreateAddonWizard
      initialTenantId={tenantId}
      serverEvents={serverEvents}
    />
  )
}
