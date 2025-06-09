// src/app/(app)/bedankt/page.tsx
import { getPayload } from 'payload';
import config from '@payload-config';
import ThankYouClient from './ThankYouClient';
import type { Metadata } from 'next';
import { fetchShopContext } from '@/lib/fetchShopContext';
import NavBar from '@/app/(app)/components/NavBar';
import Footer from '@/app/(app)/components/Footer';

export const dynamic = 'force-dynamic';

export default async function ThankYouPage({
    searchParams,
}: {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {

    const resolvedSearchParams = await searchParams;
    const orderId = resolvedSearchParams?.orderId;
    if (typeof orderId !== 'string') {
        return <div className="text-center text-red-600 py-12">❌ Ongeldige bestelling.</div>;
    }

    const payload = await getPayload({ config });

    const order = await payload.findByID({
        collection: 'orders',
        id: orderId,
        depth: 2,
    });

    if (!order || !order.event) {
        return <div className="text-center text-red-600 py-12">❌ Order not found.</div>;
    }

    const ticketsRes = await payload.find({
        collection: 'tickets',
        where: { order: { equals: orderId } },
    });

    const tickets = ticketsRes.docs;
    const addonSelections = order.addonSelections || [];
    const uniqueAddonIds = Array.from(new Set(addonSelections.map((a) => a.addonId)));

    const addonDocs = await Promise.all(
        uniqueAddonIds.map((id) => payload.findByID({ collection: 'addons', id }))
    );

    const addonMap = Object.fromEntries(addonDocs.map((addon) => [addon.id, addon]));

    const eventType = typeof order.event === 'string' ? undefined : order.event?.type;
    const { isShop, shop, branding } = await fetchShopContext({ category: eventType ?? undefined });

    const logoUrl =
        typeof branding?.siteLogo === 'object' && branding.siteLogo?.s3_url
            ? branding.siteLogo.s3_url
            : '/static/stagepass-logo.png';

    const headerBgColor = branding?.headerBackgroundColor || '#ED6D38';
    const headerTextColor = branding?.headerTextColor || '#ffffff';

    return (
        <>
            <NavBar
                isShop={isShop}
                logoUrl={logoUrl}
                ctaColor={headerBgColor}

                shopName={isShop ? shop?.name : undefined}
            />
            <ThankYouClient
                order={{
                    ...order,
                    tickets,
                    addonSelections,
                    addonMap,
                }}
                shop={isShop ? shop : undefined}
                branding={branding}
            />
            <Footer
                branding={{
                    ...branding,
                    siteLogo:
                        typeof branding?.siteLogo === 'object'
                            ? branding.siteLogo?.s3_url ?? undefined
                            : branding?.siteLogo,
                    primaryColorCTA: branding?.primaryColorCTA ?? undefined,
                    headerBackgroundColor: branding?.headerBackgroundColor ?? undefined,
                }}
                isShop={isShop}
                shop={shop}
            />
        </>
    );
}



export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Bedankt voor je bestelling',
    };
}

