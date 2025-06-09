// File: src/collections/Coupons/index.ts

import type { CollectionConfig } from 'payload';
import { tenantField } from '../../fields/TenantField';
import { baseListFilter } from './access/baseListFilter';
import { hasPermission, hasFieldPermission } from '@/access/permissionChecker';

export const Coupons: CollectionConfig = {
    slug: 'coupons',

    access: {
        create: hasPermission('coupons', 'create'),
        delete: hasPermission('coupons', 'delete'),
        read: hasPermission('coupons', 'read'),
        update: hasPermission('coupons', 'update'),
    },

    admin: {
        group: '🎫 Ticketing',
        useAsTitle: 'code',
        baseListFilter,
        defaultColumns: ['code', 'discountType', 'value', 'usageLimit', 'used'],
    },

    labels: {
        singular: { en: 'Coupon', nl: 'Kortingscode' },
        plural: { en: 'Coupons', nl: 'Kortingscodes' },
    },

    hooks: {
        beforeValidate: [
            async ({ data, req, operation }) => {
                if (operation !== 'create') return;

                const tenantId =
                    typeof (data?.tenant) === 'object' ? data.tenant.id : data?.tenant ?? null;
                const code = data?.code?.trim() ?? '';

                if (!tenantId || !code) return;

                const existing = await req.payload.find({
                    collection: 'coupons',
                    where: {
                        tenant: { equals: tenantId },
                        code: { equals: code },
                    },
                });

                if (existing.totalDocs > 0) {
                    throw new Error('This code already exists for your tenant.');
                }
            },
        ],
    },

    fields: [
        tenantField,

        {
            name: 'code',
            type: 'text',
            required: true,
            label: { en: 'Coupon Code', nl: 'Kortingscode' },
            admin: {
                description: {
                    en: 'The code customers enter during checkout.',
                    nl: 'De code die klanten ingeven tijdens checkout.',
                },
            },
            access: {
                read: hasFieldPermission('coupons', 'code', 'read'),
                update: hasFieldPermission('coupons', 'code', 'update'),
            },
        },

        {
            name: 'discountType',
            type: 'select',
            required: true,
            defaultValue: 'fixed',
            options: [
                { label: { en: 'Fixed Amount (€)', nl: 'Vast bedrag (€)' }, value: 'fixed' },
                { label: { en: 'Percentage (%)', nl: 'Percentage (%)' }, value: 'percentage' },
            ],
            label: { en: 'Discount Type', nl: 'Type Korting' },
        },

        {
            name: 'value',
            type: 'number',
            required: true,
            label: { en: 'Discount Value', nl: 'Korting' },
            admin: {
                description: {
                    en: 'The fixed amount or percentage (depending on type)',
                    nl: 'Het vaste bedrag of percentage (afhankelijk van het type)',
                },
            },
        },

        {
            name: 'event',
            type: 'relationship',
            relationTo: 'events',
            required: false,
            label: { en: 'Event (optional)', nl: 'Evenement (optioneel)' },
            admin: {
                description: 'Only valid for this event if set',
            },
        },

        {
            name: 'ticketType',
            type: 'relationship',
            relationTo: 'event-ticket-types',
            required: false,
            label: { en: 'Ticket Type (optional)', nl: 'Tickettype (optioneel)' },
            admin: {
                description: 'Only valid for this ticket type if set',
            },
        },

        {
            name: 'validFrom',
            type: 'date',
            label: { en: 'Valid From', nl: 'Geldig vanaf' },
        },

        {
            name: 'validUntil',
            type: 'date',
            label: { en: 'Valid Until', nl: 'Geldig tot' },
        },

        {
            name: 'usageLimit',
            type: 'number',
            label: { en: 'Usage Limit', nl: 'Gebruiksbeperking' },
            admin: {
                description: {
                    en: 'Max number of times this code can be used',
                    nl: 'Maximum aantal keer dat deze code gebruikt mag worden',
                },
            },
        },

        {
            name: 'used',
            type: 'number',
            defaultValue: 0,
            admin: {
                readOnly: true,
                description: {
                    en: 'Number of times this code has been used',
                    nl: 'Aantal keren gebruikt',
                },
            },
        },

        {
            name: 'enabled',
            type: 'checkbox',
            label: { en: 'Active?', nl: 'Actief?' },
            defaultValue: true,
        },

        {
            name: 'note',
            type: 'textarea',
            label: { en: 'Internal Note', nl: 'Interne Notitie' },
            admin: {
                description: 'Only visible in admin panel',
            },
        },
    ],
};

export default Coupons;
