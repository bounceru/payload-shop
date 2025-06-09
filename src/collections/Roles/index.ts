import { hasPermission, hasFieldPermission } from '@/access/permissionChecker';
import type { CollectionConfig } from 'payload';

const Roles: CollectionConfig = {
    slug: 'roles',

    access: {
        create: hasPermission('roles', 'create'),
        delete: hasPermission('roles', 'delete'),
        read: hasPermission('roles', 'read'),
        update: hasPermission('roles', 'update'),
    },

    admin: {
        useAsTitle: 'name',
        components: {
            views: {
                edit: {
                    root: { Component: '@/fields/custom-field/collections-field.tsx' },
                },
            },
        },
    },

    labels: {
        plural: {
            en: 'Roles',
            nl: 'Rollen',
            de: 'Rollen',
            fr: 'Rôles',
        },
        singular: {
            en: 'Role',
            nl: 'Rol',
            de: 'Rolle',
            fr: 'Rôle',
        },
    },

    fields: [
        {
            name: 'name',
            type: 'text',
            label: {
                en: 'Name',
                nl: 'Naam',
                de: 'Name',
                fr: 'Nom',
            },
            required: true,
        },
        {
            // The main array for both collection-level + field-level perms (unified UI)
            name: 'collections',
            type: 'array',
            admin: {
                components: {
                    // This references our single custom field that merges both sets of perms
                    Field: '@/fields/custom-field/collections-field.tsx',
                },
            },
            fields: [
                // The "item" structure for collection-level perms
                {
                    name: 'collectionName',
                    type: 'text',
                    label: {
                        en: 'Collection Name',
                        nl: 'Collectie Naam',
                        de: 'Collection Name',
                        fr: 'Nom de la collection',
                    },
                },
                {
                    name: 'read',
                    type: 'checkbox',
                    label: { en: 'Read', nl: 'Lezen', de: 'Lesen', fr: 'Lire' },
                },
                {
                    name: 'create',
                    type: 'checkbox',
                    label: { en: 'Create', nl: 'Aanmaken', de: 'Erstellen', fr: 'Créer' },
                },
                {
                    name: 'update',
                    type: 'checkbox',
                    label: { en: 'Update', nl: 'Bewerken', de: 'Bearbeiten', fr: 'Modifier' },
                },
                {
                    name: 'delete',
                    type: 'checkbox',
                    label: { en: 'Delete', nl: 'Verwijderen', de: 'Löschen', fr: 'Supprimer' },
                },
            ],
        },
        {
            // Hidden array for storing field-level perms in doc,
            // but not displayed in the normal form.
            name: 'fields',
            label: 'Field-level Permissions (Hidden)',
            type: 'array',
            admin: {
                hidden: true, // no default UI
            },
            fields: [
                {
                    name: 'collectionName',
                    type: 'text',
                    label: { en: 'Collection Name' },
                },
                {
                    name: 'fieldName',
                    type: 'text',
                    label: { en: 'Field Name' },
                },
                {
                    name: 'read',
                    type: 'checkbox',
                    label: { en: 'Read' },
                },
                {
                    name: 'create',
                    type: 'checkbox',
                    label: { en: 'Create' },
                },
                {
                    name: 'update',
                    type: 'checkbox',
                    label: { en: 'Update' },
                },
                {
                    name: 'delete',
                    type: 'checkbox',
                    label: { en: 'Delete' },
                },
            ],
        },
    ],
};

export default Roles;
