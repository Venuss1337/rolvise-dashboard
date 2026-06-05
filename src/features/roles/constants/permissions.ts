export const ROLE_PERMISSION_OPTIONS = [
  'mdt:open',
  'community:view',
  'community:manage',
  'staff:view',
  'staff:manage',
  'cases:view',
  'cases:manage',
  'settings:manage'
] as const;

export type RolePermission = (typeof ROLE_PERMISSION_OPTIONS)[number];
