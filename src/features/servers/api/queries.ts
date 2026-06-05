import { queryOptions } from '@tanstack/react-query';
import { getManagedServerById, getManagedServers } from './service';

export const serverKeys = {
  all: ['servers'] as const,
  list: () => [...serverKeys.all, 'list'] as const,
  detail: (id: string) => [...serverKeys.all, 'detail', id] as const
};

export const serversQueryOptions = () =>
  queryOptions({
    queryKey: serverKeys.list(),
    queryFn: getManagedServers
  });

export const serverByIdOptions = (id: string) =>
  queryOptions({
    queryKey: serverKeys.detail(id),
    queryFn: () => getManagedServerById(id)
  });
