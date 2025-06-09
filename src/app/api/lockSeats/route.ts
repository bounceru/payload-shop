import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

export async function POST(req: NextRequest) {
    const {
        eventSlug,
        seatIds,
        lockDuration,
    }: { eventSlug: string; seatIds: string[]; lockDuration: number } = await req.json();

    const payload = await getPayload({ config });

    // 1. Fetch event by slug
    const eventRes = await payload.find({
        collection: 'events',
        where: { slug: { equals: eventSlug } },
        limit: 1,
    });

    const event = eventRes.docs[0];

    // 2. Validate event + seatMap
    if (
        !event ||
        !event.seatMap ||
        typeof event.seatMap !== 'object' ||
        !Array.isArray(event.seatMap.seats)
    ) {
        return NextResponse.json({ message: 'Invalid event or seat map' }, { status: 404 });
    }

    const now = Date.now();
    const eventId = event.id;

    // 3. Process all relevant seats
    const updatedSeats = await Promise.all(
        event.seatMap.seats.map(async (seat: any) => {
            const seatId = `${seat.row}-${seat.seat}`;
            if (!seatIds.includes(seatId)) return seat;

            // 3a. Prevent locking paid seats
            const ticketRes = await payload.find({
                collection: 'tickets',
                where: {
                    seatRow: { equals: seat.row },
                    seatNumber: { equals: seat.seat },
                    event: { equals: eventId },
                },
                depth: 1,
                limit: 1,
            });

            const hasPaidTicket = ticketRes.docs.some(
                (ticket) => typeof ticket.order === 'object' && ticket.order?.status === 'paid'
            );

            if (hasPaidTicket) return seat;

            // 3b. Remove any previous locks for this event
            const existingLocks = seat.locks || [];
            const filteredLocks = existingLocks.filter((lock: any) => lock.eventId !== eventId);

            const newLock = {
                eventId,
                lockedUntil: new Date(now + lockDuration).toISOString(),
            };

            return {
                ...seat,
                locks: [...filteredLocks, newLock],
            };
        })
    );

    // 4. Update seat map
    await payload.update({
        collection: 'seatMaps',
        id: event.seatMap.id,
        data: { seats: updatedSeats },
    });

    return NextResponse.json({ message: 'Seats locked successfully' }, { status: 200 });
}
