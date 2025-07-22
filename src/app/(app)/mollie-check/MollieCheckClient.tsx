'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  orderId: string;
  shopOrdNr: string;
  kioskMode: boolean;
  hostSlug: string;
}

export function MollieCheckClient({ orderId, shopOrdNr, kioskMode, hostSlug }: Props) {
  const router = useRouter()

  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!orderId) return
    let seconds = 0
    const interval = setInterval(async () => {
      seconds += 1
      setProgress((seconds / 10) * 100)
      try {
        const res = await fetch(`/api/getPaymentStatus?orderId=${orderId}`)
        if (res.ok) {
          const data = await res.json()
          const provider = (data.providerStatus || '').toLowerCase()
          if (['paid', 'authorized', 'completed'].includes(provider)) {
            router.replace(`/bedankt?orderId=${orderId}`)
            return
          }
          if (['canceled', 'cancelled', 'expired', 'failed'].includes(provider)) {
            router.replace(`/afrekenen?orderId=${shopOrdNr}&cancelled=true`)
            return
          }
        }
      } catch {
        // ignore
      }
      if (seconds >= 10) {
        router.replace(`/afrekenen?orderId=${shopOrdNr}&cancelled=true`)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [orderId, router, kioskMode, shopOrdNr])

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-lg font-medium text-center px-4">
        Betaling aan het controleren... niet sluiten aub!
      </p>
      <div className="w-64 h-2 bg-gray-200 rounded overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

