import { queryOptions } from '@tanstack/react-query';
import { getInboxItems } from './service';

export const inboxKeys = {
  all: ['my-inbox'] as const,
  list: (communityId: string) => [...inboxKeys.all, 'list', communityId] as const
};

export const inboxItemsQueryOptions = (communityId: string) =>
  queryOptions({
    queryKey: inboxKeys.list(communityId),
    queryFn: () => getInboxItems(communityId)
  });
