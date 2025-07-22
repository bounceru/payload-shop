import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const payload = await getPayload({ config })
  const url = new URL(req.url)
  const searchParams = url.searchParams

  // Filter logic
  const limitStr = searchParams.get('limit') || '50'
  const limit = parseInt(limitStr, 10)

  // Possibly filter by isPublic or by tenant
  const isPublicOnly = searchParams.get('publicOnly') === 'true'
  const tenantId = searchParams.get('tenantId') || ''

  const where: any = {}
  if (isPublicOnly) {
    where.isPublic = { equals: true }
  }
  // If you included tenantField in the template collection:
  // if (tenantId) {
  //   where.tenant = { equals: tenantId };
  // }

  const result = await payload.find({
    collection: 'seat-map-templates',
    where,
    limit,
  })

  return NextResponse.json(result)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const payload = await getPayload({ config })
  const cookie = req.headers.get('cookie') || ''
  const contentType = req.headers.get('Content-Type') || 'application/json'

  let body: any
  if (contentType.includes('application/json')) {
    body = await req.json()
  } else {
    const textBody = await req.text()
    try {
      body = JSON.parse(textBody)
    } catch (err) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }
  }

  // Forward to Payload’s POST /api/seat-map-templates
  const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}/api/seat-map-templates`, {
    method: 'POST',
    headers: {
      'Content-Type': contentType,
      Cookie: cookie,
    },
    body: JSON.stringify(body),
  })

  const responseBody = await response.text()
  return new NextResponse(responseBody, {
    status: response.status,
    headers: { 'Content-Type': response.headers.get('Content-Type') || 'application/json' },
  })
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const payload = await getPayload({ config })
  const cookie = req.headers.get('cookie') || ''
  const contentType = req.headers.get('Content-Type') || 'application/json'

  let body: any
  if (contentType.includes('application/json')) {
    body = await req.json()
  } else {
    const textBody = await req.text()
    try {
      body = JSON.parse(textBody)
    } catch (err) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }
  }

  const id = body?.id
  if (!id) {
    return NextResponse.json({ error: 'Missing template ID' }, { status: 400 })
  }

  // Forward to Payload’s PATCH /api/seat-map-templates/:id
  const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}/api/seat-map-templates/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': contentType,
      Cookie: cookie,
    },
    body: JSON.stringify(body),
  })

  const responseBody = await response.text()
  return new NextResponse(responseBody, {
    status: response.status,
    headers: { 'Content-Type': response.headers.get('Content-Type') || 'application/json' },
  })
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const payload = await getPayload({ config })
  const cookie = req.headers.get('cookie') || ''
  const contentType = req.headers.get('Content-Type') || 'application/json'

  const { searchParams } = new URL(req.url)
  let id = searchParams.get('id')

  if (!id) {
    // Check body
    let body: any
    if (contentType.includes('application/json')) {
      body = await req.json()
      id = body?.id
    } else {
      const textBody = await req.text()
      try {
        body = JSON.parse(textBody)
        id = body?.id
      } catch (err) {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
      }
    }
  }

  if (!id) {
    return NextResponse.json({ error: 'No template ID provided' }, { status: 400 })
  }

  // Forward DELETE to /api/seat-map-templates/:id
  const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}/api/seat-map-templates/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': contentType,
      Cookie: cookie,
    },
  })

  const responseBody = await response.text()
  return new NextResponse(responseBody, {
    status: response.status,
    headers: { 'Content-Type': response.headers.get('Content-Type') || 'application/json' },
  })
}
