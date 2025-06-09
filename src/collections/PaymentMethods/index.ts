import type { CollectionConfig } from 'payload';

import { tenantField } from '../../fields/TenantField';
import { shopsField } from '../../fields/ShopsField';
import { hasPermission, hasFieldPermission } from '@/access/permissionChecker';
import { baseListFilter } from './access/baseListFilter';
import { filterByTenantRead, canMutate } from './access/byTenant';

export const PaymentMethods: CollectionConfig = {
    slug: 'payment-methods',

    access: {
        create: canMutate,
        delete: canMutate,
        read: filterByTenantRead,
        update: canMutate,
    },

    admin: {
        group: '💶 Payments',
        useAsTitle: 'provider',
        baseListFilter,
        defaultColumns: ['provider', 'enabled'],
    },

    labels: {
        singular: { en: 'Payment Method', nl: 'Betaalmethode' },
        plural: { en: 'Payment Methods', nl: 'Betaalmethoden' },
    },

    fields: [
        tenantField,
        shopsField,
        {
            name: 'provider',
            type: 'select',
            required: true,
            options: [
                { label: 'Mollie', value: 'mollie' },
            ],
            label: { en: 'Provider', nl: 'Provider' },
        },
        {
            name: 'mollie_settings',
            type: 'group',
            admin: { condition: (data) => data.provider === 'mollie' },
            fields: [
                { name: 'enable_test_mode', type: 'checkbox', defaultValue: false, label: 'Test Mode' },
                { name: 'live_api_key', type: 'text', label: 'Live API Key' },
                { name: 'test_api_key', type: 'text', label: 'Test API Key' },
                { name: 'webhook_secret', type: 'text', label: 'Webhook Secret' },
            ],
        },
        {
            name: 'enabled',
            type: 'checkbox',
            defaultValue: true,
            label: { en: 'Enabled', nl: 'Ingeschakeld' },
        },
    ],
};

export default PaymentMethods;
