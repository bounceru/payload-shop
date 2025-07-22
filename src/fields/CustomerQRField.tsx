'use client'

import React, { useCallback } from 'react'
import { useField } from '@payloadcms/ui'
import { QRCodeCanvas } from 'qrcode.react'

const CustomerQRField: React.FC = () => {
  // Hook into the "barcode" field to read and set its value
  const { value: barcodeVal, setValue: setBarcodeVal } = useField<string>({
    path: 'barcode',
  })

  // Handler to generate a new barcode
  const handleRegenerateCode = useCallback(() => {
    const randomCode = `CUST-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
    setBarcodeVal(randomCode)
  }, [setBarcodeVal])

  // Render the UI
  if (!barcodeVal) {
    return (
      <div>
        No barcode yet.
        <button type="button" onClick={handleRegenerateCode}>
          Generate One
        </button>
      </div>
    )
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <QRCodeCanvas value={barcodeVal} size={128} />
      <p>{barcodeVal}</p>

    </div>
  )
}

export default CustomerQRField
