import { apiClient } from '@/lib/api-client';
import type { ManagedServer, ManagedServerListResponse } from './types';

export async function getManagedServers(
  organizationId: string | null | undefined,
  role?: ManagedServer['role']
): Promise<ManagedServer[]> {
  if (!organizationId) {
    return [];
  }

  const response = await apiClient<ManagedServerListResponse>(
    `/organizations/${organizationId}/servers`
  );

  return response.items.map((server) => ({
    ...server,
    role
  }));
}

export async function getManagedServerById(
  organizationId: string | null | undefined,
  id: string,
  role?: ManagedServer['role']
): Promise<ManagedServer | undefined> {
  const servers = await getManagedServers(organizationId, role);

  return servers.find((server) => server.id === id);
}
