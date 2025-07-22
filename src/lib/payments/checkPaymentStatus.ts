import { getPayload } from 'payload'
import config from '@payload-config'
import { getPaymentProviderFromMethodDoc } from './PaymentProviderFactory'

export async function checkPaymentStatus(orderId: string) {
  const payload = await getPayload({ config })
  const order = await payload.findByID({
    collection: 'orders',
    id: orderId,
    overrideAccess: true,
  })
  if (!order) throw new Error(`No order found with id=${orderId}`)

  const providerOrderId = order.paymentReference || ''

  if (!order.paymentMethod) {
    throw new Error('Order missing payment method')
  }
  const pm = await payload.findByID({
    collection: 'payment-methods',
    id: order.paymentMethod,
    overrideAccess: true,
  })
  const provider = getPaymentProviderFromMethodDoc(pm as any)
  const result = await provider.getPaymentStatus(providerOrderId)

  return { order, providerResult: result }
}
