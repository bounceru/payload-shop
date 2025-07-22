import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import crypto from 'crypto'

type AddonSelection = {
  seatId: string;
  addonId: string;
  quantity: number;
};

export async function POST(req: NextRequest) {
  const { customer, tickets, eventSlug, addonSelections = [] }: {
    customer: any;
    tickets: any[];
    eventSlug: string;
    addonSelections: AddonSelection[];
  } = await req.json()

  const payload = await getPayload({ config })

  // 1. Fetch event
  const eventRes = await payload.find({
    collection: 'events',
    where: { slug: { equals: eventSlug } },
    limit: 1,
  })

  const event = eventRes.docs[0]
  if (!event) return NextResponse.json({ message: 'Event not found' }, { status: 404 })

  const tenantId = event.tenant

  // 1b. Find default payment method for this event's venue
  const shopId = typeof event.venue === 'object' ? event.venue.id : event.venue
  let defaultPaymentMethodId: string | undefined = undefined
  let paymentProvider: string | undefined = undefined
  try {
    const pmRes = await payload.find({
      collection: 'payment-methods',
      where: {
        and: [
          { shops: { equals: shopId } },
          { enabled: { equals: true } },
        ],
      },
      limit: 1,
    })
    const pm = pmRes.docs[0]
    if (pm) {
      defaultPaymentMethodId = pm.id as string
      paymentProvider = pm.provider as string
    }
  } catch (err) {
    console.error('Error fetching payment method:', err)
  }

  // 2. Create or reuse customer
  let customerId: string
  const existingCustomer = await payload.find({
    collection: 'customers',
    where: { email: { equals: customer.email } },
    limit: 1,
  })

  if (existingCustomer.docs.length > 0) {
    customerId = existingCustomer.docs[0].id
  } else {
    const randomPassword = crypto.randomBytes(12).toString('hex')
    const newCustomer = await payload.create({
      collection: 'customers',
      data: { ...customer, password: randomPassword },
    })
    customerId = newCustomer.id
    console.log(`Generated password for ${customer.email}: ${randomPassword}`)
  }

  // 3. Create empty order
  const orderRes = await payload.create({
    collection: 'orders',
    data: {
      customer: customerId,
      event: event.id,
      tickets: [],
      addons: [],
      addonSelections,
      total: 0, // will be recalculated in beforeChange hook
      status: 'pending',
      tenant: tenantId,
      orderNr: Date.now(),
      paymentMethod: defaultPaymentMethodId,
      paymentProvider,
    },
  })

  // 4. Create tickets
  const ticketIds: string[] = []

  for (const ticket of tickets) {
    const ticketTypeId = typeof ticket.ticketType === 'object' ? ticket.ticketType.id : ticket.ticketType
    const row = ticket.seatRow || ticket.seatId.split('-')[0]

    const newTicket = await payload.create({
      collection: 'tickets',
      data: {
        order: orderRes.id,
        status: 'valid',
        tenant: tenantId,
        seatRow: row,
        seatNumber: ticket.seatNumber,
        ticketType: ticketTypeId,
        event: event.id,
        price: ticket.price,
        vatRate: ticket.ticketType.vatRate || 0,
        barcode: crypto.randomBytes(8).toString('hex'),
        issuedAt: new Date().toISOString(),
        customer: customerId,
      },
    })

    ticketIds.push(newTicket.id)
  }

  // 5. Update order with ticket + addon references
  await payload.update({
    collection: 'orders',
    id: orderRes.id,
    data: {
      tickets: ticketIds,
      addons: Array.from(new Set(addonSelections.map(a => a.addonId))),
      addonSelections,

      // total will be recalculated in `beforeChange`
    },
  })

  return NextResponse.json({ message: 'Order and tickets created', orderId: orderRes.id }, { status: 200 })
}
