import React from 'react'
import { headers } from 'next/headers'
import { MollieCheckClient } from './MollieCheckClient'

export const dynamic = 'force-dynamic'

export default async function MollieCheckPage({
                                                searchParams,
                                              }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams

  const orderId = Array.isArray(params.orderId) ? params.orderId[0] : params.orderId ?? ''
  const kiosk = Array.isArray(params.kiosk) ? params.kiosk[0] : params.kiosk ?? 'false'
  const shopOrdNr = Array.isArray(params.shopOrdNr) ? params.shopOrdNr[0] : params.shopOrdNr ?? ''

  const requestHeaders = await headers()
  const fullHost = requestHeaders.get('host') || ''
  const hostSlug = fullHost.split('.')[0] || 'defaultShop'

  let ordNr = shopOrdNr
  if (!ordNr && orderId) {
    try {
      const res = await fetch(
        `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/orderData?host=${hostSlug}&orderId=${encodeURIComponent(orderId)}`,
        { cache: 'no-store' },
      )
      if (res.ok) {
        const data = await res.json()
        ordNr = typeof data?.shopOrdNr === 'string' ? data.shopOrdNr : ''
      }
    } catch {
      // ignore
    }
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-white text-gray-800">
      <MollieCheckClient orderId={orderId} shopOrdNr={ordNr} kioskMode={kiosk === 'true'} hostSlug={hostSlug} />
    </main>
  )
}

