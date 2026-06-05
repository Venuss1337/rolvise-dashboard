'use client';

import { useCommunity } from '@/features/community/hooks/use-community';
import type { NavItem, NavGroup } from '@/types';

type CommunityNavContext = ReturnType<typeof useCommunity>;

function filterNavItems(items: NavItem[], context: CommunityNavContext) {
  const communitySelected = context.isLoaded && context.hasCommunity;

  function isItemVisible(item: NavItem) {
    const access = item.access;

    if (!access) return true;
    if (access.hideWhenCommunitySelected && communitySelected) return false;
    if (access.requireOrg && !communitySelected) return false;
    if (access.permission && !context.can(access.permission as Parameters<typeof context.can>[0])) {
      return false;
    }
    if (access.role && context.role !== access.role) return false;

    return true;
  }

  return items.filter(isItemVisible).map((item) => ({
    ...item,
    items: item.items ? item.items.filter(isItemVisible) : item.items
  }));
}

/**
 * Hook to filter navigation items based on RBAC (fully client-side)
 *
 * @param items - Array of navigation items to filter
 * @returns Filtered items
 */
export function useFilteredNavItems(items: NavItem[]) {
  const context = useCommunity();

  return filterNavItems(items, context);
}

/**
 * Hook to filter navigation groups based on RBAC (fully client-side)
 *
 * @param groups - Array of navigation groups to filter
 * @returns Filtered groups (empty groups are removed)
 */
export function useFilteredNavGroups(groups: NavGroup[]) {
  const context = useCommunity();

  return groups
    .map((group) => ({
      ...group,
      items: filterNavItems(group.items, context)
    }))
    .filter((group) => group.items.length > 0);
}
