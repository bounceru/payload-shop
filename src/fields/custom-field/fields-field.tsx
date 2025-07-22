import React from 'react'
import FieldsTable from './fields-table'

/**
 * This is the "admin.components.Field" wrapper that
 * Next.js + Payload calls in the admin UI.
 */
const FieldsField = async ({ payload, doc }: { payload: any, doc: any }) => {
  // You can grab all collection slugs and fields from `payload` if you want,
  // or do a fetch to /api/getAllFields right here, or inside <FieldsTable>.
  // For consistency, let's keep it simple and do the fetch inside <FieldsTable>.
  return (
    <FieldsTable doc={doc} />
  )
}

export default FieldsField
