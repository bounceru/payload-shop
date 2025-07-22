// File: /src/components/ui/ManageBillingButton.tsx
'use client'

import React, { useState } from 'react'

interface ManageBillingButtonProps {
  tenantId: string
}

export function ManageBillingButton({ tenantId }: ManageBillingButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleManageBilling() {
    try {
      setIsLoading(true)
      const res = await fetch('/api/manage-billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      })
      if (!res.ok) {
        const msg = await res.json()
        throw new Error(msg.error || 'Failed to create billing portal session.')
      }
      const data = await res.json()
      // Redirect user to the portal URL
      window.location.href = data.url
    } catch (err: any) {
      console.error('ManageBillingButton Error:', err)
      alert('Cannot open billing portal: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      className="bg-[#39454f] text-white py-2 px-4 rounded-xl font-bold"
      onClick={handleManageBilling}
      disabled={isLoading}
    >
      {isLoading ? 'Loading...' : 'Instellingen facturatie'}
    </button>
  )
}
