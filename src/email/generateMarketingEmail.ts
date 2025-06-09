// File: /src/email/generateMarketingEmail.ts
import { generateEmailHTML } from './generateEmailHTML'

interface MarketingEmailParams {
    headline?: string
    message: string
    ctaLabel?: string
    ctaUrl?: string
}

export const generateMarketingEmail = async (params: MarketingEmailParams): Promise<string> => {
    const { headline = 'Stay In The Loop!', message, ctaLabel, ctaUrl } = params
    return generateEmailHTML({
        headline,
        content: `<p>${message}</p>`,
        cta: ctaLabel && ctaUrl ? { buttonLabel: ctaLabel, url: ctaUrl } : undefined,
    })
}
