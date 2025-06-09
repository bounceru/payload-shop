import { NextRequest, NextResponse } from 'next/server'
import { checkPaymentStatus } from '@/lib/payments/checkPaymentStatus'

export async function GET(req: NextRequest) {
    try {
        const orderId = req.nextUrl.searchParams.get('orderId')
        if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 })

        const { order, providerResult } = await checkPaymentStatus(orderId)

        return NextResponse.json({ orderId, providerStatus: providerResult.status, localStatus: order.status })
    } catch (err: any) {
        console.error('getPaymentStatus error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
