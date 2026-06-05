import { fakeLoaRequests } from '@/constants/mock-api-loa';
import type { LoaRequest } from './types';

export async function getLoaRequests(communityId: string): Promise<LoaRequest[]> {
  return fakeLoaRequests.getLoaRequests(communityId);
}
