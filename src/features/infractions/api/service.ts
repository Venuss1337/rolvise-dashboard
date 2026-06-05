import { fakeInfractionAppeals } from '@/constants/mock-api-infractions';
import type { InfractionAppeal } from './types';

export async function getInfractionAppeals(communityId: string): Promise<InfractionAppeal[]> {
  return fakeInfractionAppeals.getAppeals(communityId);
}
