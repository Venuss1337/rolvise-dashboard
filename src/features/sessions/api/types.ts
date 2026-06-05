import type { SessionRange } from '@/constants/mock-api-sessions';

export type { SessionPlayerPoint, SessionRange } from '@/constants/mock-api-sessions';

export type SessionAnalyticsFilters = {
  communityId: string;
  range: SessionRange;
};
