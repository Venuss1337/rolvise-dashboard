'use client';

import { useQuery } from '@tanstack/react-query';
import { accountQueryOptions } from '@/features/account/api/queries';
import { serversQueryOptions } from '@/features/servers/api/queries';
import type { ManagedServer, ManagedServerRole } from '@/features/servers/api/types';
import { useSelectedServer } from '@/features/servers/hooks/use-selected-server';

type CommunityPermission =
  | 'mdt:open'
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
  Moderator: ['mdt:open', 'community:view', 'staff:view', 'cases:view', 'cases:manage'],
  Member: ['mdt:open']
};

export type CommunityUser = {
  id: string;
  name: string;
  email: string;
};

export function useCommunity() {
  const { data: account, isLoading: isAccountLoading } = useQuery(accountQueryOptions());
  const activeOrganization = account?.organizations.find(
    (organization) => organization.id === account.activeOrganizationId
  );
  const role = activeOrganization?.role ?? null;
  const permissions = activeOrganization?.permissions ?? (role ? rolePermissions[role] : []);
  const { data: communities = [], isLoading: isServersLoading } = useQuery(
    serversQueryOptions(account?.activeOrganizationId, role ?? undefined)
  );
  const { selectedServer, selectedServerId, selectServer } = useSelectedServer(
    communities,
    account?.activeOrganizationId
  );

  return {
    isLoaded: !isAccountLoading && !isServersLoading,
    user: {
      id: account?.user.id ?? '',
      name: account?.discord.globalName ?? account?.discord.username ?? account?.user.name ?? '',
      email: account?.user.email ?? account?.discord.username ?? ''
    } satisfies CommunityUser,
    account,
    organizations: account?.organizations ?? [],
    organization: activeOrganization ?? null,
    organizationId: account?.activeOrganizationId ?? null,
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
