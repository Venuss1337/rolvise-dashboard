import { fakeCommunityMembers } from '@/constants/mock-api-members';
import type { CommunityMember, MemberFilters } from './types';

export async function getCommunityMembers(filters: MemberFilters): Promise<CommunityMember[]> {
  return fakeCommunityMembers.getMembers(filters);
}

export async function getCommunityMemberById(id: string): Promise<CommunityMember | undefined> {
  return fakeCommunityMembers.getMemberById(id);
}
