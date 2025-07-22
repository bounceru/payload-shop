import type { FieldHook } from 'payload'

export const ensureUniqueName: FieldHook = async ({ data, req, value }) => {
  console.log('Running ensureUniqueName Hook')
  console.log('Current Value:', value)
  console.log('Data:', data)

  const tenantID =
    typeof data?.tenant === 'object' ? data.tenant.id : data?.tenant

  if (!tenantID) {
    console.error('Tenant is undefined')
    throw new Error('Tenant is required for creating a shop')
  }

  const existingShop = await req.payload.find({
    collection: 'shops',
    where: {
      name: {
        equals: value,
      },
      tenant: {
        equals: tenantID,
      },
    },
  })

  if (existingShop.totalDocs > 0) {
    throw new Error(`A shop with the name "${value}" already exists for this tenant.`)
  }

  return value
}

