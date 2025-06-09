// src/lib/fetchShopContext.ts
import { getPayload } from 'payload';
import config from '@payload-config';
import type { Shop, VenueBranding, Event as PayloadEvent } from '@/payload-types';
import { getEventLowestPrice } from '@/utils/getEventLowestPrice';
import { headers } from 'next/headers';

type FetchShopContextOptions = {
  category?: string;
};

export async function fetchShopContext({ category }: FetchShopContextOptions) {
  const payload = await getPayload({ config });
  const host = (await headers()).get('host');
  const slug = host?.split('.')[0];

  let isShop = slug !== 'ticketingapp' && slug !== 'localhost';
  let shop: Shop | null = null;
  let branding: VenueBranding | null = null;
  let events: PayloadEvent[] = [];

  if (isShop && slug) {
    const shopRes = await payload.find({
      collection: 'shops',
      where: { slug: { equals: slug } },
      limit: 1,
    });

    shop = shopRes.docs[0] || null;

    if (!shop) {
      // ⛔ No matching shop found, so this isn't a real shop
      isShop = false;
    }
  }

  if (isShop && shop) {
    // ✅ Fetch branding
    const brandingRes = await payload.find({
      collection: 'venue-branding',
      where: {
        shops: {
          equals: shop.id,
        },
      },
      depth: 1,
      limit: 1,
    });

    branding = brandingRes.docs[0] || null;

    // ✅ Shop-specific event query
    const eventQuery: any = {
      isPublished: { equals: true },
      venue: { equals: shop.id },
    };

    if (category) {
      eventQuery.type = { equals: category };
    }

    const eventRes = await payload.find({
      collection: 'events',
      where: eventQuery,
      depth: 2,
      limit: 100,
    });

    events = eventRes.docs.map((event) => ({
      ...event,
      lowestPrice: getEventLowestPrice(event),
    }));
  } else {
    // 🌍 Fallback to global events
    const where: any = { isPublished: { equals: true } };
    if (category) where.type = { equals: category };

    const eventRes = await payload.find({
      collection: 'events',
      where,
      depth: 2,
      limit: 100,
    });

    events = eventRes.docs.map((event) => ({
      ...event,
      lowestPrice: getEventLowestPrice(event),
    }));
  }

  const safe = <T>(doc: T | null): T | null => doc ? JSON.parse(JSON.stringify(doc)) : null;

  return {
    isShop,
    events,
    shop: safe(shop),
    branding: safe(branding),
  };
}
