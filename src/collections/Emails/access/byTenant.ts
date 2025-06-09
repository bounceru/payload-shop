// File: src/collections/Emails/access/byTenant.ts
import type { Access } from 'payload';
import { isSuperAdmin } from '@/access/isSuperAdmin';
import { getTenantAccessIDs } from '@/utilities/getTenantAccessIDs';

export const canMutateEmail: Access = ({ req }) => {
    const superAdmin = isSuperAdmin({ req });
    if (superAdmin) return true;

    const userDoc = req.user?.collection === 'users' ? req.user : null;
    const tenantAccessIDs = userDoc ? getTenantAccessIDs(userDoc) : [];

    // The access object: "tenant must be in user’s tenantAccessIDs"
    return {
        tenant: {
            in: tenantAccessIDs,
        },
    };
};
