import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(req: NextRequest) {
  const { orderId } = req.nextUrl.pathname.match(/\/api\/getOrderDetails\/([^/]+)/)?.groups || {}

  if (!orderId) {
    return NextResponse.json({ message: 'Order ID is required' }, { status: 400 })
  }

  const payload = await getPayload({ config })

  try {
    // Fetch the order document including addonSelections
    const orderRes = await payload.findByID({
      collection: 'orders',
      id: orderId,
    })

    if (!orderRes) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 })
    }

    // Fetch related tickets
    const ticketsRes = await payload.find({
      collection: 'tickets',
      where: { order: { equals: orderId } },
    })

    const tickets = ticketsRes.docs

    // Fetch related addons from addonSelections
    const addonSelections = orderRes.addonSelections || []

    // Group addonSelections by addonId to avoid duplicate fetches
    const uniqueAddonIds = Array.from(new Set(addonSelections.map((a: any) => a.addonId)))
    const addonDocs = await Promise.all(
      uniqueAddonIds.map(id => payload.findByID({ collection: 'addons', id })),
    )

    const addonPriceMap = new Map(addonDocs.map(addon => [addon.id, addon.price || 0]))

    // Total = ticket prices + addon quantity * price
    const ticketTotal = tickets.reduce((acc, ticket) => acc + (ticket.price || 0), 0)
    const addonTotal = addonSelections.reduce((sum, selection) => {
      const addonPrice = addonPriceMap.get(selection.addonId) || 0
      return sum + addonPrice * (selection.quantity || 0)
    }, 0)

    const total = ticketTotal + addonTotal

    return NextResponse.json({
      order: {
        ...orderRes,
        tickets,
        addonSelections,
        total,
      },
    }, { status: 200 })

  } catch (error) {
    console.error('Error fetching order details:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
