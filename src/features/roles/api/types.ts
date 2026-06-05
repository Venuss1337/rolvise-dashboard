import type { CommunityRole } from '@/lib/rolvise-backend/types';

export type { CommunityRole };

export interface CommunityRoleListResponse {
  items: CommunityRole[];
}

export interface CommunityRoleInput {
  serverId: string;
  name: string;
  color: string;
  permissions: string[];
}

export interface CommunityRolePatchInput {
  name?: string;
  color?: string;
  permissions?: string[];
}
