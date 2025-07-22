import { NextRequest, NextResponse } from 'next/server'

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
      return new NextResponse('Missing customer ID', { status: 400 })
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
      return new NextResponse('Missing customer ID', { status: 400 })
    }
  }

  const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const payloadUrl =
    method === 'PATCH'
      ? `${baseUrl}/api/customers/${id}`
      : method === 'DELETE'
        ? `${baseUrl}/api/customers/${id}`
        : `${baseUrl}/api/customers`

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
