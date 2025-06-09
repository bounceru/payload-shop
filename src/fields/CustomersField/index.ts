// File: src/fields/CustomersField/index.ts
import type { Field } from 'payload';

export const recipientsField: Field = {
    name: 'recipients',
    label: 'Specific Recipients (Customers)',
    type: 'array',
    fields: [
        {
            name: 'customerId',
            type: 'text',
            required: true,
            label: 'Customer ID',
        },
    ],
    admin: {
        // This references the named export from Field.tsx
        components: {
            Field: '@/fields/CustomersField/components/Field#CustomersFieldComponent',
        },
    },
};
