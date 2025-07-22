import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getPaymentProviderFromMethodDoc } from '@/lib/payments/PaymentProviderFactory'

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json()
    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const order = await payload.findByID({
      collection: 'orders',
      id: orderId,
      depth: 0,
      overrideAccess: true,
    })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    if (!order.paymentMethod) {
      return NextResponse.json({ error: 'Order missing payment method' }, { status: 400 })
    }

    const paymentMethodId = typeof order.paymentMethod === 'string' ? order.paymentMethod : order.paymentMethod?.id
    const pm = await payload.findByID({
      collection: 'payment-methods',
      id: paymentMethodId,
      overrideAccess: true,
    })
    const provider = getPaymentProviderFromMethodDoc(pm as any)

    const result = await provider.createPayment(order)

    await payload.update({
      collection: 'orders',
      id: orderId,
      data: { paymentReference: result.providerOrderId },
      overrideAccess: true,
    })

    return NextResponse.json({ redirectUrl: result.redirectUrl, providerOrderId: result.providerOrderId })
  } catch (err: any) {
    console.error('createPayment error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
