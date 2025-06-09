// /api/getLockedSeats.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

export async function POST(req: NextRequest) {
    const { eventSlug } = await req.json();
    const payload = await getPayload({ config });

    // Fetch the event by eventSlug
    const eventRes = await payload.find({
        collection: 'events',
        where: { slug: { equals: eventSlug } },
        limit: 1,
    });

    const event = eventRes.docs[0];
    if (!event || !event.seatMap) {
        return NextResponse.json({ message: 'Event or seat map not found' }, { status: 404 });
    }

    if (typeof event.seatMap !== 'object' || !event.seatMap.seats) {
        return NextResponse.json({ message: 'Invalid seat map data' }, { status: 400 });
    }

    const eventId = event.id;
    const lockedSeats: string[] = [];

    for (const seat of event.seatMap.seats) {
        const seatId = `${seat.row}-${seat.seat}`;

        const ticketRes = await payload.find({
            collection: "tickets",
            where: {
                seatRow: { equals: seat.row },
                seatNumber: { equals: seat.seat },
                event: { equals: eventId },
            },
            depth: 1,
            limit: 1,
        });

        const isSold = ticketRes.docs.some(
            (t) => typeof t.order === "object" && t.order?.status === "paid"
        );

        if (isSold) {
            lockedSeats.push(seatId);
            continue;
        }

        const activeLock = (seat.locks || []).some(
            (lock: any) =>
                lock.eventId === eventId &&
                new Date(lock.lockedUntil).getTime() > Date.now()
        );

        if (activeLock) {
            lockedSeats.push(seatId);
        }
    }

    return NextResponse.json({ lockedSeats });
}
