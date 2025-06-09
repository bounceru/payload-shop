import type { Access } from 'payload';
import { parseCookies } from 'payload';

import { isSuperAdmin } from '../../../access/isSuperAdmin';
import { getTenantAccessIDs } from '../../../utilities/getTenantAccessIDs';

export const filterByTenantRead: Access = (args) => {
  const { req } = args;
  const cookies = parseCookies(req.headers);
  const superAdmin = isSuperAdmin(args);
  const selectedTenant = cookies.get('payload-tenant');

  // Safely narrow the user to 'User'
  const userDoc = req.user?.collection === 'users' ? req.user : null;
  // If we have a userDoc, getTenantAccessIDs(...) else empty array
  const tenantAccessIDs = userDoc ? getTenantAccessIDs(userDoc) : [];

  // First check for manually selected tenant from cookies
  if (selectedTenant) {
    // If it's a super admin, give read access only for that tenant
    if (superAdmin) {
      return {
        tenant: {
          equals: selectedTenant,
        },
      };
    }

    const hasTenantAccess = tenantAccessIDs.some((id) => id === selectedTenant);

    // If NOT super admin, give them access only if they have that tenant
    if (hasTenantAccess) {
      return {
        tenant: {
          equals: selectedTenant,
        },
      };
    }
  }

  // If no selected tenant but super admin => access to all
  if (superAdmin) {
    return true;
  }

  // If not super admin but has tenant(s) => only those
  if (tenantAccessIDs.length) {
    return {
      tenant: {
        in: tenantAccessIDs,
      },
    };
  }

  // Deny all else
  return false;
};

export const canMutatePage: Access = (args) => {
  const { req } = args;
  const superAdmin = isSuperAdmin(args);

  // If no user, deny
  if (!req.user) {
    return false;
  }

  // Super admins can mutate pages for any tenant
  if (superAdmin) {
    return true;
  }

  const cookies = parseCookies(req.headers);
  const selectedTenant = cookies.get('payload-tenant');

  // If user is not actually from 'users' => no 'tenants' array => deny
  if (req.user.collection !== 'users') {
    return false;
  }

  // Otherwise, userDoc is definitely a "User" => safe to read `tenants`
  return (
    req.user.tenants?.reduce((hasAccess: boolean, accessRow) => {
      if (hasAccess) {
        return true;
      }
      if (
        accessRow &&
        accessRow.tenant === selectedTenant &&
        accessRow.roles?.includes('tenant-admin')
      ) {
        return true;
      }
      return hasAccess;
    }, false) || false
  );
};
