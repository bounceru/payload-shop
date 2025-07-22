import { AbstractPaymentProvider, type PaymentCreateResult, type PaymentStatusResult } from './AbstractPaymentProvider'

interface MollieSettings {
  enable_test_mode?: boolean
  live_api_key?: string
  test_api_key?: string
  webhook_secret?: string
}

export class MollieProvider extends AbstractPaymentProvider {
  private apiBase = 'https://api.mollie.com/v2/'

  constructor(apiKey: string, settings: MollieSettings = {}) {
    super(apiKey, settings)
  }

  public async createPayment(localOrderDoc: any): Promise<PaymentCreateResult> {
    const amount = (localOrderDoc.total ?? 0).toFixed(2)

    const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/mollie-check?orderId=${localOrderDoc.id}`
    const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/mollieWebhook`

    const body: Record<string, any> = {
      amount: { currency: 'EUR', value: amount },
      description: `Order #${localOrderDoc.orderNr}`,
      redirectUrl,
      webhookUrl,
      metadata: {
        orderId: localOrderDoc.orderNr,
        payloadId: String(localOrderDoc.id),
      },
    }

    const apiKey = this.resolveApiKey()
    const response = await fetch(`${this.apiBase}payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })

    const json = await response.json()
    if (!response.ok) {
      throw new Error(`Mollie createPayment failed: ${JSON.stringify(json)}`)
    }

    return {
      redirectUrl: json?._links?.checkout?.href,
      providerOrderId: json?.id,
      status: json?.status || 'created',
    }
  }

  public async getPaymentStatus(providerOrderId: string): Promise<PaymentStatusResult> {
    const apiKey = this.resolveApiKey()
    const response = await fetch(`${this.apiBase}payments/${encodeURIComponent(providerOrderId)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    const json = await response.json()
    if (!response.ok) {
      throw new Error(`Mollie getPaymentStatus failed: ${JSON.stringify(json)}`)
    }
    return { status: json?.status, providerOrderId: json?.id, rawResponse: json }
  }

  private resolveApiKey(): string {
    if (this.settings.enable_test_mode) {
      return this.settings.test_api_key || this.apiKey
    }
    return this.settings.live_api_key || this.apiKey
  }
}

export default MollieProvider
