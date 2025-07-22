import React from 'react'
import SeatMapFields from '@/fields/custom-field/seat-map-fields'

const SeatMapEditor = async ({ payload, doc }: { payload: any, doc: any }) => {
  console.log('payload', payload)
  console.log('doc', doc)
  return (
    <SeatMapFields
      doc={doc}
    />
  )
}
export default SeatMapEditor
