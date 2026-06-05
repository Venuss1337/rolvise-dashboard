import { queryOptions } from '@tanstack/react-query';
import { getCommunityRoleById, getCommunityRoles } from './service';

export const roleKeys = {
  all: ['roles'] as const,
  list: (communityId: string) => [...roleKeys.all, 'list', communityId] as const,
  detail: (communityId: string, roleId: string) =>
    [...roleKeys.all, 'detail', communityId, roleId] as const
};

export const rolesQueryOptions = (communityId: string) =>
  queryOptions({
    queryKey: roleKeys.list(communityId),
    queryFn: () => getCommunityRoles(communityId)
  });

export const roleByIdOptions = (communityId: string, roleId: string) =>
  queryOptions({
    queryKey: roleKeys.detail(communityId, roleId),
    queryFn: () => getCommunityRoleById(communityId, roleId)
  });
