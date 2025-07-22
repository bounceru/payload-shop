import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: NextRequest) {
  const { eventSlug, seatIds }: { eventSlug: string; seatIds: string[] } = await req.json()
  const payload = await getPayload({ config })

  // 1. Fetch event by slug
  const eventRes = await payload.find({
    collection: 'events',
    where: { slug: { equals: eventSlug } },
    limit: 1,
  })

  const event = eventRes.docs[0]

  if (!event || !event.seatMap || typeof event.seatMap !== 'object' || !Array.isArray(event.seatMap.seats)) {
    return NextResponse.json({ message: 'Invalid event or seat map' }, { status: 404 })
  }

  const updatedSeats = await Promise.all(
    event.seatMap.seats.map(async (seat: any) => {
      const seatId = `${seat.row}-${seat.seat}`
      if (!seatIds.includes(seatId)) return seat

      const eventLocks = seat.locks || []

      const updatedLocks = await Promise.all(
        eventLocks.map(async (lock: any) => {
          if (lock.eventId !== event.id) return lock // Keep locks from other events

          // Check if this seat has a paid ticket
          const ticketRes = await payload.find({
            collection: 'tickets',
            where: {
              seatRow: { equals: seat.row },
              seatNumber: { equals: seat.seat },
              event: { equals: event.id },
            },
            depth: 1,
            limit: 1,
          })

          const hasPaidTicket = ticketRes.docs.some((ticket) =>
            typeof ticket.order === 'object' && ticket.order?.status === 'paid',
          )

          return hasPaidTicket ? lock : null // ✅ Remove only if no paid ticket
        }),
      )

      return {
        ...seat,
        locks: updatedLocks.filter((l) => l !== null),
      }
    }),
  )

  await payload.update({
    collection: 'seatMaps',
    id: event.seatMap.id,
    data: { seats: updatedSeats },
  })

  return NextResponse.json({ message: 'Locks updated (forced unlock)' }, { status: 200 })
}
