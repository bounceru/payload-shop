// File: src/collections/EmailLogs/index.ts

import type { CollectionConfig } from 'payload';
import { tenantField } from '../../fields/TenantField';
import { shopsField } from '../../fields/ShopsField';
import { baseListFilter } from './access/baseListFilter';
// ^ Or wherever you store baseListFilter

import {
    hasPermission,
    hasFieldPermission,
} from '@/access/permissionChecker';

const EmailLogs: CollectionConfig = {
    slug: 'email-logs',
    labels: {
        singular: {
            en: 'Email Log',
            nl: 'E-maillog',
            // Add other locales if you like
        },
        plural: {
            en: 'Email Logs',
            nl: 'E-maillogs',
        },
    },
    admin: {
        baseListFilter,            // same pattern as your other collections
        useAsTitle: 'subject',     // or 'to' or 'status', whichever you prefer
        defaultColumns: ['subject', 'to', 'status', 'errorMessage'],
    },

    // Collection-level access
    access: {
        create: hasPermission('email-logs', 'create'),
        read: hasPermission('email-logs', 'read'),
        update: hasPermission('email-logs', 'update'),
        delete: hasPermission('email-logs', 'delete'),
    },

    fields: [
        // Link to tenant
        {
            ...tenantField,
            // Optionally override field-level access if needed
            // or you can define them inline:

        },

        // Link to shops
        {
            ...shopsField,

        },

        {
            name: 'to',
            type: 'text',
            label: 'Recipient',
            required: true,
            admin: {
                description: 'The email address that we attempted to send to.',
            },
            access: {
                read: hasFieldPermission('email-logs', 'to', 'read'),
                update: hasFieldPermission('email-logs', 'to', 'update'),
            },
        },
        {
            name: 'from',
            type: 'text',
            label: 'From',
            required: true,
            admin: {
                description: 'The “From” address used, e.g. "ShopName <no-reply@...>"',
            },
            access: {
                read: hasFieldPermission('email-logs', 'from', 'read'),
                update: hasFieldPermission('email-logs', 'from', 'update'),
            },
        },
        {
            name: 'subject',
            type: 'text',
            label: 'Subject',
            required: false,
            admin: {
                description: 'Subject line that was used in the email.',
            },
            access: {
                read: hasFieldPermission('email-logs', 'subject', 'read'),
                update: hasFieldPermission('email-logs', 'subject', 'update'),
            },
        },
        {
            name: 'status',
            type: 'select',
            label: 'Status',
            defaultValue: 'pending',
            options: [
                { label: 'Pending', value: 'pending' },
                { label: 'Success', value: 'success' },
                { label: 'Failed', value: 'failed' },
            ],
            admin: {
                description: 'Did it succeed or fail?',
            },
            access: {
                read: hasFieldPermission('email-logs', 'status', 'read'),
                update: hasFieldPermission('email-logs', 'status', 'update'),
            },
        },

        {
            name: 'emailType',
            type: 'select',
            required: false,
            label: 'Type',
            options: [
                { label: 'Ticket Confirmation', value: 'ticket_confirmation' },
                { label: 'Magic Link Login', value: 'magic_link' },
                { label: 'Password Reset', value: 'reset_password' },
                { label: 'Marketing', value: 'marketing' },
                { label: 'Custom', value: 'custom' },
            ],
            admin: {
                description: 'Categorize the email for filtering and stats.',
            },
        },
        {
            name: 'customer',
            type: 'relationship',
            relationTo: 'customers',
            label: 'Customer (optional)',
        },


        {
            name: 'errorMessage',
            type: 'textarea', // or 'text'
            label: 'Error Message',
            required: false,
            admin: {
                description: 'If it failed, store the error text or reason here.',
            },
            access: {
                read: hasFieldPermission('email-logs', 'errorMessage', 'read'),
                update: hasFieldPermission('email-logs', 'errorMessage', 'update'),
            },
        },
        {
            name: 'htmlBodySnippet',
            type: 'textarea',
            label: 'HTML Snippet',
            required: false,
            admin: {
                description: 'Optionally store some or all of the email’s HTML body. (Truncate if large.)',
            },
            access: {
                read: hasFieldPermission('email-logs', 'htmlBodySnippet', 'read'),
                update: hasFieldPermission('email-logs', 'htmlBodySnippet', 'update'),
            },
        },
    ],
};

export default EmailLogs;
