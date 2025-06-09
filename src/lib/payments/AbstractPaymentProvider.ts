export interface PaymentCreateResult {
    redirectUrl?: string;
    providerOrderId?: string;
    status: string;
    eventsToken?: string;
    eventsStreamUrl?: string;
}

export interface PaymentStatusResult {
    status: string;
    providerOrderId?: string;
    rawResponse?: any;
}

export abstract class AbstractPaymentProvider {
    constructor(
        protected apiKey: string,
        protected settings: Record<string, any> = {},
    ) {}

    public abstract createPayment(localOrderDoc: any): Promise<PaymentCreateResult>;

    public abstract getPaymentStatus(providerOrderId: string): Promise<PaymentStatusResult>;
}
