import { fakeCommunityRoles } from '@/constants/mock-api-roles';
import type { CommunityRole } from './types';

export async function getCommunityRoles(communityId: string): Promise<CommunityRole[]> {
  return fakeCommunityRoles.getRoles(communityId);
}

export async function getCommunityRoleById(
  communityId: string,
  roleId: string
): Promise<CommunityRole | undefined> {
  return fakeCommunityRoles.getRoleById(communityId, roleId);
}
