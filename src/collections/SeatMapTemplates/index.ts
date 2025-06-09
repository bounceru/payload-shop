import type { CollectionConfig } from 'payload';
import { baseListFilter } from '../SeatMaps/access/baseListFilter';  // or wherever you have your “baseListFilter”
import { hasPermission, hasFieldPermission } from '@/access/permissionChecker';
// If you have a "tenantField", decide if seatmap templates are truly global or also tied to a tenant:
import { tenantField } from '@/fields/TenantField'; // optional
import CustomAPIError from '@/errors/CustomAPIError';

export const SeatMapTemplates: CollectionConfig = {
    slug: 'seat-map-templates',

    // Access: decide if these templates are global to all or restricted
    access: {
        // Possibly only certain roles can create:
        create: hasPermission('seat-map-templates', 'create'),
        read: hasPermission('seat-map-templates', 'read'),
        update: hasPermission('seat-map-templates', 'update'),
        delete: hasPermission('seat-map-templates', 'delete'),
    },

    admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'rows', 'columns'],
        baseListFilter,
    },

    labels: {
        singular: {
            en: 'Seat Map Template',
            nl: 'Stoelplan-sjabloon',
        },
        plural: {
            en: 'Seat Map Templates',
            nl: 'Stoelplan-sjablonen',
        },
    },

    fields: [
        // Optionally tie to tenant if you want them separate per-tenant:
        // tenantField,  // (Only if you want these “template seatmaps” also to be tenant-specific)

        {
            name: 'name',
            type: 'text',
            required: true,
            label: { en: 'Template Name', nl: 'Naam' },
            access: {
                read: hasFieldPermission('seat-map-templates', 'name', 'read'),
                update: hasFieldPermission('seat-map-templates', 'name', 'update'),
            },
        },
        {
            name: 'rows',
            type: 'number',
            required: true,
            defaultValue: 0,
            label: 'Rows',
            access: {
                read: hasFieldPermission('seat-map-templates', 'rows', 'read'),
                update: hasFieldPermission('seat-map-templates', 'rows', 'update'),
            },
        },
        {
            name: 'columns',
            type: 'number',
            required: true,
            defaultValue: 0,
            label: 'Columns',
            access: {
                read: hasFieldPermission('seat-map-templates', 'columns', 'read'),
                update: hasFieldPermission('seat-map-templates', 'columns', 'update'),
            },
        },
        {
            name: 'basePrice',
            type: 'number',
            label: 'Base Price',
            defaultValue: 0,
            access: {
                read: hasFieldPermission('seat-map-templates', 'basePrice', 'read'),
                update: hasFieldPermission('seat-map-templates', 'basePrice', 'update'),
            },
        },
        {
            name: 'curve',
            type: 'number',
            label: 'Curve (arc factor)',
            defaultValue: 16,
            access: {
                read: hasFieldPermission('seat-map-templates', 'curve', 'read'),
                update: hasFieldPermission('seat-map-templates', 'curve', 'update'),
            },
        },
        {
            name: 'rowFormat',
            type: 'select',
            label: 'Row Label Format',
            defaultValue: 'Numeric',
            options: [
                { value: 'Numeric', label: 'Numeric' },
                { value: 'Letter', label: 'Letter' },
                { value: 'RNumber', label: 'R#' },
                { value: 'RowNumber', label: 'Row#' },
                { value: 'Continuous', label: 'Continuous' },
            ],
            access: {
                read: hasFieldPermission('seat-map-templates', 'rowFormat', 'read'),
                update: hasFieldPermission('seat-map-templates', 'rowFormat', 'update'),
            },
        },
        {
            name: 'colFormat',
            type: 'select',
            label: 'Column Label Format',
            defaultValue: 'Numeric',
            options: [
                { value: 'Numeric', label: 'Numeric' },
                { value: 'Letter', label: 'Letter' },
                { value: 'RNumber', label: 'C#' },
                { value: 'RowNumber', label: 'Col#' },
                { value: 'Continuous', label: 'Continuous' },
            ],
            access: {
                read: hasFieldPermission('seat-map-templates', 'colFormat', 'read'),
                update: hasFieldPermission('seat-map-templates', 'colFormat', 'update'),
            },
        },
        {
            name: 'seats',
            type: 'json', // We can store the seat array in a JSON field
            label: 'Seat Layout JSON',
            required: true,
            defaultValue: [],
            admin: {
                // Possibly show a code editor or custom UI
                // Or we keep it hidden in the admin
                condition: () => false, // hide from standard admin
            },
            access: {
                read: hasFieldPermission('seat-map-templates', 'seats', 'read'),
                update: hasFieldPermission('seat-map-templates', 'seats', 'update'),
            },
        },

        // Possibly a "public" boolean or "published" to let others see it:
        {
            name: 'isPublic',
            type: 'checkbox',
            label: 'Is Public Template?',
            defaultValue: false,
            access: {
                read: hasFieldPermission('seat-map-templates', 'isPublic', 'read'),
                update: hasFieldPermission('seat-map-templates', 'isPublic', 'update'),
            },
        },
    ],
};

export default SeatMapTemplates;
