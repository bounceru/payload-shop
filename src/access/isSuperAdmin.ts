// src/access/isSuperAdmin.ts
import type { Access } from 'payload'

export const isSuperAdmin: Access = ({ req }) => {
  if (!req?.user) return false;

  // Only "users" might have roles
  if (req.user.collection === 'users') {
    // Safely check `roles` now
    const hasSuperAdmin = Array.isArray(req.user.roles) &&
      req.user.roles.some((roleDoc: any) => roleDoc?.name === 'Super Admin');
    return hasSuperAdmin;
  }

  // If it's a "customer" or anything else, no "roles" array
  return false;
};