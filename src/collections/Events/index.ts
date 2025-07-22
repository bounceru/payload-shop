// src/collections/Events/index.ts
import type { CollectionConfig } from 'payload'
import { tenantField } from '../../fields/TenantField'
import { hasFieldPermission, hasPermission } from '@/access/permissionChecker'
import { baseListFilter } from './access/baseListFilter'

export const Events: CollectionConfig = {
  slug: 'events',

  access: {
    create: hasPermission('events', 'create'),
    delete: hasPermission('events', 'delete'),
    read: hasPermission('events', 'read'),
    update: hasPermission('events', 'update'),
  },

  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'venue', 'isPublished'],
    group: '🎫 Ticketing',
    baseListFilter,
  },

  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if ((operation === 'create' || operation === 'update') && data?.title) {
          const raw = data.slug || data.title

          const normalized = raw
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')  // Replace spaces/symbols
            .replace(/^-+|-+$/g, '')     // Trim hyphens

          data.slug = normalized
        }

        return data
      },
    ],
  },


  labels: {
    singular: {
      en: 'Event',
      nl: 'Evenement',
      fr: 'Événement',
      de: 'Veranstaltung',
    },
    plural: {
      en: 'Events',
      nl: 'Evenementen',
      fr: 'Événements',
      de: 'Veranstaltungen',
    },
  },

  fields: [
    tenantField,

    {
      name: 'title',
      type: 'text',
      required: true,
      label: { en: 'Event Title', nl: 'Titel' },
      access: {
        read: hasFieldPermission('events', 'title', 'read'),
        update: hasFieldPermission('events', 'title', 'update'),
      },
    },

    {
      name: 'slug',
      type: 'text',
      unique: true,
      required: true,
      label: { en: 'Slug (URL)' },
      admin: { description: 'e.g., summer-jazz-night' },
      access: {
        read: hasFieldPermission('events', 'slug', 'read'),
        update: hasFieldPermission('events', 'slug', 'update'),
      },
    },

    {
      name: 'introText',
      type: 'textarea',
      label: { en: 'Short Description', nl: 'Korte beschrijving' },
      admin: {
        description: 'Shown on overview pages or social media previews.',
      },
    },

    {
      name: 'description',
      type: 'textarea',
      label: { en: 'Description' },
      admin: {
        description: 'Description.',
      },
    },

    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: { en: 'Header Image' },
    },

    {
      name: 'affiche',
      type: 'upload',
      relationTo: 'media',
      label: { en: 'Affiche' },
    },

    {
      name: 'venue',
      type: 'relationship',
      relationTo: 'shops',
      label: { en: 'Venue' },
      required: true,
    },

    {
      name: 'date',
      type: 'date',
      required: true,
      label: { en: 'Event Date' },
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },

    {
      name: 'end',
      type: 'date',
      label: { en: 'End Time' },
      admin: {
        description: 'Optional: when the event really ends (e.g. 2am for night shows)',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },

    {
      name: 'type',
      type: 'select',
      label: { en: 'Event Type', nl: 'Type evenement' },
      options: [
        { label: 'Theater', value: 'theater' },
        { label: 'Concert', value: 'concert' },
        { label: 'Dance', value: 'dance' },
        { label: 'Comedy', value: 'comedy' },
        { label: 'Musical', value: 'musical' },
        { label: 'Opera', value: 'opera' },
        { label: 'Children / Family', value: 'family' },
        { label: 'Talk / Lecture', value: 'talk' },
        { label: 'Workshop', value: 'workshop' },
        { label: 'Festival', value: 'festival' },
        { label: 'Other', value: 'other' },
      ],
      required: false,
    },

    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: false,
      label: { en: 'Published' },
      admin: {
        description: 'Unpublished events are not visible to the public',
        position: 'sidebar',
      },
    },

    {
      name: 'embedAllowed',
      type: 'checkbox',
      label: { en: 'Allow Embed on Organizer Website' },
      defaultValue: true,
    },

    {
      name: 'language',
      type: 'select',
      options: ['nl', 'fr', 'en', 'de'],
      defaultValue: 'nl',
      label: { en: 'Default Language' },
    },

    {
      name: 'seatMap',
      type: 'relationship',
      relationTo: 'seatMaps',
      label: { en: 'Seat Map', nl: 'Zaalplan' },
      admin: {
        description: {
          en: 'Optional seat map for this event. If provided, it enables seat selection in checkout.',
          nl: 'Optioneel zaalplan voor dit evenement. Activeert stoelkeuze bij checkout als ingevuld.',
        },
      },
      required: false,
    },

    {
      name: 'ticketTypes',
      type: 'array',
      label: 'Ticket Types',
      fields: [
        { name: 'id', type: 'text', required: true },
        { name: 'name', type: 'text', required: true },
        { name: 'price', type: 'number', required: true },
        { name: 'color', type: 'text' },
      ],
    },
    {
      name: 'seatAssignments',
      type: 'json',
      label: 'Seat Assignments',
      admin: { description: 'Map of seatId -> ticketTypeId' },
    },

    {
      name: 'performers',
      type: 'array',
      label: { en: 'Performers' },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: { en: 'Photo' },
        },
        {
          name: 'stageName',
          type: 'text',
          required: true,
          label: { en: 'Stage Name / Character' },
        },
        {
          name: 'realName',
          type: 'text',
          label: { en: 'Real Name' },
        },
        {
          name: 'socials',
          type: 'group',
          label: { en: 'Social Media' },
          fields: [
            { name: 'facebook', type: 'text' },
            { name: 'instagram', type: 'text' },
            { name: 'linkedin', type: 'text' },
            { name: 'x', type: 'text', label: 'X (Twitter)' },
          ],
        },
      ],
    },

    {
      name: 'sponsors',
      type: 'array',
      label: { en: 'Event Sponsors' },
      fields: [
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          label: { en: 'Sponsor Logo' },

        },
      ],
    },

    {
      name: 'faqs',
      type: 'array',
      label: { en: 'FAQs' },
      labels: {
        singular: 'FAQ',
        plural: 'FAQs',
      },
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
          label: { en: 'Question' },
        },
        {
          name: 'answer',
          type: 'textarea',
          required: true,
          label: { en: 'Answer' },
        },
      ],
    },

    {
      name: 'googleMapsIframe',
      type: 'textarea',
      label: { en: 'Google Maps Embed Iframe', nl: 'Google Maps iframe' },
      admin: {
        description: 'Paste the full iframe code from Google Maps share → embed map.',
        rows: 5,
      },
    },

    {
      name: 'location',
      type: 'select',
      required: false,
      label: { nl: 'Provincie', en: 'Province' },
      options: [
        'Antwerpen',
        'Vlaams-Brabant',
        'Waals-Brabant',
        'West-Vlaanderen',
        'Oost-Vlaanderen',
        'Henegouwen',
        'Luik',
        'Limburg',
        'Luxemburg',
        'Namen',
        'Brussels Hoofdstedelijk Gewest',
      ],

    },


  ],

  timestamps: true,
  versions: {
    drafts: true,
  },
}

export default Events
