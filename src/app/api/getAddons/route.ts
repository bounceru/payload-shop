import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(req: NextRequest) {
  // Extract eventSlug from the query parameters using the correct method
  const eventSlug = req.nextUrl.searchParams.get('eventSlug')

  // Ensure eventSlug exists
  if (!eventSlug) {
    return NextResponse.json({ message: 'eventSlug is required' }, { status: 400 })
  }

  // Fetch the event based on the slug to confirm it's a valid event
  const payload = await getPayload({ config })
  const eventRes = await payload.find({
    collection: 'events',
    where: { slug: { equals: eventSlug } },
    limit: 1,
  })

  const event = eventRes.docs[0]
  if (!event) {
    return NextResponse.json({ message: 'Event not found' }, { status: 404 })
  }

  // Fetch the add-ons linked to the event
  const addonsRes = await payload.find({
    collection: 'addons',
    where: { events: { equals: event.id } },
  })

  const addons = addonsRes.docs

  // Return the list of add-ons
  return NextResponse.json({ addons })
}
