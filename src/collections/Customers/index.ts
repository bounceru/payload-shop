import type { CollectionConfig } from 'payload';
import { tenantField } from '../../fields/TenantField';
import { hasPermission, hasFieldPermission } from '@/access/permissionChecker';
import { isSuperAdmin } from '@/access/isSuperAdmin';
import { FieldAccess } from 'payload';

export const ownerOrFieldPermission = (
  collectionName: string,
  fieldName: string,
  action: 'read' | 'update',
): FieldAccess =>
  async ({ req, doc }) => {
    if (!req.user) return false;
    if (isSuperAdmin({ req })) return true;
    if (req.user.collection === collectionName && req.user.id === doc?.id) return true;
    return hasFieldPermission(collectionName, fieldName, action)({ req });
  };

export const Customers: CollectionConfig = {
  slug: 'customers',

  auth: {
    tokenExpiration: 60 * 60 * 24 * 365,
    cookies: {
      secure: false,
      sameSite: 'None',
    },
  },

  access: {
    create: hasPermission('customers', 'create'),
    read: async ({ req, id }) => {
      if (!req.user) return false;
      if (hasPermission('customers', 'read')({ req })) return true;
      return req.user.id === id;
    },
    update: async ({ req, id }) => {
      if (!req.user) return false;
      if (hasPermission('customers', 'update')({ req })) return true;
      return req.user.id === id;
    },
    delete: hasPermission('customers', 'delete'),
  },

  admin: {
    useAsTitle: 'firstname',
    group: '🎟️ Customers',
    defaultColumns: ['firstname', 'lastname', 'email'],
  },

  labels: {
    plural: { en: 'Customers', nl: 'Klanten', de: 'Kunden', fr: 'Clients' },
    singular: { en: 'Customer', nl: 'Klant', de: 'Kunde', fr: 'Client' },
  },

  fields: [
    {
      name: 'firstname', type: 'text', required: true,
      label: { en: 'First Name', nl: 'Voornaam' },
      access: {
        read: ownerOrFieldPermission('customers', 'firstname', 'read'),
        update: ownerOrFieldPermission('customers', 'firstname', 'update'),
      },
    },
    {
      name: 'lastname', type: 'text', required: true,
      label: { en: 'Last Name', nl: 'Achternaam' },
      access: {
        read: ownerOrFieldPermission('customers', 'lastname', 'read'),
        update: ownerOrFieldPermission('customers', 'lastname', 'update'),
      },
    },
    {
      name: 'email', type: 'email', required: true,
      label: { en: 'Email Address', nl: 'E-mailadres' },
      access: {
        read: ownerOrFieldPermission('customers', 'email', 'read'),
        update: ownerOrFieldPermission('customers', 'email', 'update'),
      },
    },
    {
      name: 'phone', type: 'text', label: { en: 'Phone Number', nl: 'Telefoonnummer' },
      access: {
        read: ownerOrFieldPermission('customers', 'phone', 'read'),
        update: ownerOrFieldPermission('customers', 'phone', 'update'),
      },
    },
    {
      name: 'date_of_birth', type: 'date', label: { en: 'Date of Birth', nl: 'Geboortedatum' },
      access: {
        read: ownerOrFieldPermission('customers', 'date_of_birth', 'read'),
        update: ownerOrFieldPermission('customers', 'date_of_birth', 'update'),
      },
    },
    {
      name: 'tags', type: 'array', label: { en: 'Tags' },
      fields: [
        { name: 'tag_id', type: 'text' },
        { name: 'tag_type', type: 'text' },
      ],
      access: {
        read: ownerOrFieldPermission('customers', 'tags', 'read'),
        update: ownerOrFieldPermission('customers', 'tags', 'update'),
      },
    },
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
      label: { en: 'Active', nl: 'Actief' },
      admin: { position: 'sidebar' },
      access: {
        read: ownerOrFieldPermission('customers', 'enabled', 'read'),
        update: ownerOrFieldPermission('customers', 'enabled', 'update'),
      },
    },

    { ...tenantField },


  ],
};

export default Customers;