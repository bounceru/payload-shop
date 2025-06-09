import type { CollectionConfig } from 'payload';
import { tenantField } from '../../fields/TenantField';
import { hasPermission, hasFieldPermission } from '@/access/permissionChecker';
import { baseListFilter } from './access/baseListFilter';

export const SeatMaps: CollectionConfig = {
    slug: 'seatMaps',

    access: {
        create: hasPermission('seatMaps', 'create'),
        delete: hasPermission('seatMaps', 'delete'),
        read: hasPermission('seatMaps', 'read'),
        update: hasPermission('seatMaps', 'update'),
    },

    admin: {
        useAsTitle: 'name',
        group: '🎫 Ticketing',
        baseListFilter,
        defaultColumns: ['name', 'venue', 'rows', 'columns'],
        components: {
            views: {
                edit: {
                    root: { Component: '@/components/admin/SeatMapEditor.tsx' },
                },
            },
        },
    },

    labels: {
        singular: { en: 'Seat Map', nl: 'Zaalplan' },
        plural: { en: 'Seat Maps', nl: 'Zaalplannen' },
    },

    fields: [
        tenantField,

        {
            name: 'name',
            type: 'text',
            required: true,
            label: { en: 'Name', nl: 'Naam' },
            admin: {
                description: 'Internal name (e.g., Theaterzaal Standaard)',
            },
            access: {
                read: hasFieldPermission('seatMaps', 'name', 'read'),
                update: hasFieldPermission('seatMaps', 'name', 'update'),
            },
        },

        {
            name: 'venue',
            type: 'relationship',
            relationTo: 'shops',
            required: true,
            label: { en: 'Venue' },
        },

        {
            name: 'rows',
            type: 'number',
            required: true,
            label: { en: 'Rows' },
        },
        {
            name: 'columns',
            type: 'number',
            required: true,
            label: { en: 'Columns' },
        },


        {
            name: 'curve',
            type: 'number',
            label: { en: 'curve: range of -60 to 60' },
            required: false,
            defaultValue: 24,
        },
        {
            name: 'seats',
            type: 'array',
            label: { en: 'Seats' },
            admin: { description: 'Each row/seat combo with type and optional pricing' },
            fields: [
                { name: 'row', type: 'text', required: true, label: 'Row' },
                { name: 'seat', type: 'text', required: true, label: 'Seat' },
                {
                    name: 'pinnedRow',
                    type: 'number',
                    label: 'Pinned Row Index',
                    required: true,
                },
                {
                    name: 'pinnedCol',
                    type: 'number',
                    label: 'Pinned Column Index',
                    required: true,

                },
                {
                    name: 'locks',  // New field for storing locks per event
                    type: 'array',
                    fields: [
                        { name: 'eventId', type: 'text', required: true },
                        { name: 'lockedUntil', type: 'date', required: true },
                    ]
                },
                { name: 'status', type: 'text', label: 'Status' },

                // new fields you’ve introduced:
                { name: 'purpose', type: 'text', required: false },
                { name: 'groupLabel', type: 'text', required: false },

                // 3) Group release order
                {
                    name: 'groupReleaseOrder',
                    type: 'number',
                    required: false,
                    label: 'Group Release Priority',
                    admin: {
                        description:
                            'If you want seats in group 1 to sell out before group 2 are purchasable, give group 1 a lower number than group 2, etc.',
                    },
                },

                // 4) Minimum seats sold in *this* group required before unlocking the *next* group
                {
                    name: 'groupMinToReleaseNext',
                    type: 'number',
                    required: false,
                    label: 'Min Seats to Sell Before Next Group',
                    admin: {
                        description:
                            'How many seats in this group must be sold before the next group (with a higher groupReleaseOrder) is unlocked?',
                    },
                },


            ],
        },

        {
            name: 'seatMapJSON',
            type: 'json',
            label: 'Raw Layout Data',
            admin: { hidden: true }, // hide from UI
        },

        {
            name: 'backgroundImage',
            type: 'upload',
            relationTo: 'media',
            label: { en: 'Background Image' },
            admin: {
                description: 'Optional background to show under seat grid (like SVG)',
            },
        },

        {
            name: "rowFormat",
            type: "select",
            label: { en: "Row Format" },
            required: false,
            defaultValue: "Numeric",
            options: [
                { label: "Numeric", value: "Numeric" },
                { label: "Letter", value: "Letter" },
                { label: "RNumber", value: "RNumber" },
                { label: "RowNumber", value: "RowNumber" },
                { label: "Continuous", value: "Continuous" },
            ],
            admin: {
                description: "How row labels are displayed (Numeric, Letter, etc.)",
            },
        },
        {
            name: "colFormat",
            type: "select",
            label: { en: "Column Format" },
            required: false,
            defaultValue: "Numeric",
            options: [
                { label: "Numeric", value: "Numeric" },
                { label: "Letter", value: "Letter" },
                { label: "RNumber", value: "RNumber" },
                { label: "RowNumber", value: "RowNumber" },
                { label: "Continuous", value: "Continuous" },
            ],
            admin: {
                description: "How column (seat) labels are displayed (Numeric, Continuous, etc.)",
            },
        },

        {
            name: 'isDefault',
            type: 'checkbox',
            defaultValue: false,
            label: 'Default Map for This Venue',
            admin: { position: 'sidebar' },
        },
    ],
};

export default SeatMaps;
