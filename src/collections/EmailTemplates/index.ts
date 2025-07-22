// File: src/collections/EmailTemplates/index.ts

import type { CollectionConfig } from 'payload'
import { baseListFilter } from '@/collections/SeatMaps/access/baseListFilter' // or wherever your baseListFilter is
import { hasPermission, hasFieldPermission } from '@/access/permissionChecker'
import { tenantField } from '@/fields/TenantField' // If you want to tie templates to a tenant

export const EmailTemplates: CollectionConfig = {
  slug: 'email-templates',

  // Access control, similar to your other collections
  access: {
    create: hasPermission('email-templates', 'create'),
    read: hasPermission('email-templates', 'read'),
    update: hasPermission('email-templates', 'update'),
    delete: hasPermission('email-templates', 'delete'),
  },

  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'subject', 'isPublic'],
    baseListFilter,
  },

  labels: {
    singular: {
      en: 'Email Template',
      nl: 'E-mailtemplate',
    },
    plural: {
      en: 'Email Templates',
      nl: 'E-mailtemplates',
    },
  },

  fields: [
    // Optionally tie to tenant if needed
    {
      ...tenantField,
      // or remove if these are global, not tenant-specific
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Template Name',
      access: {
        read: hasFieldPermission('email-templates', 'name', 'read'),
        update: hasFieldPermission('email-templates', 'name', 'update'),
      },
    },
    {
      name: 'subject',
      type: 'text',
      label: 'Default Subject',
      required: false,
      access: {
        read: hasFieldPermission('email-templates', 'subject', 'read'),
        update: hasFieldPermission('email-templates', 'subject', 'update'),
      },
    },
    {
      name: 'body',
      type: 'richText', // or “code” if you prefer raw HTML
      label: 'Body (HTML / Rich Text)',
      required: false,
      admin: {
        description: 'Main content of the template, can be HTML or rich text.',
      },
      access: {
        read: hasFieldPermission('email-templates', 'body', 'read'),
        update: hasFieldPermission('email-templates', 'body', 'update'),
      },
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      label: 'Is Public Template?',
      defaultValue: false,
      access: {
        read: hasFieldPermission('email-templates', 'isPublic', 'read'),
        update: hasFieldPermission('email-templates', 'isPublic', 'update'),
      },
    },
  ],
}

export default EmailTemplates
