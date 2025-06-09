import { getPayload } from 'payload';
import config from '@payload-config';
import type { Event } from '@/payload-types';
import { getEventLowestPrice } from '@/utils/getEventLowestPrice';

type FilterParams = {
  category?: string;
  location?: string;
  start?: string;
  end?: string;
  search?: string;
  shopId?: string;
};

export async function fetchFilterContext({
  category,
  location,
  start,
  end,
  search,
  shopId,
}: FilterParams): Promise<Event[]> {
  const payload = await getPayload({ config });

  const parseListOrString = (val?: string) => {
    if (!val) return undefined;
    const parts = val.split(',').map((v) => v.trim()).filter(Boolean);
    return parts.length > 1 ? { in: parts } : { equals: parts[0] };
  };

  const where: any = { and: [] as any[] };

  where.and.push({ isPublished: { equals: true } });

  if (category) {
    where.and.push({ type: parseListOrString(category) });
  }

  if (location) {
    where.and.push({ location: parseListOrString(location) });
  }

  if (start && end) {
    where.and.push({
      date: {
        greater_than_equal: start,
        less_than_equal: end,
      },
    });
  } else if (start && !end) {
    where.and.push({
      date: {
        greater_than_equal: start,
      },
    });
  } else if (end && !start) {
    where.and.push({
      date: {
        less_than_equal: end,
      },
    });
  }

  if (shopId) {
    where.and.push({ venue: { equals: shopId } });
  }

  if (search) {
    where.and.push({
      or: [
        { title: { like: search } },
        { introText: { like: search } },
        { description: { like: search } },
      ],
    });
  }

  const result = await payload.find({
    collection: 'events',
    where,
    depth: 2, // adjust if you want ticketTypes or seatMap populated
  });

  console.log('FetchFilterContext Result:', result);

  const eventsWithPrice = result.docs.map((event) => ({
    ...event,
    lowestPrice: getEventLowestPrice(event),
  }));

  return eventsWithPrice as any[];
}
