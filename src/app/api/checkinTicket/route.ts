import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

export async function POST(req: NextRequest) {
  try {
    const { barcode, deviceId } = await req.json();

    if (!barcode) {
      return NextResponse.json({ message: 'Missing barcode' }, { status: 400 });
    }

    const payload = await getPayload({ config });

    // Find ticket by barcode
    const ticketRes = await payload.find({
      collection: 'tickets',
      where: { barcode: { equals: barcode } },
      limit: 1,
    });

    if (!ticketRes.docs.length) {
      // Record invalid attempt
      await payload.create({
        collection: 'checkins',
        data: {
          status: 'invalid',
          device: deviceId,
          userAgent: req.headers.get('user-agent') || '',
        },
      });
      return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });
    }

    const ticket = ticketRes.docs[0];

    if (ticket.status === 'scanned') {
      await payload.create({
        collection: 'checkins',
        data: {
          ticket: ticket.id,
          status: 'duplicate',
          device: deviceId,
          userAgent: req.headers.get('user-agent') || '',
        },
      });
      return NextResponse.json(
        { message: 'Ticket already scanned' },
        { status: 409 }
      );
    }

    await payload.update({
      collection: 'tickets',
      id: ticket.id,
      data: {
        status: 'scanned',
        scannedAt: new Date().toISOString(),
      },
    });

    await payload.create({
      collection: 'checkins',
      data: {
        ticket: ticket.id,
        status: 'success',
        device: deviceId,
        userAgent: req.headers.get('user-agent') || '',
      },
    });

    return NextResponse.json({ message: 'Checkin successful' });
  } catch (err) {
    console.error('[checkinTicket] Error:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
