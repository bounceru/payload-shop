// File: src/app/api/modifyEvent/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { cookies } from 'next/headers'

export async function PATCH(req: NextRequest) {
  const payload = await getPayload({ config })
  const tenantId = (await cookies()).get('payload-tenant')?.value

  const { id, updates }: { id?: string; updates?: Record<string, any> } = await req.json()
  if (!id || !updates || typeof updates !== 'object') {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
  }

  try {
    // 1. Find the event
    const existing = await payload.findByID({
      collection: 'events',
      id,
    })

    if (!existing) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 })
    }

    // 2. Check tenant match
    if (tenantId && existing.tenant !== tenantId) {
      return NextResponse.json({ message: 'Not allowed' }, { status: 403 })
    }

    // 3. Update the event
    const updated = await payload.update({
      collection: 'events',
      id,
      data: updates,
    })

    return NextResponse.json({ success: true, updated })
  } catch (err: any) {
    console.error('[modifyEvent]', err)
    return NextResponse.json({ message: err.message || 'Error updating event' }, { status: 500 })
  }
}
