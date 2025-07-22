import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const payload = await getPayload({ config })
  const url = new URL(req.url)
  const searchParams = url.searchParams

  const tenantId = searchParams.get('tenantId')
  const where: any = {}

  if (tenantId) {
    where.tenant = { equals: tenantId }
  }

  const limitStr = searchParams.get('limit')
  const limit = limitStr ? parseInt(limitStr, 10) : 50

  const result = await payload.find({
    collection: 'addons',
    where,
    limit,
    sort: '-createdAt',
  })

  return NextResponse.json(result)
}

async function handleRequest(
  method: 'PATCH' | 'POST' | 'DELETE',
  req: NextRequest,
): Promise<NextResponse> {
  const contentType = req.headers.get('Content-Type')
  const cookie = req.headers.get('cookie') || ''

  let id: string | undefined
  let body: any

  if (method === 'DELETE') {
    const url = new URL(req.url)
    id = url.searchParams.get('id') || undefined

    if (!id) {
      return new NextResponse('Missing addon ID', { status: 400 })
    }
  } else {
    if (contentType?.includes('application/json')) {
      body = await req.json()
      id = body?.id
    } else {
      body = await req.text()
      try {
        const parsed = JSON.parse(body)
        id = parsed?.id
      } catch {
        return new NextResponse('Invalid JSON body', { status: 400 })
      }
    }

    if (method === 'PATCH' && !id) {
      return new NextResponse('Missing addon ID', { status: 400 })
    }
  }

  const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const payloadUrl =
    method === 'PATCH'
      ? `${baseUrl}/api/addons/${id}`
      : method === 'DELETE'
        ? `${baseUrl}/api/addons/${id}`
        : `${baseUrl}/api/addons`

  const response = await fetch(payloadUrl, {
    method,
    headers: {
      'Content-Type': contentType || 'application/json',
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

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  return handleRequest('PATCH', req)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return handleRequest('POST', req)
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  return handleRequest('DELETE', req)
}
