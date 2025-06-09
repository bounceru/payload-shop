import type { Field, FieldHook } from 'payload';

export const shopsField: Field = {
    name: 'shops',
    type: 'relationship',
    relationTo: 'shops',
    hasMany: true, // Allow linking to multiple shops
    required: true,
    // hooks: {
    //     beforeValidate: [validateShops], // Add validation hook
    // },
    access: {
        read: () => true, // Shops are publicly readable
        update: () => true, // Controlled through hooks and filters
    },
    admin: {
        components: {
            Field: '@/fields/ShopsField/components/Field#ShopsFieldComponent',
        },
        position: 'sidebar',
    },
};
