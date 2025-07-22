// File: src/collections/Newsletters/index.ts

import type { CollectionConfig } from 'payload'
import { tenantField } from '../../fields/TenantField'
import { baseListFilter } from './access/baseListFilter'
import { hasFieldPermission, hasPermission } from '@/access/permissionChecker'

export const Newsletters: CollectionConfig = {
  slug: 'newsletters',

  access: {
    create: hasPermission('newsletters', 'create'),
    delete: hasPermission('newsletters', 'delete'),
    read: hasPermission('newsletters', 'read'),
    update: hasPermission('newsletters', 'update'),
  },

  admin: {
    group: '🗞️ Marketing',
    useAsTitle: 'subject',
    baseListFilter,
    defaultColumns: ['subject', 'status', 'sendDate', 'audience'],
  },

  labels: {
    singular: { en: 'Newsletter', nl: 'Nieuwsbrief' },
    plural: { en: 'Newsletters', nl: 'Nieuwsbrieven' },
  },

  fields: [
    tenantField,

    {
      name: 'subject',
      type: 'text',
      required: true,
      label: { en: 'Subject', nl: 'Onderwerp' },
      access: {
        read: hasFieldPermission('newsletters', 'subject', 'read'),
        update: hasFieldPermission('newsletters', 'subject', 'update'),
      },
    },

    {
      name: 'body',
      type: 'richText',
      label: { en: 'Email Body', nl: 'E-mailinhoud' },
      required: true,
      admin: {
        description: 'Main content of the newsletter email',
      },
    },

    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Sent', value: 'sent' },
      ],
      admin: {
        position: 'sidebar',
      },
    },

    {
      name: 'sendDate',
      type: 'date',
      label: { en: 'Send Date', nl: 'Verzenddatum' },
      admin: {
        position: 'sidebar',
        description: 'Date/time to send this newsletter (if scheduled)',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },

    {
      name: 'audience',
      type: 'select',
      required: true,
      defaultValue: 'all',
      label: { en: 'Audience', nl: 'Doelgroep' },
      options: [
        { label: 'All Customers', value: 'all' },
        { label: 'Customers with Specific Tags', value: 'tagged' },
        { label: 'Customers of Specific Event', value: 'event' },
        { label: 'Manual Selection (Advanced)', value: 'manual' },
      ],
      admin: {
        description: 'Who should receive this mailing?',
      },
    },

    {
      name: 'targetTags',
      type: 'relationship',
      relationTo: 'customers',
      hasMany: true,
      label: 'Target by Tags',
      admin: {
        condition: (_, siblingData) => siblingData.audience === 'tagged',
        description: 'Only customers with these tags will receive this newsletter.',
      },
    },

    {
      name: 'targetEvent',
      type: 'relationship',

      relationTo: 'events',
      label: 'Target Event',
      admin: {
        condition: (_, siblingData) => siblingData.audience === 'event',
        description: 'Only customers who bought tickets for this event will receive it.',
      },
    },

    {
      name: 'sendTestEmail',
      type: 'text',
      label: 'Send Test Email To',
      admin: {
        description: 'Enter an email to test this newsletter before sending it live.',
      },
    },
  ],
}

export default Newsletters
