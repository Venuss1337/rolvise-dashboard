import { apiClient } from '@/lib/api-client';
import type { CreateDashboardInviteInput, DashboardInvite } from './types';

export async function createDashboardInvite(
  organizationId: string,
  input: CreateDashboardInviteInput
): Promise<DashboardInvite> {
  return apiClient<DashboardInvite>(`/organizations/${organizationId}/invites`, {
    method: 'POST',
    body: JSON.stringify(input)
  });
}
