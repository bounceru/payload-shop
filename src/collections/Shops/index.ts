import type { CollectionConfig } from 'payload'

import { tenantField } from '../../fields/TenantField'
import { hasPermission, hasFieldPermission } from '@/access/permissionChecker'
import CustomAPIError from '@/errors/CustomAPIError'
import { baseListFilter } from './access/baseListFilter'

const validateSlug = (slug: string): boolean => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)
const validateDomain = (domain: string): boolean => /^https:\/\/[a-z0-9.-]+$/.test(domain)

export const Shops: CollectionConfig = {
  slug: 'shops',

  access: {
    create: hasPermission('shops', 'create'),
    delete: hasPermission('shops', 'delete'),
    read: hasPermission('shops', 'read'),
    update: hasPermission('shops', 'update'),
  },

  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name'],
    baseListFilter,
  },

  labels: {
    plural: {
      en: 'Venues', nl: 'Locaties', de: 'Veranstaltungsorte', fr: 'Lieux',
    },
    singular: {
      en: 'Venue', nl: 'Locatie', de: 'Veranstaltungsort', fr: 'Lieu',
    },
  },

  hooks: {
    beforeValidate: [
      async ({ data, operation }) => {
        if ((operation === 'create' || operation === 'update') && data?.slug && !validateSlug(data.slug)) {
          throw new CustomAPIError('Invalid slug. Only lowercase letters, hyphens (-), and no spaces, numbers, or special characters are allowed.')
        }
        if ((operation === 'create' || operation === 'update') && data?.domain && !validateDomain(data.domain)) {
          throw new CustomAPIError('Invalid domain format. Must include "https://" and a valid domain name.')
        }
        return data
      },
    ],
  },

  fields: [
    {
      type: 'collapsible',
      label: { en: 'Venue Info', nl: 'Locatie Info', de: 'Veranstaltungsort Info', fr: 'Infos du Lieu' },
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'name', type: 'text', required: true,
          label: { en: 'Venue Name', nl: 'Naam van de Locatie', de: 'Name des Veranstaltungsortes', fr: 'Nom du Lieu' },
          access: {
            read: hasFieldPermission('shops', 'name', 'read'),
            update: hasFieldPermission('shops', 'name', 'update'),
          },
        },
        {
          name: 'slug', type: 'text', unique: true,
          access: {
            read: hasFieldPermission('shops', 'slug', 'read'),
            update: hasFieldPermission('shops', 'slug', 'update'),
          },
        },
      ],
    },

    {
      name: 'showExceptionallyClosedDaysOnOrderPage',
      type: 'checkbox',
      label: {
        en: 'Show closed days on order page?',
        nl: 'Toon sluitingsdagen op bestelpagina?',
      },
      defaultValue: false,
      access: {
        read: hasFieldPermission('shops', 'showExceptionallyClosedDaysOnOrderPage', 'read'),
        update: hasFieldPermission('shops', 'showExceptionallyClosedDaysOnOrderPage', 'update'),
      },
    },
    {
      name: 'exceptionally_closed_days',
      type: 'array',
      label: {
        en: 'Exceptionally Closed Days',
        nl: 'Uitzonderlijke sluitingsdagen',
      },
      labels: {
        singular: 'Day',
        plural: 'Days',
      },
      fields: [
        {
          name: 'date',
          type: 'date',
          required: true,
          label: {
            en: 'Date',
            nl: 'Datum',
          },
        },
        {
          name: 'reason',
          type: 'text',
          label: {
            en: 'Reason (optional)',
            nl: 'Reden (optioneel)',
          },
        },
      ],
      access: {
        read: hasFieldPermission('shops', 'exceptionally_closed_days', 'read'),
        update: hasFieldPermission('shops', 'exceptionally_closed_days', 'update'),
      },
    },


    {
      type: 'collapsible',
      label: { en: 'Address & Location', nl: 'Adres & Locatie', de: 'Adresse & Ort', fr: 'Adresse & Lieu' },
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'address', type: 'text',
          label: { en: 'Address', nl: 'Adres', de: 'Adresse', fr: 'Adresse' },
          access: {
            read: hasFieldPermission('shops', 'address', 'read'),
            update: hasFieldPermission('shops', 'address', 'update'),
          },
        },
        {
          name: 'location', type: 'group', label: 'Geolocation',
          fields: [
            { name: 'lat', type: 'text', label: 'Latitude', admin: { readOnly: true } },
            { name: 'lng', type: 'text', label: 'Longitude', admin: { readOnly: true } },
          ],
          access: {
            read: hasFieldPermission('shops', 'location', 'read'),
            update: hasFieldPermission('shops', 'location', 'update'),
          },
        },
      ],
    },

    {
      type: 'collapsible',
      label: { en: 'Contact Info', nl: 'Contactgegevens', de: 'Kontaktdaten', fr: 'Informations de contact' },
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'company_details', type: 'group',
          label: { en: 'Company Details', nl: 'Bedrijf', de: 'Unternehmen', fr: 'Entreprise' },
          fields: [
            { name: 'company_name', type: 'text', label: { en: 'Company Name', nl: 'Bedrijfsnaam' }, required: true },
            { name: 'contact_email', type: 'text', label: 'Contact Email' },
            { name: 'phone', type: 'text', label: { en: 'Phone Number', nl: 'Telefoonnummer' } },
            { name: 'street', type: 'text', label: { en: 'Street', nl: 'Straat' } },
            { name: 'house_number', type: 'text', label: { en: 'House Number', nl: 'Huisnummer' } },
            { name: 'city', type: 'text', label: { en: 'City', nl: 'Stad' } },
            { name: 'postal', type: 'text', label: { en: 'Postal Code', nl: 'Postcode' } },
            { name: 'vat_nr', type: 'text', label: { en: 'VAT Number', nl: 'BTW-nummer' } },
            { name: 'website_url', type: 'text', label: { en: 'Website URL', nl: 'Website' } },
          ],
          access: {
            read: hasFieldPermission('shops', 'company_details', 'read'),
            update: hasFieldPermission('shops', 'company_details', 'update'),
          },
        },
      ],
    },

    {
      type: 'collapsible',
      label: { en: 'Domain Mapping', nl: 'Domeinkoppeling' },
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'domain',
          type: 'text',
          label: 'Public Frontend Domain (e.g. https://tickets.myvenue.be)',
          required: true,
          access: {
            read: hasFieldPermission('shops', 'domain', 'read'),
            update: hasFieldPermission('shops', 'domain', 'update'),
          },
        },
      ],
    },

    // Link to tenant
    { ...tenantField },
  ],
}

export default Shops