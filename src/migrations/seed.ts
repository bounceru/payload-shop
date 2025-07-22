import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-mongodb'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  // 1) Create a Super Admin role if it doesn't exist
  const existingRole = await payload.find({
    collection: 'roles',
    where: { name: { equals: 'Super Admin' } },
  })

  let superAdminRole
  if (existingRole.docs.length > 0) {
    superAdminRole = existingRole.docs[0]
    console.log('ℹ️ Super Admin role already exists.')
  } else {
    superAdminRole = await payload.create({
      collection: 'roles',
      data: {
        name: 'Super Admin',
        collections: [
          { collectionName: 'customers', read: true, create: true, update: true, delete: true },
          { collectionName: 'tenants', read: true, create: true, update: true, delete: true },
          { collectionName: 'users', read: true, create: true, update: true, delete: true },
          { collectionName: 'roles', read: true, create: true, update: true, delete: true },
          { collectionName: 'membership-roles', read: true, create: true, update: true, delete: true },
          { collectionName: 'shops', read: true, create: true, update: true, delete: true },
          { collectionName: 'events', read: true, create: true, update: true, delete: true },
          { collectionName: 'event-ticket-types', read: true, create: true, update: true, delete: true },
          { collectionName: 'seatMaps', read: true, create: true, update: true, delete: true },
          { collectionName: 'addons', read: true, create: true, update: true, delete: true },
          { collectionName: 'orders', read: true, create: true, update: true, delete: true },
          { collectionName: 'tickets', read: true, create: true, update: true, delete: true },
          { collectionName: 'checkins', read: true, create: true, update: true, delete: true },
          { collectionName: 'coupons', read: true, create: true, update: true, delete: true },
          { collectionName: 'emails', read: true, create: true, update: true, delete: true },
          { collectionName: 'smtp-settings', read: true, create: true, update: true, delete: true },
          { collectionName: 'email-logs', read: true, create: true, update: true, delete: true },
          { collectionName: 'newsletters', read: true, create: true, update: true, delete: true },
          { collectionName: 'support-articles', read: true, create: true, update: true, delete: true },
          { collectionName: 'analytics', read: true, create: true, update: true, delete: true },
          { collectionName: 'venue-branding', read: true, create: true, update: true, delete: true },
          { collectionName: 'media', read: true, create: true, update: true, delete: true },
          { collectionName: 'pages', read: true, create: true, update: true, delete: true },
          { collectionName: 'payload-locked-documents', read: true, create: true, update: true, delete: true },
          { collectionName: 'payload-preferences', read: true, create: true, update: true, delete: true },
          { collectionName: 'payload-migrations', read: true, create: true, update: true, delete: true },
        ],
        fields: [
          { collectionName: 'roles', fieldName: 'name', read: true, create: true, update: true, delete: true },
          { collectionName: 'roles', fieldName: 'collections', read: true, create: true, update: true, delete: true },
          {
            collectionName: 'roles',
            fieldName: 'collections.collectionName',
            read: true,
            create: true,
            update: true,
            delete: true,
          },
          {
            collectionName: 'roles',
            fieldName: 'collections.read',
            read: true,
            create: true,
            update: true,
            delete: true,
          },
          {
            collectionName: 'roles',
            fieldName: 'collections.create',
            read: true,
            create: true,
            update: true,
            delete: true,
          },
          {
            collectionName: 'roles',
            fieldName: 'collections.update',
            read: true,
            create: true,
            update: true,
            delete: true,
          },
          {
            collectionName: 'roles',
            fieldName: 'collections.delete',
            read: true,
            create: true,
            update: true,
            delete: true,
          },
          { collectionName: 'roles', fieldName: 'fields', read: true, create: true, update: true, delete: true },
          {
            collectionName: 'roles',
            fieldName: 'fields.collectionName',
            read: true,
            create: true,
            update: true,
            delete: true,
          },
          {
            collectionName: 'roles',
            fieldName: 'fields.fieldName',
            read: true,
            create: true,
            update: true,
            delete: true,
          },
          { collectionName: 'roles', fieldName: 'fields.read', read: true, create: true, update: true, delete: true },
          { collectionName: 'roles', fieldName: 'fields.create', read: true, create: true, update: true, delete: true },
          { collectionName: 'roles', fieldName: 'fields.update', read: true, create: true, update: true, delete: true },
          { collectionName: 'roles', fieldName: 'fields.delete', read: true, create: true, update: true, delete: true },
          { collectionName: 'roles', fieldName: 'createdAt', read: true, create: true, update: true, delete: true },
          { collectionName: 'roles', fieldName: 'updatedAt', read: true, create: true, update: true, delete: true },
          { collectionName: 'roles', fieldName: 'id', read: true, create: true, update: true, delete: true },
        ],
      },
    })
  }

  // 3) Create tenants, shops, events, and ticket types if they don't exist
  for (let t = 1; t <= 3; t++) {
    const existingTenant = await payload.find({
      collection: 'tenants',
      where: { slug: { equals: `tenant${t}` } },
    })

    let tenant
    if (existingTenant.docs.length > 0) {
      tenant = existingTenant.docs[0]
      console.log(`ℹ️ Tenant ${t} already exists.`)
    } else {
      tenant = await payload.create({
        collection: 'tenants',
        data: {
          name: `Tenant ${t}`,
          slug: `tenant${t}`,
          domains: [{ domain: `tenant${t}.localhost:3000` }],
        },
      })
    }

    const existingShop = await payload.find({
      collection: 'shops',
      where: { slug: { equals: `shop${t}` } },
    })

    let shop
    if (existingShop.docs.length > 0) {
      shop = existingShop.docs[0]
      console.log(`ℹ️ Shop ${t} already exists.`)
    } else {
      shop = await payload.create({
        collection: 'shops',
        data: {
          name: `Shop ${t}`,
          slug: `shop${t}`,
          tenant: tenant.id,
          domain: `https://shop${t}.ticketingapp.be`,
          company_details: { company_name: `Shop ${t} BV` },
        },
      })
    }

    // Create event ticket types first
    const standardTicketType = { id: 'Standard', name: 'Standard', price: 15, color: '#CCCCCC' }
    const vipTicketType = { id: 'VIP', name: 'VIP', price: 30, color: '#FFD700' }

    // Create seat map after shop creation to link the venue (shop)
    const seatData = Array.from({ length: 5 }, (_, rowIdx) => {
      return Array.from({ length: 10 }, (_, colIdx) => ({
        id: `pinned-${rowIdx + 1}-${colIdx + 1}`,
        pinnedRow: rowIdx + 1,
        pinnedCol: colIdx + 1,
        row: `Row ${rowIdx + 1}`,
        seat: `${colIdx + 1}`,
        locks: [],
        status: 'Seat',
        purpose: 'none',
        groupLabel: '',
        groupReleaseOrder: 0,
        groupMinToReleaseNext: 0,
      }))
    }).flat()

    const seatMap = await payload.create({
      collection: 'seatMaps',
      data: {
        name: `Seat Map for Shop ${t}`,
        venue: shop.id,
        tenant: tenant.id,
        rows: 5,
        columns: 10,
        seats: seatData,
      },
    })

    const seatAssignments: Record<string, string> = {}
    seatData.forEach((s) => {
      seatAssignments[s.id] = s.pinnedRow <= 2 ? vipTicketType.id : standardTicketType.id
    })

    // Create events for each shop
    for (let e = 1; e <= 2; e++) {
      const eventSlug = `event-${e}-shop${t}`
      const existingEvent = await payload.find({
        collection: 'events',
        where: { slug: { equals: eventSlug } },
      })

      let event
      if (existingEvent.docs.length > 0) {
        event = existingEvent.docs[0]
        console.log(`ℹ️ Event ${eventSlug} already exists.`)
      } else {
        event = await payload.create({
          collection: 'events',
          data: {
            title: `Event ${e} - Shop ${t}`,
            slug: eventSlug,
            introText: `This is a short intro for Event ${e}.`,
            description: '',
            date: new Date(Date.now() + (e + t) * 86400000).toISOString(),
            tenant: tenant.id,
            venue: shop.id,
            language: 'nl',
            type: 'concert',
            isPublished: true,
            seatMap: seatMap.id,
            ticketTypes: [standardTicketType, vipTicketType],
            seatAssignments,
          },
        })
      }

    }

    // 2) Create Super Admin user if it doesn't exist
    const existingUser = await payload.find({
      collection: 'users',
      where: { email: { equals: 'jonas@covonet.be' } },
    })

    let superAdminUser
    if (existingUser.docs.length > 0) {
      superAdminUser = existingUser.docs[0]
      console.log('ℹ️ Super Admin user already exists.')
    } else {
      // Assign Super Admin role and tenants
      const tenants = []
      const tenantRoles: { tenant: string; roles: ('tenant-admin' | 'tenant-viewer')[] }[] = []

      for (let t = 1; t <= 3; t++) {
        const tenant = await payload.find({
          collection: 'tenants',
          where: { slug: { equals: `tenant${t}` } },
        })

        if (tenant.docs.length > 0) {
          tenants.push(tenant.docs[0].id)
          tenantRoles.push({
            tenant: tenant.docs[0].id,
            roles: ['tenant-admin', 'tenant-viewer'], // Use the correct roles type here
          })
        }
      }

      superAdminUser = await payload.create({
        collection: 'users',
        data: {
          email: 'jonas@covonet.be',
          password: 'test1234',
          roles: [superAdminRole.id], // Super Admin role
          tenants: tenantRoles, // Assign tenants with both roles
        },
      })
    }

    console.log(`✅ Created Tenant ${t}, Shop ${t}, Events & Ticket Types with Seat Map`)
  }
}

