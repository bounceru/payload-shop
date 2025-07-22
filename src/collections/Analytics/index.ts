import type { CollectionConfig } from 'payload'
import { tenantField } from '@/fields/TenantField'
import { hasPermission } from '@/access/permissionChecker'

export const Analytics: CollectionConfig = {
  slug: 'analytics',
  labels: {
    singular: { en: 'Analytics Snapshot', nl: 'Analyse Momentopname' },
    plural: { en: 'Analytics Snapshots', nl: 'Analyse Momentopnamen' },
  },
  access: {
    create: hasPermission('analytics', 'create'),
    read: hasPermission('analytics', 'read'),
    update: hasPermission('analytics', 'update'),
    delete: hasPermission('analytics', 'delete'),
  },
  admin: {
    useAsTitle: 'label',
    group: '📊 Analytics',
    defaultColumns: ['label', 'event', 'date'],
  },
  fields: [
    tenantField,
    {
      name: 'label',
      type: 'text',
      required: true,
      admin: {
        description: 'E.g. "Daily Ticket Sales" or "Scan Summary"',
      },
    },
    {
      name: 'event',
      type: 'relationship',

      relationTo: 'events',
      required: false,
    },
    {
      name: 'date',
      type: 'date',
      required: true,
    },
    {
      name: 'data',
      type: 'json',
      label: 'Snapshot Data',
      admin: {
        description: 'Precomputed metrics (sales, scans, revenue, etc.)',
      },
    },
  ],
  timestamps: true,
}

export default Analytics
