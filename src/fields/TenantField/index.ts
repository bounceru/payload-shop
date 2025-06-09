// File: /src/fields/TenantField/index.ts

import type { Field } from 'payload';
import { isSuperAdmin } from '../../access/isSuperAdmin';
import { tenantFieldUpdate } from './access/update';
import { autofillTenant } from './hooks/autofillTenant';

/**
 * If your `tenantFieldUpdate(args)` potentially returns a boolean OR a Where object,
 * we must unify that result into a pure boolean.
 * 
 * This helper does exactly that.
 */
async function forceBooleanUpdate(args: any): Promise<boolean> {
  // If superadmin => full access
  if (isSuperAdmin(args)) {
    return true;
  }

  // tenantFieldUpdate might return boolean or Where or Promise<...>
  const result = await tenantFieldUpdate(args);

  // If it's a boolean, return it
  if (typeof result === 'boolean') {
    return result;
  }

  // If it's a "Where" object (or anything else), interpret that as "true" or "false"
  // Typically, a Where object means "allowed with a filter" => treat as true
  return !!result;
}

export const tenantField: Field = {
  name: 'tenant',
  type: 'relationship',
  relationTo: 'tenants',
  hasMany: false,
  required: true,
  hooks: {
    beforeValidate: [autofillTenant],
  },
  access: {
    read: () => true,
    update: (args) => forceBooleanUpdate(args),
  },
  admin: {
    position: 'sidebar',
    components: {
      Field: '@/fields/TenantField/components/Field#TenantFieldComponent',
    },
    // You can make it readOnly in the Admin UI for normal users if you wish
    // readOnly: true,
  },
  index: true,
};
