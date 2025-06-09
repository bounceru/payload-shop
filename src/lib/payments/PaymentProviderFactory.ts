import { MollieProvider } from './MollieProvider'
import { AbstractPaymentProvider } from './AbstractPaymentProvider'

interface MollieSettings {
    enable_test_mode?: boolean
    live_api_key?: string
    test_api_key?: string
    webhook_secret?: string
}

interface PaymentMethodDoc {
    provider: string
    mollie_settings?: MollieSettings
}

export function getPaymentProviderFromMethodDoc(methodDoc: PaymentMethodDoc): AbstractPaymentProvider {
    const { provider } = methodDoc
    if (provider === 'mollie') {
        const settings = methodDoc.mollie_settings || {}
        const apiKey = settings.enable_test_mode ? settings.test_api_key || '' : settings.live_api_key || ''
        if (!apiKey) throw new Error('Mollie API key not configured')
        return new MollieProvider(apiKey, settings)
    }
    throw new Error(`Unsupported payment provider: ${provider}`)
}
