// src/app/(app)/test/page.tsx

import configPromise from '@payload-config';
import { getPayload } from 'payload';

export default async function TestPage({ params, searchParams }: { params: any; searchParams: any }) {
    const payload = await getPayload({
        config: configPromise,
    });

    return <div>test {payload?.config?.collections?.length}</div>;
}
