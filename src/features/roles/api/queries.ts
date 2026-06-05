import { queryOptions } from '@tanstack/react-query';
import { getCommunityRoleById, getCommunityRoles } from './service';

export const roleKeys = {
  all: ['roles'] as const,
  list: (organizationId: string, communityId: string) =>
    [...roleKeys.all, 'list', organizationId, communityId] as const,
  detail: (organizationId: string, communityId: string, roleId: string) =>
    [...roleKeys.all, 'detail', organizationId, communityId, roleId] as const
};

export const rolesQueryOptions = (organizationId: string, communityId: string) =>
  queryOptions({
    queryKey: roleKeys.list(organizationId, communityId),
    queryFn: () => getCommunityRoles(organizationId, communityId)
  });

export const roleByIdOptions = (organizationId: string, communityId: string, roleId: string) =>
  queryOptions({
    queryKey: roleKeys.detail(organizationId, communityId, roleId),
    queryFn: () => getCommunityRoleById(organizationId, communityId, roleId)
  });
