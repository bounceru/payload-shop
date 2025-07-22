'use client'
import React, { useCallback } from 'react'
import { useField } from '@payloadcms/ui'

const GenerateGeo: React.FC = () => {
  // 1) Hook into the "address" field so we can read its current value
  const addressField = useField<string>({ path: 'address' })

  // 2) Hook into "location.lat" and "location.lng"
  const latField = useField<number>({ path: 'location.lat' })
  const lngField = useField<number>({ path: 'location.lng' })

  // Then in a button click:
  const handleGenerate = useCallback(async () => {
    const addressValue = addressField.value
    if (!addressValue) {
      alert('Please enter an address first.')
      return
    }

    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey) throw new Error('Missing Google Maps key')

      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        addressValue,
      )}&key=${apiKey}`
      const res = await fetch(url)
      const data = await res.json()

      if (data.status !== 'OK') throw new Error(data.error_message || 'Geocoding failed')

      const result = data.results[0]
      const lat = result?.geometry?.location?.lat
      const lng = result?.geometry?.location?.lng
      if (typeof lat !== 'number' || typeof lng !== 'number') throw new Error('No lat/lng found.')

      latField.setValue(lat)
      lngField.setValue(lng)
    } catch (err: any) {
      alert(err.message || 'Failed to geocode address.')
    }
  }, [addressField.value, latField, lngField])

  return (
    <div style={{ marginTop: '1rem' }}>
      <button type="button" onClick={handleGenerate}>
        Generate Lat/Lng
      </button>
    </div>
  )
}


export default GenerateGeo