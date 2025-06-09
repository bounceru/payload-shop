// File: /src/collections/ShopSettings/ShopBranding/access/byTenant.ts
import type { Access } from 'payload'
import { isSuperAdmin } from '../../../access/isSuperAdmin'
import { getTenantAccessIDs } from '../../../utilities/getTenantAccessIDs'

export const canMutateBranding: Access = ({ req }) => {
    const superAdmin = isSuperAdmin({ req })
    if (superAdmin) {
        return true
    }

    const userDoc = req.user?.collection === 'users' ? req.user : null;
    const tenantIDs = userDoc ? getTenantAccessIDs(userDoc) : [];
    return {
        tenant: {
            in: tenantIDs,
        },
    }
}
