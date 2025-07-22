// File: /app/api/getCurrentCustomer/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import jwt from 'jsonwebtoken'

export async function GET(req: NextRequest) {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'No Authorization header' }, { status: 401 })
    }

    const [scheme, token] = authHeader.split(' ')
    if (scheme !== 'JWT' && scheme !== 'Bearer') {
      return NextResponse.json({ error: 'Unsupported auth scheme' }, { status: 401 })
    }

    // Manually verify with the same secret
    const userData = jwt.verify(token, payloadConfig.secret) as jwt.JwtPayload

    // Make sure it's the "customers" collection
    if (!userData?.id || userData.collection !== 'customers') {
      return NextResponse.json({ error: 'Not logged in as customer' }, { status: 401 })
    }

    // Mock req for doc-level access
    const mockReq = {
      user: {
        id: userData.id,
        collection: 'customers',
      },
      payloadAPI: 'local',
    }

    // Now fetch the doc
    const doc = await payload.findByID({
      collection: 'customers',
      id: userData.id,
      req: mockReq as any,
      depth: 3,
    })

    if (!doc) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json(doc)
  } catch (err: any) {
    console.error('Error in /api/getCurrentCustomer =>', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
