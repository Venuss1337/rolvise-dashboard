export const ROLE_PERMISSION_OPTIONS = ['manage users', 'manage servers', 'manage roles'] as const;

export type RolePermission = (typeof ROLE_PERMISSION_OPTIONS)[number];
