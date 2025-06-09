// File: /app/api/updateCurrentCustomer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // Next.js 13.4+ only
import { getPayload } from 'payload';
import config from '@payload-config';

// If you have multiple auth collections, 
// check your browser dev tools for the exact cookie name, e.g. "payload-token-customers".
const COOKIE_NAME = 'payload-token';

export async function PATCH(req: NextRequest) {
    try {
        const payloadConfig = await config;
        const payload = await getPayload({ config: payloadConfig });

        // 1) Read the "payload-token" cookie
        const tokenCookie = (await cookies()).get(COOKIE_NAME);
        if (!tokenCookie) {
            return NextResponse.json(
                { error: 'Not logged in (no token cookie found)' },
                { status: 401 },
            );
        }

        // The actual JWT
        const token = tokenCookie.value;

        // 2) Let Payload verify it, so we avoid manual "jwt.verify(...)"
        // If TS complains, do: (payload as any).verifyJWT(token)
        const userData = await (payload as any).verifyJWT(token);

        // 3) Ensure it's from the "customers" collection
        if (!userData?.id || userData.collection !== 'customers') {
            return NextResponse.json(
                { error: 'Not logged in as customer' },
                { status: 401 },
            );
        }

        // 4) Parse the request body
        const body = await req.json().catch(() => ({}));
        const updateData: Record<string, any> = {};
        if (typeof body.firstname === 'string') updateData.firstname = body.firstname;
        if (typeof body.lastname === 'string') updateData.lastname = body.lastname;
        if (typeof body.password === 'string') updateData.password = body.password;

        // 5) Create mockReq so doc-level + field-level access is enforced
        const mockReq = {
            user: {
                id: userData.id,
                collection: 'customers',
            },
            payloadAPI: 'local',
        };

        // 6) Update only safe fields
        const updatedDoc = await payload.update({
            collection: 'customers',
            id: userData.id,
            data: updateData,
            depth: 2,
            overrideAccess: false,
            req: mockReq as any,
        });

        return NextResponse.json(updatedDoc);
    } catch (err: any) {
        console.error('[updateCurrentCustomer] Error =>', err);
        return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
    }
}
