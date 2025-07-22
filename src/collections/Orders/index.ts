// src/collections/Orders/index.ts
import type { CollectionConfig } from 'payload'
import { tenantField } from '../../fields/TenantField'
import { hasPermission } from '@/access/permissionChecker'
import { baseListFilter } from './access/baseListFilter'

export const Orders: CollectionConfig = {
  slug: 'orders',

  access: {
    create: hasPermission('orders', 'create'),
    delete: hasPermission('orders', 'delete'),
    read: hasPermission('orders', 'read'),
    update: hasPermission('orders', 'update'),
  },

  admin: {
    useAsTitle: 'orderNr',
    group: '💳 Orders',
    defaultColumns: ['orderNr', 'customer', 'event', 'status', 'total'],
    baseListFilter,
  },

  labels: {
    singular: { en: 'Order', nl: 'Bestelling' },
    plural: { en: 'Orders', nl: 'Bestellingen' },
  },

  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation !== 'create' && operation !== 'update') return

        const tenantId = typeof data.tenant === 'object' ? data.tenant.id : data.tenant
        if (!tenantId) throw new Error('tenant required')

        let calculatedTotal = 0

        // 1. Ticket total (either full objects or string IDs)
        if (data.tickets && Array.isArray(data.tickets)) {
          for (const ticket of data.tickets) {
            if (typeof ticket === 'object' && 'price' in ticket) {
              calculatedTotal += ticket.price ?? 0
            } else if (typeof ticket === 'string') {
              const ticketDoc = await req.payload.findByID({ collection: 'tickets', id: ticket })
              calculatedTotal += ticketDoc?.price ?? 0
            }
          }
        }

        // 2. Add-on total via addonSelections (seat-level quantity support)
        if (data.addonSelections && Array.isArray(data.addonSelections)) {
          for (const selection of data.addonSelections) {
            const { addonId, quantity } = selection
            const addon = await req.payload.findByID({
              collection: 'addons',
              id: addonId,
            })

            if (addon?.price && quantity > 0) {
              calculatedTotal += addon.price * quantity
            }
          }
        }

        // 3. Set calculated total
        data.total = calculatedTotal

        // 4. Auto-increment orderNr
        if (operation === 'create') {
          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              const last = await req.payload.find({
                collection: 'orders',
                where: { tenant: { equals: tenantId } },
                sort: '-orderNr',
                limit: 1,
                depth: 0,
              })

              const lastOrder = last.docs[0] as { orderNr?: number } | undefined
              data.orderNr = (lastOrder?.orderNr || 0) + 1
              return
            } catch (err: any) {
              if (err.code === 11000 && attempt < 2) continue
              throw err
            }
          }
        }
      },
    ],
  },

  fields: [
    // always keep tenant first so it exists in beforeChange
    tenantField,

    {
      name: 'orderNr',
      type: 'number',
      required: true,
      admin: {
        readOnly: true,
        description: 'Auto-generated, sequential per tenant',
      },
    },

    {
      name: 'createdAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { readOnly: true },
    },

    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      label: { en: 'Customer' },
    },
    {
      name: 'addonSelections',
      label: 'Addon Selections',
      type: 'array',
      fields: [
        { name: 'seatId', type: 'text', required: true },
        { name: 'addonId', type: 'text', required: true },
        { name: 'quantity', type: 'number', required: true },
      ],
      admin: { hidden: true }, // if not needed in admin
    },

    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: true,
      label: { en: 'Event' },
    },

    {
      name: 'tickets',
      type: 'relationship',
      relationTo: 'tickets',
      hasMany: true,
      required: false,
      label: { en: 'Tickets' },
    },

    {
      name: 'addons',
      type: 'relationship',
      relationTo: 'addons',
      hasMany: true,
      label: { en: 'Add-ons' },
    },

    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'paid',
      options: [
        { label: 'Paid', value: 'paid' },
        { label: 'Pending', value: 'pending' },
        { label: 'Failed', value: 'failed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      label: { en: 'Payment Status' },
    },

    {
      name: 'paymentProvider',
      type: 'text',
      label: 'Payment Provider',
      admin: { position: 'sidebar' },
    },

    {
      name: 'paymentMethod',
      type: 'relationship',
      relationTo: 'payment-methods',
      label: 'Payment Method',
      admin: { position: 'sidebar' },
    },

    {
      name: 'paymentReference',
      type: 'text',
      label: 'Payment Reference (Mollie ID)',
      admin: { position: 'sidebar' },
    },

    {
      name: 'total',
      type: 'number',
      label: 'Total (€)',
      required: true,
    },

    {
      name: 'couponCode',
      type: 'text',
      label: 'Coupon Used',
    },

    {
      name: 'ipAddress',
      type: 'text',
      label: 'IP Address',
      admin: { position: 'sidebar' },
    },

    {
      name: 'locale',
      type: 'select',
      options: ['nl', 'fr', 'en', 'de'],
      label: 'Checkout Language',
    },
  ],
}

export default Orders
