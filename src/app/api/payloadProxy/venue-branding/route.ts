// File: src/app/api/payloadProxy/venue-branding/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

//
// 1) GET (list) => /api/payloadProxy/venue-branding?tenantId=...&limit=...
//    or GET a single doc by e.g. ?id=... if you like
//
export async function GET(req: NextRequest): Promise<NextResponse> {
  const payload = await getPayload({ config })
  const url = new URL(req.url)
  const searchParams = url.searchParams

  // Optionally filter by tenant or shops
  const tenantId = searchParams.get('tenantId')
  const shopsId = searchParams.get('shopsId') // If you want to filter by shops
  const where: any = {}

  if (tenantId) {
    where.tenant = { equals: tenantId }
  }
  if (shopsId) {
    where.shops = { equals: shopsId }
  }

  const limitStr = searchParams.get('limit')
  const limit = limitStr ? parseInt(limitStr, 10) : 50

  // Actually do the find
  const result = await payload.find({
    collection: 'venue-branding',
    where,
    limit,
    sort: '-createdAt',
  })

  return NextResponse.json(result)
}

//
// 2) POST => create a new doc
//    Body includes fields like tenant, shops, etc.
//
export async function POST(req: NextRequest): Promise<NextResponse> {
  const contentType = req.headers.get('Content-Type') || 'application/json'
  const cookie = req.headers.get('cookie') || ''

  let body: any
  if (contentType.includes('application/json')) {
    body = await req.json()
  } else {
    const textBody = await req.text()
    try {
      body = JSON.parse(textBody)
    } catch (err) {
      return new NextResponse('Invalid JSON body', { status: 400 })
    }
  }

  // Forward the data to Payload’s POST /api/venue-branding
  const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const payloadUrl = `${baseUrl}/api/venue-branding`

  const response = await fetch(payloadUrl, {
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
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
    },
  })
}

//
// 3) PATCH => update an existing doc
//    Expect "id" in JSON body
//
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const contentType = req.headers.get('Content-Type') || 'application/json'
  const cookie = req.headers.get('cookie') || ''

  let body: any
  if (contentType.includes('application/json')) {
    body = await req.json()
  } else {
    const textBody = await req.text()
    try {
      body = JSON.parse(textBody)
    } catch (err) {
      return new NextResponse('Invalid JSON body', { status: 400 })
    }
  }

  const id = body?.id
  if (!id) {
    return new NextResponse('Missing branding ID', { status: 400 })
  }

  // Forward to Payload’s PATCH /api/venue-branding/:id
  const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const payloadUrl = `${baseUrl}/api/venue-branding/${id}`

  const response = await fetch(payloadUrl, {
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
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
    },
  })
}

//
// 4) DELETE => pass the doc ID either via query (?id=...) or in JSON body
//
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const contentType = req.headers.get('Content-Type') || 'application/json'
  const cookie = req.headers.get('cookie') || ''

  const { searchParams } = new URL(req.url)
  let id = searchParams.get('id')

  let body: any
  if (!id) {
    // If not in query, check the body
    if (contentType.includes('application/json')) {
      body = await req.json()
      id = body?.id
    } else {
      const textBody = await req.text()
      try {
        body = JSON.parse(textBody)
        id = body?.id
      } catch (err) {
        return new NextResponse('Invalid JSON body', { status: 400 })
      }
    }
  }

  if (!id) {
    return new NextResponse('Missing branding ID', { status: 400 })
  }

  // Forward DELETE to Payload => /api/venue-branding/:id
  const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const payloadUrl = `${baseUrl}/api/venue-branding/${id}`

  const response = await fetch(payloadUrl, {
    method: 'DELETE',
    headers: {
      'Content-Type': contentType,
      Cookie: cookie,
    },
  })

  const responseBody = await response.text()

  return new NextResponse(responseBody, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
    },
  })
}
