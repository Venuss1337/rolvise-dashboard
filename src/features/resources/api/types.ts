export type {
  CommunityResource,
  CommunityResourceCreatePayload,
  CommunityResourceType
} from '@/constants/mock-api-resources';

export type ResourceFilters = {
  communityId: string;
  search?: string;
};
