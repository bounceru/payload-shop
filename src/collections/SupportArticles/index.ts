import type { CollectionConfig } from 'payload';
import { tenantField } from '@/fields/TenantField';
import { hasPermission } from '@/access/permissionChecker';

export const SupportArticles: CollectionConfig = {
    slug: 'support-articles',
    labels: {
        singular: { en: 'Support Article', nl: 'Hulpartikel' },
        plural: { en: 'Support Articles', nl: 'Hulpartikelen' },
    },
    access: {
        create: hasPermission('support-articles', 'create'),
        read: hasPermission('support-articles', 'read'),
        update: hasPermission('support-articles', 'update'),
        delete: hasPermission('support-articles', 'delete'),
    },
    admin: {
        useAsTitle: 'title',
        group: '📚 Support',
        defaultColumns: ['title', 'category', 'isPublic'],
    },
    fields: [
        tenantField,
        {
            name: 'title',
            type: 'text',
            required: true,
        },
        {
            name: 'slug',
            type: 'text',
            required: true,
            unique: true,
        },
        {
            name: 'category',
            type: 'text',
            required: false,
            admin: {
                description: 'Used to group articles in the frontend (e.g. "Login Issues").',
            },
        },
        {
            name: 'body',
            type: 'textarea',
            required: true,
            admin: {
                description: 'Markdown supported',
            },
        },
        {
            name: 'isPublic',
            type: 'checkbox',
            defaultValue: true,
            label: 'Visible to public?',
            admin: {
                position: 'sidebar',
            },
        },
    ],
    timestamps: true,
};

export default SupportArticles;
