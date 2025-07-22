import type { CollectionConfig, FieldHook } from 'payload'

// Import your encryption hooks
import { encryptField, decryptField } from '../../field-hooks/encryption'

// If you have these in a shared folder:
import { tenantField } from '../../fields/TenantField'
import { shopsField } from '../../fields/ShopsField'

import { baseListFilter } from './access/baseListFilter'
import {
  hasPermission,
  hasFieldPermission,
} from '@/access/permissionChecker'

// A simple "beforeChange" hook for automatically setting host/port for Outlook/Brevo/etc.
const autoSetHostAndPort: FieldHook = ({ data, value }) => {
  if (data?.provider === 'outlook') {
    return 'smtp.office365.com'
  }
  if (data?.provider === 'brevo') {
    return 'smtp-relay.sendinblue.com'
  }
  if (data?.provider === 'gmail') {
    return 'smtp.gmail.com'
  }
  return value
}

const autoSetPort: FieldHook = ({ data, value }) => {
  if (
    data?.provider === 'outlook' ||
    data?.provider === 'brevo' ||
    data?.provider === 'gmail'
  ) {
    return 587
  }
  return value
}

const SMTPSettings: CollectionConfig = {
  slug: 'smtp-settings',
  labels: {
    singular: { en: 'SMTP Setting', nl: 'SMTP-instelling' },
    plural: { en: 'SMTP Settings', nl: 'SMTP-instellingen' },
  },
  admin: {
    baseListFilter,
    useAsTitle: 'title',
    defaultColumns: ['title', 'host', 'provider'],
  },

  access: {
    create: hasPermission('smtp-settings', 'create'),
    read: hasPermission('smtp-settings', 'read'),
    update: hasPermission('smtp-settings', 'update'),
    delete: hasPermission('smtp-settings', 'delete'),
  },

  fields: [
    // Friendly Name
    {
      name: 'title',
      type: 'text',
      label: 'Friendly Name',
      required: true,
      access: {
        read: hasFieldPermission('smtp-settings', 'title', 'read'),
        update: hasFieldPermission('smtp-settings', 'title', 'update'),
      },
    },

    // Tenant link
    {
      ...tenantField,
    },

    // Shops link
    {
      ...shopsField,
    },

    // Provider
    {
      name: 'provider',
      type: 'select',
      label: 'Email Provider',
      defaultValue: 'custom',
      options: [
        { label: 'Gmail', value: 'gmail' },
        { label: 'Outlook/Office365', value: 'outlook' },
        { label: 'Orderapp Domain (Fallback)', value: 'orderapp' },
        { label: 'Custom / Other SMTP', value: 'custom' },
        { label: 'Brevo (ex Sendinblue)', value: 'brevo' },
      ],
      required: true,
      admin: {
        description: 'Choose which provider this configuration applies to.',
      },
      access: {
        read: hasFieldPermission('smtp-settings', 'provider', 'read'),
        update: hasFieldPermission('smtp-settings', 'provider', 'update'),
      },
    },

    // Host
    {
      name: 'host',
      type: 'text',
      label: 'SMTP Host',
      required: false,
      // Hide this field unless provider = custom
      admin: {
        condition: (data) => data.provider === 'custom',
      },
      hooks: {
        beforeChange: [autoSetHostAndPort], // auto-set for outlook/brevo/gmail
      },
      access: {
        read: hasFieldPermission('smtp-settings', 'host', 'read'),
        update: hasFieldPermission('smtp-settings', 'host', 'update'),
      },
    },

    // Port
    {
      name: 'port',
      type: 'number',
      label: 'SMTP Port',
      required: false,
      admin: {
        condition: (data) => data.provider === 'custom',
        description: 'Typically 587 or 465 if using TLS/SSL.',
      },
      hooks: {
        beforeChange: [autoSetPort], // auto-set for outlook/brevo/gmail
      },
      access: {
        read: hasFieldPermission('smtp-settings', 'port', 'read'),
        update: hasFieldPermission('smtp-settings', 'port', 'update'),
      },
    },

    // Username
    {
      name: 'username',
      type: 'text',
      label: 'SMTP Username (or email address)',
      required: false,
      admin: {
        condition: (data) => data.provider !== 'orderapp',
      },
      access: {
        read: hasFieldPermission('smtp-settings', 'username', 'read'),
        update: hasFieldPermission('smtp-settings', 'username', 'update'),
      },
    },

    // Two-way encrypted password
    {
      name: 'password',
      type: 'text', // for two-way encryption
      label: 'SMTP Password / App Password',
      required: false,
      admin: {
        condition: (data) => data.provider !== 'orderapp',

      },
      hooks: {
        beforeChange: [encryptField],
        afterRead: [decryptField],
      },
      access: {
        // Adjust read vs. update as you like
        read: hasFieldPermission('smtp-settings', 'password', 'read'),
        update: hasFieldPermission('smtp-settings', 'password', 'update'),
      },
    },

    // From Name
    {
      name: 'fromName',
      type: 'text',
      label: 'Default “From” Name',
      required: false,
      admin: {
        description: 'The display name the customer sees as sender, e.g. “YourShopName”.',
      },
      access: {
        read: hasFieldPermission('smtp-settings', 'fromName', 'read'),
        update: hasFieldPermission('smtp-settings', 'fromName', 'update'),
      },
    },

    // From Email
    {
      name: 'fromEmail',
      type: 'text',
      label: 'Default “From” Email',
      required: false,
      admin: {
        description: 'The actual email address. E.g. no-reply@yourshop.com.',
      },
      access: {
        read: hasFieldPermission('smtp-settings', 'fromEmail', 'read'),
        update: hasFieldPermission('smtp-settings', 'fromEmail', 'update'),
      },
    },
  ],
}

export default SMTPSettings
