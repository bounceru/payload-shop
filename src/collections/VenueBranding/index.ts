// File: src/collections/VenueBranding.ts

import type { CollectionConfig } from 'payload'
import { shopsField } from '@/fields/ShopsField'
import { tenantField } from '@/fields/TenantField'
import { baseListFilter } from './access/baseListFilter'
import { hasPermission, hasFieldPermission } from '@/access/permissionChecker'
import { colorPickerField } from '@innovixx/payload-color-picker-field'

export const VenueBranding: CollectionConfig = {
  slug: 'venue-branding',

  access: {
    create: hasPermission('venue-branding', 'create'),
    delete: hasPermission('venue-branding', 'delete'),
    read: hasPermission('venue-branding', 'read'),
    update: hasPermission('venue-branding', 'update'),
  },

  admin: {
    baseListFilter,
    useAsTitle: 'venueTitle',
    defaultColumns: ['venueTitle', 'siteLogo'],
  },

  labels: {
    plural: {
      en: 'Venue Branding',
      nl: 'Zaalbranding',
      de: 'Veranstaltungsort-Branding',
      fr: 'Branding de Lieu',
    },
    singular: {
      en: 'Venue Branding',
      nl: 'Zaalbranding',
      de: 'Veranstaltungsort-Branding',
      fr: 'Branding de Lieu',
    },
  },

  fields: [
    tenantField,
    shopsField,

    {
      name: 'venueTitle',
      type: 'text',
      required: true,
      label: {
        en: 'Venue Title',
        nl: 'Titel van de zaal',
      },
      access: {
        read: hasFieldPermission('venue-branding', 'venueTitle', 'read'),
        update: hasFieldPermission('venue-branding', 'venueTitle', 'update'),
      },
    },

    {
      name: 'siteLogo',
      type: 'upload',
      relationTo: 'media',
      required: false,
      label: { en: 'Site Logo', nl: 'Site Logo' },
      displayPreview: true,
      access: {
        read: hasFieldPermission('venue-branding', 'siteLogo', 'read'),
        update: hasFieldPermission('venue-branding', 'siteLogo', 'update'),
      },
    },

    {
      name: 'siteFavicon',
      type: 'upload',
      relationTo: 'media',
      required: false,
      label: { en: 'Favicon', nl: 'Favicon' },
      access: {
        read: hasFieldPermission('venue-branding', 'siteFavicon', 'read'),
        update: hasFieldPermission('venue-branding', 'siteFavicon', 'update'),
      },
    },

    {
      name: 'headerImage',
      type: 'upload',
      relationTo: 'media',
      label: { en: 'Header Image' },
      access: {
        read: hasFieldPermission('venue-branding', 'headerImage', 'read'),
        update: hasFieldPermission('venue-branding', 'headerImage', 'update'),
      },
    },

    colorPickerField({
      name: 'headerBackgroundColor',
      label: { en: 'Header Background Color', nl: 'Achtergrondkleur koptekst' },
      access: {
        read: hasFieldPermission('venue-branding', 'headerBackgroundColor', 'read'),
        update: hasFieldPermission('venue-branding', 'headerBackgroundColor', 'update'),
      },
    }),

    colorPickerField({
      name: 'headerTextColor',
      label: { en: 'Header Text Color', nl: 'Tekstkleur koptekst' },
      access: {
        read: hasFieldPermission('venue-branding', 'headerTextColor', 'read'),
        update: hasFieldPermission('venue-branding', 'headerTextColor', 'update'),
      },
    }),

    colorPickerField({
      name: 'primaryColorCTA',
      label: { en: 'Primary CTA Color', nl: 'Primaire CTA-kleur' },
      defaultValue: '#068b59',
      access: {
        read: hasFieldPermission('venue-branding', 'primaryColorCTA', 'read'),
        update: hasFieldPermission('venue-branding', 'primaryColorCTA', 'update'),
      },
    }),

    {
      name: 'venueHeaderText',
      type: 'text',
      label: 'Header Text',
      required: false,
      access: {
        read: hasFieldPermission('venue-branding', 'venueHeaderText', 'read'),
        update: hasFieldPermission('venue-branding', 'venueHeaderText', 'update'),
      },
    },

    {
      name: 'venueIntroText',
      type: 'textarea',
      label: 'Intro Text',
      required: false,
      access: {
        read: hasFieldPermission('venue-branding', 'venueIntroText', 'read'),
        update: hasFieldPermission('venue-branding', 'venueIntroText', 'update'),
      },
    },
  ],
}

export default VenueBranding
