import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

async function completeOrder(orderId: string) {
    const payload = await getPayload({ config });

    const order = await payload.findByID({
        collection: 'orders',
        id: orderId,
        overrideAccess: true,
    });

    if (!order || !order.event || !Array.isArray(order.tickets)) {
        throw new Error('Order or tickets not found');
    }

    const tickets = order.tickets;

    await payload.update({
        collection: 'orders',
        id: orderId,
        data: {
            status: 'paid',
            paymentReference: 'simulated-payment-id',
        },
        overrideAccess: true,
    });

    const event =
        typeof order.event === 'object'
            ? order.event
            : await payload.findByID({
                  collection: 'events',
                  id: order.event,
                  overrideAccess: true,
              });

    if (!event || !event.date || !event.seatMap || typeof event.seatMap === 'string') {
        throw new Error('Event seat map not found');
    }

    const seatMap = event.seatMap;

    if (!Array.isArray(seatMap.seats)) {
        throw new Error('Seat map has no seats');
    }

    const eventEnd = event.end
        ? new Date(event.end).toISOString()
        : new Date(new Date(event.date).getTime() + 6 * 60 * 60 * 1000).toISOString();

    const updatedSeats = seatMap.seats.map((seat: any) => {
        const isTicketed = tickets.some(
            (ticket: any) => ticket.seatRow === seat.row && ticket.seatNumber === seat.seat
        );

        if (!isTicketed) return seat;

        const otherLocks = (seat.locks || []).filter((l: any) => l.eventId !== event.id);

        return {
            ...seat,
            locks: [
                ...otherLocks,
                {
                    eventId: event.id,
                    lockedUntil: eventEnd,
                },
            ],
        };
    });

    await payload.update({
        collection: 'seatMaps',
        id: seatMap.id,
        data: { seats: updatedSeats },
        overrideAccess: true,
    });
}

export async function POST(req: NextRequest) {
    const match = req.nextUrl.pathname.match(/\/api\/completePayment\/([^/]+)/);
    const orderId = match?.[1];

    if (!orderId) {
        return NextResponse.json({ message: 'Order ID is required' }, { status: 400 });
    }

    try {
        await completeOrder(orderId);
        return NextResponse.json({ message: 'Payment completed and locks extended.' }, { status: 200 });
    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 400 });
    }
}

export async function GET(req: NextRequest) {
    const match = req.nextUrl.pathname.match(/\/api\/completePayment\/([^/]+)/);
    const orderId = match?.[1];

    if (!orderId) {
        return NextResponse.redirect(new URL('/mollie-check', req.nextUrl.origin));
    }

    return NextResponse.redirect(
        new URL(`/mollie-check?orderId=${orderId}`, req.nextUrl.origin),
    );
}
