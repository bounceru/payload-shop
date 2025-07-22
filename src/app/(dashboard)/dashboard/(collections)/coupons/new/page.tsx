import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

import CreateCouponWizard from './CreateCouponWizard' // the wizard above

export default async function NewCouponWizardPage() {
  // 1) read tenant
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

  // 3) fetch events for the user to pick
  const eventsResult = await payload.find({
    collection: 'events',
    where: { tenant: { equals: tenantId } },
    limit: 50,
    sort: '-createdAt',
    depth: 0,
  })
  const serverEvents = (eventsResult.docs || []).map((ev: any) => ({
    id: ev.id,
    title: ev.title || '',
  }))

  // 4) fetch ticket types if you want
  const ticketTypesResult = await payload.find({
    collection: 'event-ticket-types',
    where: { tenant: { equals: tenantId } },
    limit: 50,
    sort: '-createdAt',
    depth: 0,
  })
  const serverTicketTypes = (ticketTypesResult.docs || []).map((tt: any) => ({
    id: tt.id,
    name_nl: tt.name_nl || '',
  }))

  // 5) pass them to the wizard
  return (
    <CreateCouponWizard
      initialTenantId={tenantId}
      serverEvents={serverEvents}
      serverTicketTypes={serverTicketTypes}
    />
  )
}
