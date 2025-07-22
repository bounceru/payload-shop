import { getPayload } from 'payload'
import config from '@payload-config'

export default async function unlockExpiredSeats() {
  const payload = await getPayload({ config })

  // 1. Fetch all future or active events with seatMaps
  const events = await payload.find({
    collection: 'events',
    where: {
      isPublished: { equals: true },
    },
    depth: 2,
    limit: 100, // adjust if needed
  })

  for (const event of events.docs) {
    if (!event.seatMap || typeof event.seatMap === 'string') continue
    const { seatMap } = event

    const updatedSeats = await Promise.all(
      (seatMap.seats || []).map(async (seat: any) => {
        const seatId = `${seat.row}-${seat.seat}`
        const locks = seat.locks || []

        const updatedLocks = []

        for (const lock of locks) {
          if (lock.eventId !== event.id) {
            updatedLocks.push(lock)
            continue
          }

          // Check if a paid ticket exists for this seat in this event
          const ticketRes = await payload.find({
            collection: 'tickets',
            where: {
              event: { equals: event.id },
              seatRow: { equals: seat.row },
              seatNumber: { equals: seat.seat },
              status: { equals: 'paid' },
            },
            limit: 1,
          })

          const isPaid = ticketRes.totalDocs > 0

          if (isPaid) {
            updatedLocks.push(lock) // Keep lock
          }
        }

        return {
          ...seat,
          locks: updatedLocks,
        }
      }),
    )

    await payload.update({
      collection: 'seatMaps',
      id: seatMap.id,
      data: { seats: updatedSeats },
    })
  }

  console.log('Expired unpaid seat locks cleaned up.')
}
