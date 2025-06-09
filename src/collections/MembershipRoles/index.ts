// File: src/collections/MembershipRoles.ts

import type { CollectionConfig } from 'payload';
import { tenantField } from '../../fields/TenantField';
import { shopsField } from '../../fields/ShopsField';
import { baseListFilter } from './access/baseListFilter';
import { hasPermission, hasFieldPermission } from '@/access/permissionChecker';

// This file ensures that for each shop in data.shops, there's at most one doc that can have defaultRole = true

export const MembershipRoles: CollectionConfig = {
    slug: 'membership-roles',

    // -------------------------
    // Collection-level Access
    // -------------------------
    access: {
        create: hasPermission('membership-roles', 'create'),
        delete: hasPermission('membership-roles', 'delete'),
        read: hasPermission('membership-roles', 'read'),
        update: hasPermission('membership-roles', 'update'),
    },

    admin: {
        baseListFilter,
        group: 'Shop Settings',
        useAsTitle: 'label',
        defaultColumns: ['label', 'value', 'loyaltyPrograms', 'shops'],
    },

    labels: {
        singular: { en: 'Membership Role' },
        plural: { en: 'Membership Roles' },
    },



    fields: [
        // 1) Tenant
        {
            ...tenantField,
        },

        // 2) Shops
        {
            ...shopsField,
        },

        // 3) Label
        {
            name: 'label',
            type: 'text',
            required: true,
            label: { en: 'Role Label' },
            admin: {
                description: { en: 'Display name (e.g. "VIP", "Gold").' },
            },
            access: {
                read: hasFieldPermission('membership-roles', 'label', 'read'),
                update: hasFieldPermission('membership-roles', 'label', 'update'),
            },
        },

        // 4) Value
        {
            name: 'value',
            type: 'text',
            required: true,
            label: { en: 'Role Value' },
            admin: {
                description: { en: 'Internal value (e.g. "vip", "gold").' },
            },
            access: {
                read: hasFieldPermission('membership-roles', 'value', 'read'),
                update: hasFieldPermission('membership-roles', 'value', 'update'),
            },
        },



        // 6) defaultRole
        {
            name: 'defaultRole',
            type: 'checkbox',
            required: false,
            defaultValue: false,
            label: { en: 'Default Role?' },
            admin: {
                description: {
                    en: 'If checked, auto-assign to new customers (who have no membership) for this tenant/shop.',
                },
            },
            access: {
                read: hasFieldPermission('membership-roles', 'defaultRole', 'read'),
                update: hasFieldPermission('membership-roles', 'defaultRole', 'update'),
            },
        },
    ],
};

export default MembershipRoles;
