import { queryOptions } from '@tanstack/react-query';
import { getPlayersOverTime } from './service';
import type { SessionAnalyticsFilters } from './types';

export const sessionKeys = {
  all: ['sessions'] as const,
  playersOverTime: (filters: SessionAnalyticsFilters) =>
    [...sessionKeys.all, 'players-over-time', filters] as const
};

export const playersOverTimeQueryOptions = (filters: SessionAnalyticsFilters) =>
  queryOptions({
    queryKey: sessionKeys.playersOverTime(filters),
    queryFn: () => getPlayersOverTime(filters)
  });
