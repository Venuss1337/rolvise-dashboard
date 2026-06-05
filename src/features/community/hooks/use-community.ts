'use client';

import { useQuery } from '@tanstack/react-query';
import { serversQueryOptions } from '@/features/servers/api/queries';
import type { ManagedServer, ManagedServerRole } from '@/features/servers/api/types';
import { useSelectedServer } from '@/features/servers/hooks/use-selected-server';

type CommunityPermission =
  | 'community:view'
  | 'community:manage'
  | 'staff:view'
  | 'staff:manage'
  | 'cases:view'
  | 'cases:manage'
  | 'settings:manage';

const rolePermissions: Record<ManagedServerRole, CommunityPermission[]> = {
  Owner: [
    'community:view',
    'community:manage',
    'staff:view',
    'staff:manage',
    'cases:view',
    'cases:manage',
    'settings:manage'
  ],
  Admin: ['community:view', 'staff:view', 'staff:manage', 'cases:view', 'cases:manage'],
  Moderator: ['community:view', 'staff:view', 'cases:view', 'cases:manage']
};

export type CommunityUser = {
  id: string;
  name: string;
  email: string;
};

export function useCommunity() {
  const { data: communities = [], isLoading } = useQuery(serversQueryOptions());
  const { selectedServer, selectedServerId, selectServer } = useSelectedServer(communities);
  const role = selectedServer?.role ?? null;
  const permissions = role ? rolePermissions[role] : [];

  return {
    isLoaded: !isLoading,
    user: {
      id: 'mock-user',
      name: 'ER:LC Manager',
      email: 'owner@erlc.community'
    } satisfies CommunityUser,
    communities,
    community: selectedServer,
    communityId: selectedServerId,
    role,
    permissions,
    hasCommunity: !!selectedServer,
    switchCommunity: selectServer,
    can: (permission: CommunityPermission) => permissions.includes(permission)
  };
}

export type Community = ManagedServer;
