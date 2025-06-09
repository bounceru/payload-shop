import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

/**
 * POST /api/createCustomer
 * Create a new "customer" in Payload's "customers" collection.
 */
export async function POST(req: NextRequest) {
    try {
        // 1) Parse the incoming JSON body
        const body = await req.json();
        // e.g. { firstname, lastname, email, password, tenant, shops: ["..."] }

        // 2) Get a local Payload instance (so we can call create, login, etc.)
        const payload = await getPayload({ config });

        // 3) Create the customer doc
        //    - This automatically hashes the password if your collection has auth=true
        const customerDoc = await payload.create({
            collection: 'customers',
            data: {
                ...body,
            },
            // If you need to pass a `req` object for access control, do so:
            // req: { ... } as any, 
        });

        // 4) Optionally, log them in right away to retrieve a JWT token
        //    If you want to return a token so they’re “logged in” on the first request:
        let token: string | undefined;
        try {
            const loginResult = await payload.login({
                collection: 'customers',
                data: {
                    email: body.email,
                    password: body.password,
                },
            });
            token = loginResult.token;
        } catch (err: any) {
            // If login fails (e.g. if password is invalid),
            // you can ignore or throw an error. 
            // Typically it shouldn't fail if we just created them.
            console.error('[createCustomer] login error:', err?.message);
        }

        // 5) Respond with the doc + token
        return NextResponse.json({
            user: customerDoc,
            token,
        }, { status: 200 });

    } catch (err: any) {
        console.error('[createCustomer] error =>', err);
        return NextResponse.json(
            { error: err.message || 'Error creating customer' },
            { status: 500 },
        );
    }
}
