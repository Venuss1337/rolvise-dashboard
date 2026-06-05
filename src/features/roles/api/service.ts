import { apiClient } from '@/lib/api-client';
import type {
  CommunityRole,
  CommunityRoleInput,
  CommunityRoleListResponse,
  CommunityRolePatchInput
} from './types';

export async function getCommunityRoles(
  organizationId: string,
  communityId: string
): Promise<CommunityRole[]> {
  if (!organizationId || !communityId) {
    return [];
  }

  const response = await apiClient<CommunityRoleListResponse>(
    `/organizations/${organizationId}/roles?serverId=${encodeURIComponent(communityId)}`
  );

  return response.items;
}

export async function createCommunityRole(
  organizationId: string,
  input: CommunityRoleInput
): Promise<CommunityRole> {
  return apiClient<CommunityRole>(`/organizations/${organizationId}/roles`, {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export async function updateCommunityRole(
  organizationId: string,
  roleId: string,
  input: CommunityRolePatchInput
): Promise<CommunityRole> {
  return apiClient<CommunityRole>(`/organizations/${organizationId}/roles/${roleId}`, {
    method: 'PATCH',
    body: JSON.stringify(input)
  });
}

export async function deleteCommunityRole(
  organizationId: string,
  roleId: string
): Promise<{ deleted: true }> {
  return apiClient<{ deleted: true }>(`/organizations/${organizationId}/roles/${roleId}`, {
    method: 'DELETE'
  });
}

export async function getCommunityRoleById(
  organizationId: string,
  communityId: string,
  roleId: string
): Promise<CommunityRole | undefined> {
  const roles = await getCommunityRoles(organizationId, communityId);

  return roles.find((role) => role.id === roleId);
}
