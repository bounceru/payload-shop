import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import type { Order, Ticket } from '@/payload-types'
import CustomerAdminDetail from './CustomerAdminDetail' // The client component

export default async function CustomerDetailPage({
                                                   params: promisedParams,
                                                 }: {
  params: Promise<{ id: string }>
}) {
  const { id } = await promisedParams

  // If the route is /dashboard/customers/new, handle creation form
  if (id === 'new') {
    // optionally, check permission
    return <CustomerAdminDetail customer={{ id: 'new' }} isNew />
  }

  // 1) Verify tenant
  const cookieStore = await cookies()
  const tenantId = cookieStore.get('payload-tenant')?.value || ''

  // 2) Fetch the single customer doc
  const payload = await getPayload({ config })
  const customerDoc = await payload.findByID({
    collection: 'customers',
    id,
    depth: 0, // minimal if we just want raw fields
  })

  if (!customerDoc) {
    return notFound()
  }

  // 3) Tenant check
  const custTenant =
    typeof customerDoc.tenant === 'object' && customerDoc.tenant !== null
      ? customerDoc.tenant.id
      : customerDoc.tenant

  if (tenantId && custTenant !== tenantId) {
    return notFound()
  }

  // 4) Fetch Orders referencing this customer
  const ordersResult = await payload.find({
    collection: 'orders',
    where: { customer: { equals: id } },
    limit: 50,
    sort: '-createdAt',
    depth: 1,
  })
  const orders = (ordersResult?.docs || []) as Order[]

  // 5) Fetch Tickets referencing this customer
  const ticketsResult = await payload.find({
    collection: 'tickets',
    where: { customer: { equals: id } },
    limit: 50,
    sort: '-createdAt',
    depth: 1,
  })
  const tickets = (ticketsResult?.docs || []) as Ticket[]

  // 6) Build a “safe” customer object, replacing null with undefined
  const safeCustomer = {
    ...customerDoc,
    // if date_of_birth is null, convert to undefined
    date_of_birth: customerDoc.date_of_birth ?? undefined,
    // if phone is null, convert to undefined
    phone: customerDoc.phone ?? undefined,
    // ensure tags is an array, never null
    tags: Array.isArray(customerDoc.tags) ? customerDoc.tags : [],
  }

  return (
    <CustomerAdminDetail
      customer={safeCustomer}
      relatedOrders={orders}
      relatedTickets={tickets}
    />
  )
}
