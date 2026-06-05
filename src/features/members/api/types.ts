import type { CommunityMember } from '@/lib/rolvise-backend/types';

export type { CommunityMember };

export type MemberSortKey = 'displayName' | 'discordUsername' | 'joinedAt';

export interface MemberFilters {
  organizationId: string;
  communityId: string;
  search?: string;
  role?: string;
  sortBy: MemberSortKey;
  sortDirection: 'asc' | 'desc';
}

export interface CommunityMemberListResponse {
  items: CommunityMember[];
}
