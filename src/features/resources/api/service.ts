import { fakeResources } from '@/constants/mock-api-resources';
import type { CommunityResource, CommunityResourceCreatePayload, ResourceFilters } from './types';

export async function getCommunityResources(
  filters: ResourceFilters
): Promise<CommunityResource[]> {
  return fakeResources.getResources(filters);
}

export async function createCommunityResource(
  data: CommunityResourceCreatePayload
): Promise<CommunityResource> {
  return fakeResources.createResource(data);
}
