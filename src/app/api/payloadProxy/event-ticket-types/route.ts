// File: src/app/api/payloadProxy/event-ticket-types/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * GET /api/payloadProxy/event-ticket-types?tenantId=xxxx&shopId=yyyy
 *
 * This route fetches event-ticket-type docs from Payload, optionally filtered
 * by tenant and/or shop. Then returns { docs: [...], totalDocs, ... } JSON.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const payload = await getPayload({ config }) // server side instance
  const url = new URL(req.url)
  const searchParams = url.searchParams

  // 1) Check for tenantId and shopId from the query
  const tenantId = searchParams.get('tenantId')
  const shopId = searchParams.get('shopId')
  const seatMapId = searchParams.get('seatMapId')

  // 2) Build a "where" filter object for Payload
  //    If your ticket-types have fields named "tenant" or "shop" with relationships,
  //    adjust accordingly. Here we assume "tenant" is a direct relationship and "shop" is a direct relationship
  const where: any = {}

  if (tenantId) {
    // e.g. { tenant: { equals: tenantId } }
    where.tenant = { equals: tenantId }
  }

  if (shopId) {
    // if your eventTicketType docs have a `shop` or `venue` field, then:
    where.shop = { equals: shopId }
  }

  if (seatMapId) {
    where.seatMap = { equals: seatMapId }
  }

  // 3) Use searchParams.get("limit") or set a default
  //    parseInt(...) fallback
  const limitStr = searchParams.get('limit')
  const limit = limitStr ? parseInt(limitStr, 10) : 50

  // 4) Call Payload's find() on "event-ticket-types"
  //    Adjust if your collection slug is different
  const result = await payload.find({
    collection: 'event-ticket-types',
    where,
    limit,
    sort: '-createdAt',
  })

  // 5) Return the result as JSON
  return NextResponse.json(result)
}

async function handleRequest(
  method: 'PATCH' | 'POST' | 'DELETE',
  req: NextRequest,
): Promise<NextResponse> {
  const contentType = req.headers.get('Content-Type') || 'application/json'
  const cookie = req.headers.get('cookie') || ''

  let id: string | undefined
  let body: any

  if (method === 'DELETE') {
    const url = new URL(req.url)
    id = url.searchParams.get('id') || undefined
    if (!id) {
      return new NextResponse('Missing ticket type ID', { status: 400 })
    }
  } else {
    if (contentType.includes('application/json')) {
      body = await req.json()
      id = body?.id
    } else {
      const textBody = await req.text()
      try {
        body = JSON.parse(textBody)
        id = body?.id
      } catch {
        return new NextResponse('Invalid JSON body', { status: 400 })
      }
    }

    if (method === 'PATCH' && !id) {
      return new NextResponse('Missing ticket type ID', { status: 400 })
    }
  }

  const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const payloadUrl =
    method === 'PATCH'
      ? `${baseUrl}/api/event-ticket-types/${id}`
      : method === 'DELETE'
        ? `${baseUrl}/api/event-ticket-types/${id}`
        : `${baseUrl}/api/event-ticket-types`

  const response = await fetch(payloadUrl, {
    method,
    headers: {
      'Content-Type': contentType,
      Cookie: cookie,
    },
    body: method === 'DELETE' ? undefined : JSON.stringify(body),
  })

  const responseBody = await response.text()

  return new NextResponse(responseBody, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
    },
  })
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return handleRequest('POST', req)
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  return handleRequest('PATCH', req)
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  return handleRequest('DELETE', req)
}
