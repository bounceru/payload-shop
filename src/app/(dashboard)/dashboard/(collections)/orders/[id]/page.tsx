// File: src/app/(dashboard)/dashboard/(collections)/orders/[id]/page.tsx

import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Addon, Ticket } from '@/payload-types'
import OrderAdminDetail from './OrderAdminDetail' // a client component that does editing

export default async function OrderDetailPage({
                                                params: promisedParams,
                                              }: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await promisedParams

  // If “new”
  if (id === 'new') {
    // Optionally check if the user can create an order
    // Then pass an empty doc
    return <OrderAdminDetail order={{ id: 'new' }} isNew />
  }

  const cookieStore = await cookies()
  const tenantId = cookieStore.get('payload-tenant')?.value
  const payload = await getPayload({ config })

  // 1) fetch existing order doc
  const order = await payload.findByID({
    collection: 'orders',
    id,
    depth: 3, // So we get related Tickets, Addons, etc.d
  })

  if (!order) {
    return notFound()
  }

  // 2) Tenant check
  const orderTenant =
    typeof order.tenant === 'object' && order.tenant !== null
      ? order.tenant.id
      : order.tenant

  if (tenantId && orderTenant !== tenantId) {
    return notFound()
  }

  // Ensure tickets is never null and is a valid type
  let safeTickets: string[] | Ticket[] | undefined = undefined
  if (order.tickets === null) {
    safeTickets = undefined
  } else if (Array.isArray(order.tickets) && order.tickets.length > 0) {
    if (typeof order.tickets[0] === 'string') {
      safeTickets = order.tickets as string[]
    } else {
      safeTickets = order.tickets as Ticket[]
    }
  } else {
    safeTickets = order.tickets as string[] | Ticket[] | undefined
  }

  const safeAddons =
    order.addons === null ? undefined : order.addons as string[] | Addon[] | undefined

  // Normalize customer.phone: convert null to undefined if necessary, and ensure id is present
  let safeCustomer: any = order.customer
  if (safeCustomer && typeof safeCustomer === 'object') {
    const { phone, id, ...rest } = safeCustomer as Record<string, any>
    safeCustomer = {
      id, // ensure id is present
      ...rest,
      phone: phone === null ? undefined : phone,
    }
  }

  const safeOrder = {
    ...order,
    tickets: safeTickets,
    addons: safeAddons,
    customer: safeCustomer,
    paymentReference: order.paymentReference === null ? undefined : order.paymentReference,
  }

  return <OrderAdminDetail order={safeOrder} />
}
