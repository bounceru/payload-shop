import { getPayload } from 'payload';
import config from '@payload-config';
import { notFound } from 'next/navigation';
import EventDetail from './components/EventDetail';

export const dynamic = 'force-dynamic';

export default async function EventPage({
  params: promiseParams,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await promiseParams;

  if (!slug) {
    console.error('❌ Missing slug param');
    return notFound();
  }

  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: 'events',
    where: {
      slug: { equals: slug },
      isPublished: { equals: true },
    },
    depth: 2,
    limit: 1,
  });

  const event = result.docs?.[0];

  if (!event) {
    console.warn(`⚠️ No event found for slug: ${slug}`);
    return notFound();
  }

  return <EventDetail event={event} />;
}
