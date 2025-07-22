import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

const ORGANISATION_ROLE_ID = '682ddd22a2dd5e0a6ee2dd2c'
const SUPERADMIN_IDS = ['682b142248d04cb6f24321d1', '68174ac39927a8b3b6f599bc']

export async function POST(req: NextRequest) {
  try {
    const { tenantName, email, password } = await req.json()

    if (!tenantName || !email || !password) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // 1) Create tenant
    const tenant = await payload.create({
      collection: 'tenants',
      data: {
        name: tenantName,
        slug: tenantName.toLowerCase().replace(/\s+/g, '-'),
      },
    })

    // 2) Create user with organisation role and tenant admin
    const user = await payload.create({
      collection: 'users',
      data: {
        email,
        password,
        roles: [ORGANISATION_ROLE_ID],
        tenants: [
          {
            tenant: tenant.id,
            roles: ['tenant-admin'],
          },
        ],
      },
    })

    // 3) Add tenant to predefined superadmin users
    for (const adminId of SUPERADMIN_IDS) {
      try {
        const admin = await payload.findByID({ collection: 'users', id: adminId })
        if (!admin) continue

        const currentTenants = Array.isArray(admin.tenants) ? [...admin.tenants] : []
        const exists = currentTenants.some((t: any) => {
          const tenantId = typeof t.tenant === 'object' ? t.tenant.id : t.tenant
          return tenantId === tenant.id
        })

        if (!exists) {
          currentTenants.push({ tenant: tenant.id, roles: ['tenant-admin', 'tenant-viewer'] })
          await payload.update({
            collection: 'users',
            id: adminId,
            data: { tenants: currentTenants },
          })
        }
      } catch (err) {
        console.error(`[registerTenant] Failed to update superadmin ${adminId}:`, err)
      }
    }

    return NextResponse.json({ tenant, user }, { status: 200 })
  } catch (err: any) {
    console.error('[registerTenant] error =>', err)
    return NextResponse.json(
      { message: err.message || 'Error registering tenant' },
      { status: 500 },
    )
  }
}
