import { apiClient } from '@/lib/api-client';
import type { CommunityMember, CommunityMemberListResponse, MemberFilters } from './types';

export async function getCommunityMembers(filters: MemberFilters): Promise<CommunityMember[]> {
  if (!filters.organizationId || !filters.communityId) {
    return [];
  }

  const params = new URLSearchParams({
    serverId: filters.communityId,
    sortBy: filters.sortBy,
    sortDirection: filters.sortDirection
  });

  if (filters.search) {
    params.set('search', filters.search);
  }

  if (filters.role) {
    params.set('role', filters.role);
  }

  const response = await apiClient<CommunityMemberListResponse>(
    `/organizations/${filters.organizationId}/members?${params.toString()}`
  );

  return response.items;
}

export async function getCommunityMemberById(_id: string): Promise<CommunityMember | undefined> {
  return undefined;
}
