import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getPaymentProviderFromMethodDoc } from '@/lib/payments/PaymentProviderFactory'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

    const providerId = body.id
    const metadata = body.metadata || {}
    const payloadId = metadata.payloadId

    const payloadClient = await getPayload({ config })
    const order = payloadId
      ? await payloadClient.findByID({
        collection: 'orders',
        id: String(payloadId),
        overrideAccess: true,
      })
      : null
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    if (!order.paymentMethod) {
      return NextResponse.json({ error: 'Order missing payment method' }, { status: 400 })
    }
    const pm = await payloadClient.findByID({
      collection: 'payment-methods',
      id: order.paymentMethod,
      overrideAccess: true,
    })
    const provider = getPaymentProviderFromMethodDoc(pm as any)
    const statusRes = await provider.getPaymentStatus(providerId)

    if (statusRes.status === 'paid' && order.status !== 'paid') {
      await payloadClient.update({
        collection: 'orders',
        id: order.id,
        data: { status: 'paid', paymentReference: providerId },
        overrideAccess: true,
      })
    }

    return NextResponse.json({ message: 'OK' })
  } catch (err: any) {
    console.error('mollieWebhook error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
