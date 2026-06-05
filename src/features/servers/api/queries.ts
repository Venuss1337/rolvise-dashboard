import { queryOptions } from '@tanstack/react-query';
import { getManagedServerById, getManagedServers } from './service';

export const serverKeys = {
  all: ['servers'] as const,
  list: (organizationId: string | null | undefined) =>
    [...serverKeys.all, 'list', organizationId] as const,
  detail: (organizationId: string | null | undefined, id: string) =>
    [...serverKeys.all, 'detail', organizationId, id] as const
};

export const serversQueryOptions = (
  organizationId?: string | null,
  role?: Parameters<typeof getManagedServers>[1]
) =>
  queryOptions({
    queryKey: serverKeys.list(organizationId),
    queryFn: () => getManagedServers(organizationId, role)
  });

export const serverByIdOptions = (
  organizationId: string | null | undefined,
  id: string,
  role?: Parameters<typeof getManagedServers>[1]
) =>
  queryOptions({
    queryKey: serverKeys.detail(organizationId, id),
    queryFn: () => getManagedServerById(organizationId, id, role)
  });
