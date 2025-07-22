import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'
import jwt from 'jsonwebtoken'

export async function POST(req: NextRequest) {
  const { token } = await req.json().catch(() => ({}))
  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'Token required' }, { status: 400 })
  }

  const payloadConfig = await config
  let decoded: any
  try {
    decoded = jwt.verify(token, payloadConfig.secret)
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  if (!decoded?.id) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const loginToken = jwt.sign(
    { id: decoded.id, collection: 'customers' },
    payloadConfig.secret,
    { expiresIn: '30d' },
  )

  const res = NextResponse.json({ message: 'Logged in' })
  res.headers.set('Set-Cookie', `payload-token=${loginToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`)
  return res
}
