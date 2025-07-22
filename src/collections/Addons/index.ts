import type { CollectionConfig } from 'payload'
import { tenantField } from '../../fields/TenantField'
import { hasPermission } from '@/access/permissionChecker'
import { baseListFilter } from './access/baseListFilter'

export const Addons: CollectionConfig = {
  slug: 'addons',

  access: {
    create: hasPermission('addons', 'create'),
    delete: hasPermission('addons', 'delete'),
    read: hasPermission('addons', 'read'),
    update: hasPermission('addons', 'update'),
  },

  admin: {
    useAsTitle: 'name',
    group: '🎫 Ticketing',
    defaultColumns: ['name', 'price', 'available', 'isPerTicket'],
    baseListFilter,
  },

  labels: {
    singular: { en: 'Add-On', nl: 'Extra Optie' },
    plural: { en: 'Add-Ons', nl: 'Extra Opties' },
  },

  fields: [
    tenantField,

    {
      name: 'name',
      type: 'text',
      required: true,
      label: { en: 'Name', nl: 'Naam' },
    },

    {
      name: 'description',
      type: 'textarea',
      label: { en: 'Description', nl: 'Beschrijving' },
      admin: {
        description: {
          en: 'Shown to the user during checkout.',
        },
      },
    },

    {
      name: 'price',
      type: 'number',
      required: true,
      defaultValue: 0,
      label: { en: 'Price (€)', nl: 'Prijs (€)' },
    },

    {
      name: 'isPerTicket',
      type: 'checkbox',
      defaultValue: false,
      label: { en: 'Per Ticket?', nl: 'Per Ticket?' },
      admin: {
        description: {
          en: 'Enable if this add-on can be selected per ticket instead of per order.',
          nl: 'Activeer als dit per ticket selecteerbaar moet zijn.',
        },
        position: 'sidebar',
      },
    },

    {
      name: 'available',
      type: 'checkbox',
      defaultValue: true,
      label: { en: 'Available', nl: 'Beschikbaar' },
      admin: {
        description: {
          en: 'If disabled, this add-on is hidden from checkout.',
        },
        position: 'sidebar',
      },
    },

    {
      name: 'maxQuantity',
      type: 'number',
      label: { en: 'Max Quantity Per Order', nl: 'Max Aantal Per Bestelling' },
      admin: {
        description: 'Optional. Leave empty for unlimited.',
      },
    },

    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: { en: 'Image', nl: 'Afbeelding' },
    },

    {
      name: 'events',
      type: 'relationship',
      relationTo: 'events',
      hasMany: true,
      required: true,
      label: { en: 'Linked Events', nl: 'Gekoppelde Events' },
    },
  ],
}

export default Addons
