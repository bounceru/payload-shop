// File: src/app/(dashboard)/dashboard/components/auth/OtpForm.tsx
'use client'

import { useState } from 'react'

export default function OtpForm() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.message || 'Invalid code')
      } else {
        setSuccess(true)
      }
    } catch {
      setError('Unexpected error')
    }
  }

  if (success) {
    return <p>Verification successful! Redirecting...</p>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-xl font-bold">Two-Step Verification</h1>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <input
        type="text"
        placeholder="Enter verification code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
        className="w-full border p-2 rounded"
      />
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
        Verify
      </button>
    </form>
  )
}