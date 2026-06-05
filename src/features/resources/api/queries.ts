import { queryOptions } from '@tanstack/react-query';
import { getCommunityResources } from './service';
import type { ResourceFilters } from './types';

export const resourceKeys = {
  all: ['resources'] as const,
  list: (filters: ResourceFilters) => [...resourceKeys.all, 'list', filters] as const
};

export const resourcesQueryOptions = (filters: ResourceFilters) =>
  queryOptions({
    queryKey: resourceKeys.list(filters),
    queryFn: () => getCommunityResources(filters)
  });
