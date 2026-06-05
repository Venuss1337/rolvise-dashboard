import { queryOptions } from '@tanstack/react-query';
import { getCommunityMemberById, getCommunityMembers } from './service';
import type { MemberFilters } from './types';

export const memberKeys = {
  all: ['members'] as const,
  list: (filters: MemberFilters) => [...memberKeys.all, 'list', filters] as const,
  detail: (id: string) => [...memberKeys.all, 'detail', id] as const
};

export const membersQueryOptions = (filters: MemberFilters) =>
  queryOptions({
    queryKey: memberKeys.list(filters),
    queryFn: () => getCommunityMembers(filters)
  });

export const memberByIdOptions = (id: string) =>
  queryOptions({
    queryKey: memberKeys.detail(id),
    queryFn: () => getCommunityMemberById(id)
  });
