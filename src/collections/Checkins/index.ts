import type { CollectionConfig } from 'payload'
import { tenantField } from '../../fields/TenantField'
import { hasPermission } from '@/access/permissionChecker'
import { baseListFilter } from './access/baseListFilter'

export const Checkins: CollectionConfig = {
  slug: 'checkins',

  access: {
    create: hasPermission('checkins', 'create'),
    delete: hasPermission('checkins', 'delete'),
    read: hasPermission('checkins', 'read'),
    update: hasPermission('checkins', 'update'),
  },

  admin: {
    useAsTitle: 'ticket',
    group: '💳 Orders',
    defaultColumns: ['ticket', 'status', 'scannedAt', 'device'],
    baseListFilter,
  },

  labels: {
    singular: { en: 'Check-in', nl: 'Scan' },
    plural: { en: 'Check-ins', nl: 'Scans' },
  },

  fields: [
    tenantField,

    {
      name: 'ticket',
      type: 'relationship',

      relationTo: 'tickets',
      required: true,
      label: 'Ticket',
    },

    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'success',
      options: [
        { label: 'Success', value: 'success' },
        { label: 'Duplicate', value: 'duplicate' },
        { label: 'Invalid', value: 'invalid' },
        { label: 'Expired', value: 'expired' },
      ],
      label: 'Scan Result',
    },

    {
      name: 'scannedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      label: 'Scanned At',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },

    {
      name: 'device',
      type: 'text',
      label: 'Device ID',
      admin: {
        description: 'Optional device ID or staff identifier',
      },
    },

    {
      name: 'userAgent',
      type: 'text',
      label: 'User Agent',
    },

    {
      name: 'note',
      type: 'textarea',
      label: 'Note',
    },
  ],
}

export default Checkins
