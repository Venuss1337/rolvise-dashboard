import type { OrganizationRole } from '@/features/account/api/types';

export type ManagedServerRole = OrganizationRole;
export type ManagedServerStatus = 'online' | 'maintenance' | 'offline';

export interface ManagedServer {
  id: string;
  organizationId: string;
  name: string;
  imageSeed: string | null;
  role?: ManagedServerRole;
  status: ManagedServerStatus;
  robloxGroupId: string | null;
  joinCode: string;
  memberCount: number;
  staffCount: number;
  activePlayers: number;
  openIncidents: number;
  lastSessionAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ManagedServerListResponse {
  items: ManagedServer[];
  pageInfo: {
    hasNextPage: boolean;
    nextCursor: string | null;
  };
}
