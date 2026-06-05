import { fakeSessionAnalytics } from '@/constants/mock-api-sessions';
import type { SessionAnalyticsFilters, SessionPlayerPoint } from './types';

export async function getPlayersOverTime(
  filters: SessionAnalyticsFilters
): Promise<SessionPlayerPoint[]> {
  return fakeSessionAnalytics.getPlayersOverTime(filters);
}
