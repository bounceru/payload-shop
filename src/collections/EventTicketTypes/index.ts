// ───────────────────────────────────────────────────────────
// File: src/collections/EventTicketTypes/index.ts
// (replace the old TicketTypes/index.ts)
// ───────────────────────────────────────────────────────────
import type { CollectionConfig } from 'payload'

import { tenantField } from '@/fields/TenantField'
import { hasPermission, hasFieldPermission } from '@/access/permissionChecker'
import { baseListFilter } from './access/baseListFilter'   // <- keep your existing filter

export const EventTicketTypes: CollectionConfig = {
  /* ----------------  basic  ---------------- */
  slug: 'event-ticket-types',           // NEW slug to make intent explicit
  labels: {
    singular: { en: 'Ticket Type', nl: 'Tickettype' },
    plural: { en: 'Ticket Types', nl: 'Tickettypes' },
  },

  /* ----------------  ACL  ---------------- */
  access: {
    create: () => true,
    delete: () => true,
    read: () => true,
    update: () => true,
  },

  /* ----------------  Admin UI  ---------------- */
  admin: {
    useAsTitle: 'name',
    group: '🎫 Ticketing',
    baseListFilter,
    defaultColumns: [
      'event',            // show which event it belongs to
      'name',
      'price',
      'vatRate',
      'maxAmount',
      'visible',
    ],
  },


  /* ----------------  Fields  ---------------- */
  fields: [
    /* tenant MUST be first for ACL/filter hooks */
    tenantField,

    /* link to the event this type belongs to */
    {
      name: 'event',
      type: 'relationship',

      relationTo: 'events',
      required: false,
      label: { en: 'Event', nl: 'Evenement' },
      admin: {
        position: 'sidebar',
        description: {
          en: 'This ticket type is valid **only** for the selected event.',
        },
      },

    },

    /* link to a specific seat map (optional) */
    {
      name: 'seatMap',
      type: 'relationship',
      relationTo: 'seatMaps',
      required: false,
      label: { en: 'Seat Map', nl: 'Zaalplan' },
      admin: {
        position: 'sidebar',
        description: {
          en: 'Only available when editing the selected seat map.',
          nl: 'Alleen beschikbaar bij het bewerken van dit zaalplan.',
        },
      },

    },

    /* ------- taxonomy ------- */
    {
      name: 'name',
      type: 'text',
      required: true,
      label: { en: 'Name', nl: 'Naam' },
      admin: { description: 'E.g. VIP, Standard, Student' },

    },

    /* ------- pricing snapshot ------- */
    {
      name: 'price',
      type: 'number',
      required: true,
      label: { en: 'Price (€)', nl: 'Prijs (€)' },

    },
    {
      name: 'sortOrder',
      type: 'number',
      label: { en: 'Sort Order', nl: 'Sorteervolgorde' },
      admin: {
        description: 'Lower = shown first in checkout',
        position: 'sidebar',
      },
      required: false,
    },
    {
      name: 'vatRate',
      type: 'number',
      required: true,
      defaultValue: 21,
      label: { en: 'VAT Rate (%)', nl: 'Btw (%)' },
      admin: {
        description: 'Tax percentage applied to this ticket',
        position: 'sidebar',
      },

    },

    /* ------- availability / caps ------- */
    {
      name: 'maxAmount',
      type: 'number',
      required: false,
      defaultValue: 0,
      label: { en: 'Max Amount', nl: 'Maximaal aantal' },
      admin: {
        description:
          'Absolute cap for this ticket type (per **event**). The Tickets ' +
          'hook checks this when issuing tickets.',
      },

    },

    /* ------- marketing copy ------- */
    {
      name: 'description',
      type: 'textarea',
      label: { en: 'Description', nl: 'Beschrijving' },
      admin: { description: 'Shown to customers – e.g. “Includes free drink”.' },
    },
    {
      name: 'visible',
      type: 'checkbox',
      defaultValue: true,
      label: { en: 'Visible in checkout', nl: 'Zichtbaar in checkout' },
      admin: {
        description:
          'Untick to hide this type in the webshop while still allowing ' +
          'sales through magic links or POS.',
        position: 'sidebar',
      },
    },

    {
      name: 'color',
      type: 'text',
      label: 'Seat Color (Hex or #RRGGBB)',
      admin: {
        // Optionally, you could write a custom component or logic for color picking
        placeholder: '#FF0000 or any valid CSS color',
        description: 'Used to color seats in the seat map if isSeatBased is true.',
      },

    },

    /* ------- seat-map integration ------- */
    {
      name: 'isSeatBased',
      type: 'checkbox',
      defaultValue: false,
      label: { en: 'Seat-based?', nl: 'Stoelgebonden?' },
      admin: {
        description:
          'Enable if tickets of this type are tied to specific seats on a map.',
        position: 'sidebar',
      },
    },
  ],
}

export default EventTicketTypes
