// File: src/collections/Tenants/index.ts

import type { CollectionConfig } from 'payload'

import { isSuperAdmin } from '../../access/isSuperAdmin'
import { filterByTenantRead } from './access/byTenant'
import { hasFieldPermission, hasPermission } from '@/access/permissionChecker'

export const Tenants: CollectionConfig = {
  slug: 'tenants',

  // -------------------------
  // Collection-level access
  // -------------------------
  access: {
    create: () => true,
    delete: hasPermission('tenants', 'delete'),
    read: filterByTenantRead, // custom read filter
    update: hasPermission('tenants', 'update'),
  },

  admin: {
    useAsTitle: 'name',
    hidden: ({ user }) => {
      // Hide from non-superadmins with access to exactly one tenant
      if (!user) return true
      return (
        !isSuperAdmin({ req: { user } as any }) &&
        user.tenants &&
        user.tenants.length === 1
      )
    },
  },

  labels: {
    plural: {
      en: 'Organizations',
      nl: 'Organisaties',
      de: 'Organisationen',
      fr: 'Organisations',
    },
    singular: {
      en: 'Organization',
      nl: 'Organisatie',
      de: 'Organisation',
      fr: 'Organisation',
    },
  },

  fields: [
    {
      // 1) Name (text)
      name: 'name',
      type: 'text',
      required: true,
      label: {
        en: 'Name',
        nl: 'Naam',
        de: 'Name',
        fr: 'Nom',
      },
      access: {
        read: hasFieldPermission('tenants', 'name', 'read'),
        update: hasFieldPermission('tenants', 'name', 'update'),
      },
    },
    {
      // 2) domains array
      name: 'domains',
      type: 'array',
      label: {
        en: 'Domains',
        nl: 'Domeinen',
        de: 'Domains',
        fr: 'Domaines',
      },
      fields: [
        {
          name: 'domain',
          type: 'text',
          required: true,
          label: {
            en: 'Domain',
            nl: 'Domein',
            de: 'Domain',
            fr: 'Domaine',
          },
        },
      ],
      index: true,
      access: {
        read: hasFieldPermission('tenants', 'domains', 'read'),
        update: hasFieldPermission('tenants', 'domains', 'update'),
      },
    },
    {
      // 3) slug
      name: 'slug',
      type: 'text',
      label: {
        en: 'Slug',
        nl: 'Slug',
        de: 'Slug',
        fr: 'Slug',
      },
      admin: {
        description: {
          en: 'Used for URL paths, example: /tenant-slug/page-slug.',
          nl: 'Gebruikt voor URL-paden, voorbeeld: /eigenaar-slug/pagina-slug.',
          de: 'Wird für URL-Pfade verwendet, Beispiel: /eigentümer-slug/seite-slug.',
          fr: 'Utilisé pour les chemins URL, exemple: /propriétaire-slug/page-slug.',
        },
      },
      index: true,
      required: true,
      access: {
        read: hasFieldPermission('tenants', 'slug', 'read'),
        update: hasFieldPermission('tenants', 'slug', 'update'),
      },
    },
    {
      name: 'stripeCustomerId',
      type: 'text',
      required: false,
      admin: {
        description: 'Stripe Customer ID for this tenant',
      },
    },
    {
      name: 'managedByReseller',
      type: 'checkbox',
      label: 'Is tenant managed by a reseller?',
      defaultValue: false,
      admin: {
        description: 'If true, only Reseller or Super-Admin can subscribe to services',
      },
    },
    {
      // 4) public checkbox
      name: 'public',
      type: 'checkbox',
      label: {
        en: 'Public Access',
        nl: 'Publieke Toegang',
        de: 'Öffentlicher Zugriff',
        fr: 'Accès Public',
      },
      admin: {
        description: {
          en: 'If checked, logging in is not required.',
          nl: 'Als aangevinkt, is inloggen niet vereist.',
          de: 'Wenn aktiviert, ist kein Login erforderlich.',
          fr: 'Si coché, aucune connexion n\'est requise.',
        },
        position: 'sidebar',
      },
      defaultValue: false,
      index: true,
      access: {
        read: hasFieldPermission('tenants', 'public', 'read'),
        update: hasFieldPermission('tenants', 'public', 'update'),
      },
    },
  ],
}

export default Tenants
