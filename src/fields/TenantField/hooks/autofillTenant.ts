// src/fields/TenantField/hooks/autofillTenant.ts
import type { FieldHook } from 'payload'

import { getTenantAccessIDs } from '../../../utilities/getTenantAccessIDs'

export const autofillTenant: FieldHook = ({ req, value, data }) => {
  console.log('Running autofillTenant Hook');
  console.log('Current Value:', value);
  console.log('User:', req.user);

  if (!value) {
    const userDoc = req.user?.collection === 'users' ? req.user : null;
    const tenantIDs = userDoc ? getTenantAccessIDs(userDoc) : [];;
    console.log('Tenant Access IDs:', tenantIDs);

    if (tenantIDs.length === 1) {
      console.log('Autofilling Tenant ID:', tenantIDs[0]);
      if (data) {
        data.tenant = tenantIDs[0]; // Explicitly set the tenant ID
      }
      return tenantIDs[0];
    }
  }

  return value;
};


