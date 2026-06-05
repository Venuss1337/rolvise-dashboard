import { queryOptions } from '@tanstack/react-query';
import { getInfractionAppeals } from './service';

export const infractionKeys = {
  all: ['infractions'] as const,
  appeals: (communityId: string) => [...infractionKeys.all, 'appeals', communityId] as const
};

export const infractionAppealsQueryOptions = (communityId: string) =>
  queryOptions({
    queryKey: infractionKeys.appeals(communityId),
    queryFn: () => getInfractionAppeals(communityId)
  });
