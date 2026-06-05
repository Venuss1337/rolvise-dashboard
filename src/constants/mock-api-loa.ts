import { delay } from './mock-api';

export type LoaStatus = 'pending' | 'approved' | 'denied' | 'expired';

export type LoaRequest = {
  id: string;
  communityId: string;
  memberName: string;
  discordUsername: string;
  role: string;
  startsAt: string;
  endsAt: string;
  submittedAt: string;
  status: LoaStatus;
  reason: string;
  reviewedBy?: string;
};

const loaRequests: LoaRequest[] = [
  {
    id: 'loa-001',
    communityId: 'river-city-roleplay',
    memberName: 'Avery Stone',
    discordUsername: 'avery_stone',
    role: 'Moderator',
    startsAt: '2026-06-04',
    endsAt: '2026-06-08',
    submittedAt: '2026-06-01T10:35:00.000Z',
    status: 'pending',
    reason: 'Family trip, unavailable for weekend patrols.'
  },
  {
    id: 'loa-002',
    communityId: 'river-city-roleplay',
    memberName: 'Lena Cross',
    discordUsername: 'lena.cross',
    role: 'Command',
    startsAt: '2026-06-06',
    endsAt: '2026-06-07',
    submittedAt: '2026-06-01T16:20:00.000Z',
    status: 'pending',
    reason: 'Exam weekend.'
  },
  {
    id: 'loa-003',
    communityId: 'river-city-roleplay',
    memberName: 'Mason Ward',
    discordUsername: 'mason.ward',
    role: 'Owner',
    startsAt: '2026-05-24',
    endsAt: '2026-05-26',
    submittedAt: '2026-05-20T12:05:00.000Z',
    status: 'approved',
    reason: 'Work travel.',
    reviewedBy: 'Lena Cross'
  },
  {
    id: 'loa-004',
    communityId: 'river-city-roleplay',
    memberName: 'Noah Grant',
    discordUsername: 'grant.noah',
    role: 'Staff',
    startsAt: '2026-05-12',
    endsAt: '2026-05-13',
    submittedAt: '2026-05-10T18:20:00.000Z',
    status: 'denied',
    reason: 'Short notice before required patrol.',
    reviewedBy: 'Chief Mason'
  },
  {
    id: 'loa-005',
    communityId: 'river-city-roleplay',
    memberName: 'Riley Hart',
    discordUsername: 'rileyhart',
    role: 'Moderator',
    startsAt: '2026-04-30',
    endsAt: '2026-05-04',
    submittedAt: '2026-04-26T09:45:00.000Z',
    status: 'expired',
    reason: 'Medical leave.',
    reviewedBy: 'Lena Cross'
  },
  {
    id: 'loa-006',
    communityId: 'liberty-response-network',
    memberName: 'Niko Hart',
    discordUsername: 'niko.hart',
    role: 'Administrator',
    startsAt: '2026-06-03',
    endsAt: '2026-06-05',
    submittedAt: '2026-06-01T15:12:00.000Z',
    status: 'pending',
    reason: 'School exams.'
  },
  {
    id: 'loa-007',
    communityId: 'erlc-training-hub',
    memberName: 'Kai Morgan',
    discordUsername: 'kai.morgan',
    role: 'Trainer',
    startsAt: '2026-05-01',
    endsAt: '2026-05-03',
    submittedAt: '2026-04-28T14:18:00.000Z',
    status: 'approved',
    reason: 'Vacation.',
    reviewedBy: 'Sophia Vale'
  }
];

export const fakeLoaRequests = {
  async getLoaRequests(communityId: string) {
    await delay(250);

    return loaRequests.filter((request) => request.communityId === communityId);
  }
};
