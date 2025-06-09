import type { BaseListFilter } from 'payload';
import { isSuperAdmin } from '@/access/isSuperAdmin';
import { getTenantAccessIDs } from '@/utilities/getTenantAccessIDs';
import { parseCookies } from 'payload';

export const baseListFilter: BaseListFilter = (args) => {
    const req = args.req;
    const cookies = parseCookies(req.headers);
    const superAdmin = isSuperAdmin(args);
    const selectedTenant = cookies.get('payload-tenant');
    const userDoc = req.user?.collection === 'users' ? req.user : null;
    const tenantAccessIDs = userDoc ? getTenantAccessIDs(userDoc) : [];

    // Filter list based on tenant access
    if (selectedTenant && (superAdmin || tenantAccessIDs.some((id) => id === selectedTenant))) {
        return {
            tenant: {
                equals: selectedTenant,
            },
        };
    }

    // Allow full list for super admins or rely on default access control
    return null;
};
