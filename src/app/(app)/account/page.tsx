import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getPayload } from 'payload';
import config from '@payload-config';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
    const cookieStore = cookies();
    const token = cookieStore.get('payload-token')?.value;
    if (!token) redirect('/customer-login');

    const payloadConfig = await config;
    let decoded: any;
    try {
        decoded = jwt.verify(token, payloadConfig.secret);
    } catch {
        redirect('/customer-login');
    }
    if (decoded?.collection !== 'customers') redirect('/customer-login');

    const payload = await getPayload({ config: payloadConfig });
    const customer = await payload.findByID({ collection: 'customers', id: decoded.id, depth: 2 });
    const orders = await payload.find({
        collection: 'orders',
        where: { customer: { equals: decoded.id } },
        depth: 2,
    });

    return (
        <main className="max-w-3xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold">Welcome, {customer.firstname}</h1>
            <div>
                <h2 className="text-xl font-semibold mb-2">Your Orders</h2>
                <ul className="space-y-4">
                    {orders.docs.map((order: any) => (
                        <li key={order.id} className="border p-4 rounded">
                            <div>Order #{order.orderNr}</div>
                            <div>Total: €{order.total}</div>
                            <div>{order.tickets?.length || 0} tickets</div>
                        </li>
                    ))}
                </ul>
            </div>
        </main>
    );
}
