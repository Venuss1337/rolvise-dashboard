import { NavGroup } from '@/types';

/**
 * Navigation configuration with RBAC support
 *
 * This configuration is used for both the sidebar navigation and Cmd+K bar.
 * Items are organized into groups, each rendered with a SidebarGroupLabel.
 *
 * RBAC Access Control:
 * Each navigation item can have an `access` property that controls visibility
 * based on permissions, plans, features, roles, and organization context.
 *
 * Examples:
 *
 * 1. Require organization:
 *    access: { requireOrg: true }
 *
 * 2. Require specific permission:
 *    access: { requireOrg: true, permission: 'org:teams:manage' }
 *
 * 3. Require specific plan:
 *    access: { plan: 'pro' }
 *
 * 4. Require specific feature:
 *    access: { feature: 'premium_access' }
 *
 * 5. Require specific role:
 *    access: { role: 'admin' }
 *
 * 6. Multiple conditions (all must be true):
 *    access: { requireOrg: true, permission: 'org:teams:manage', plan: 'pro' }
 *
 * Note: The `visible` function is deprecated but still supported for backward compatibility.
 * Use the `access` property for new items.
 */
export const navGroups: NavGroup[] = [
  {
    label: 'ER:LC Management',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard/overview',
        icon: 'dashboard',
        isActive: false,
        shortcut: ['d', 'd'],
        items: [],
        access: { permission: 'community:view' }
      },
      {
        title: 'My Inbox',
        url: '/dashboard/my-inbox',
        icon: 'notification',
        isActive: false,
        shortcut: ['i', 'b'],
        items: [],
        access: { permission: 'community:view' }
      },
      {
        title: 'Analytics',
        url: '/dashboard/analytics',
        icon: 'trendingUp',
        isActive: false,
        shortcut: ['a', 'n'],
        items: [],
        access: { permission: 'community:manage' }
      },
      {
        title: 'Open MDT',
        url: '#mdt',
        icon: 'code',
        isActive: false,
        shortcut: ['m', 'd'],
        items: [],
        access: { permission: 'mdt:open' }
      },
      {
        title: 'Servers',
        url: '/dashboard/servers',
        icon: 'server',
        isActive: false,
        shortcut: ['s', 's'],
        items: [],
        access: { hideWhenCommunitySelected: true }
      },
      {
        title: 'Members',
        url: '/dashboard/members',
        icon: 'teams',
        isActive: false,
        shortcut: ['m', 'm'],
        items: [],
        access: { permission: 'staff:view' }
      },
      {
        title: 'Roles',
        url: '/dashboard/roles',
        icon: 'badgeCheck',
        isActive: false,
        shortcut: ['r', 'r'],
        items: [],
        access: { permission: 'settings:manage' }
      },
      {
        title: 'Resources',
        url: '/dashboard/resources',
        icon: 'forms',
        isActive: false,
        shortcut: ['r', 'e'],
        items: [],
        access: { permission: 'community:view' }
      },
      {
        title: 'Sessions',
        url: '/dashboard/sessions',
        icon: 'trendingUp',
        isActive: false,
        shortcut: ['s', 'e'],
        items: [],
        access: { permission: 'community:view' }
      },
      {
        title: 'Leave Of Absence',
        url: '/dashboard/leave-of-absence',
        icon: 'calendar',
        isActive: false,
        shortcut: ['l', 'a'],
        items: [],
        access: { permission: 'community:view' }
      },
      {
        title: 'Infractions',
        url: '/dashboard/infractions',
        icon: 'warning',
        isActive: false,
        shortcut: ['i', 'n'],
        items: [],
        access: { permission: 'cases:view' }
      },
      {
        title: 'Audit Logs',
        url: '/dashboard/audit-logs',
        icon: 'adjustments',
        isActive: false,
        shortcut: ['a', 'l'],
        items: [],
        access: { permission: 'settings:manage' }
      },
      {
        title: 'Integrations',
        url: '/dashboard/integrations',
        icon: 'galleryVerticalEnd',
        isActive: false,
        shortcut: ['s', 't'],
        items: [],
        access: { permission: 'settings:manage' }
      }
    ]
  }
];
