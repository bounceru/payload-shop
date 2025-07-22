// File: hasPermissionChecker.ts
export function hasPermissionChecker({
                                       resource,
                                       action,
                                       fieldName,        // <-- optional, e.g. "fallbackImage"
                                       isSuperAdmin,
                                       roles,
                                     }: {
  resource: string; // e.g. "categories"
  action: 'read' | 'create' | 'update' | 'delete';
  fieldName?: string; // optional field name, e.g. "fallbackImage"
  isSuperAdmin: boolean;
  roles: string[];
}) {
  // 1) Super admin => always allowed
  if (isSuperAdmin) return true

  // 2) If a fieldName is specified => check for e.g. "categories.fallbackImage.update"
  if (fieldName) {
    const neededFieldRole = `${resource}.${fieldName}.${action}`
    return roles.includes(neededFieldRole)
  }

  // 3) Otherwise, check resource-level => "categories.update"
  const neededRole = `${resource}.${action}`
  return roles.includes(neededRole)
}
