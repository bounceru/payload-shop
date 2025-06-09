import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import jwt from 'jsonwebtoken';
import { sendEmail } from '@/lib/sendEmail';

export async function POST(req: NextRequest) {
    const { email } = await req.json().catch(() => ({ }));
    if (!email || typeof email !== 'string') {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const payload = await getPayload({ config });
    const res = await payload.find({
        collection: 'customers',
        where: { email: { equals: email } },
        limit: 1,
    });

    if (!res.docs.length) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const customer = res.docs[0] as any;
    const token = jwt.sign(
        { id: customer.id, collection: 'customers' },
        (config as any).secret,
        { expiresIn: '1h' }
    );

    const link = `${process.env.NEXT_PUBLIC_SERVER_URL}/magic-login?token=${token}`;
    try {
        await sendEmail(payload, {
            to: email,
            subject: 'Your login link',
            html: `<p>Click <a href="${link}">here</a> to log in to your account.</p>`,
            tenantId: typeof customer.tenant === 'object' ? customer.tenant.id : customer.tenant,
        });
    } catch (err) {
        console.error('Error sending magic link email:', err);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Magic link sent' });
}
