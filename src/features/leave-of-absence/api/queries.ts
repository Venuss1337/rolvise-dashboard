import { queryOptions } from '@tanstack/react-query';
import { getLoaRequests } from './service';

export const loaKeys = {
  all: ['leave-of-absence'] as const,
  list: (communityId: string) => [...loaKeys.all, 'list', communityId] as const
};

export const loaRequestsQueryOptions = (communityId: string) =>
  queryOptions({
    queryKey: loaKeys.list(communityId),
    queryFn: () => getLoaRequests(communityId)
  });
