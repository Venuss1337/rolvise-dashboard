import { delay } from './mock-api';

export type InfractionAppealStatus = 'pending' | 'approved' | 'denied';

export type InfractionAppeal = {
  id: string;
  communityId: string;
  memberName: string;
  discordUsername: string;
  infractionType: string;
  reason: string;
  status: InfractionAppealStatus;
  submittedAt: string;
  assignedTo: string;
};

const appeals: InfractionAppeal[] = [
  {
    id: 'appeal-001',
    communityId: 'liberty-county-rp',
    memberName: 'Mason Reed',
    discordUsername: 'mason.reed',
    infractionType: 'Warning',
    reason: 'Appealing staff disrespect warning',
    status: 'pending',
    submittedAt: '2026-05-30T18:20:00.000Z',
    assignedTo: 'Command'
  },
  {
    id: 'appeal-002',
    communityId: 'liberty-county-rp',
    memberName: 'Avery Stone',
    discordUsername: 'averys',
    infractionType: 'Strike',
    reason: 'Claims patrol log was missing context',
    status: 'pending',
    submittedAt: '2026-05-29T11:05:00.000Z',
    assignedTo: 'Internal Affairs'
  },
  {
    id: 'appeal-003',
    communityId: 'liberty-county-rp',
    memberName: 'Noah Grant',
    discordUsername: 'grant.noah',
    infractionType: 'Suspension',
    reason: 'Requesting review of moderation decision',
    status: 'denied',
    submittedAt: '2026-05-24T20:45:00.000Z',
    assignedTo: 'Owner'
  },
  {
    id: 'appeal-004',
    communityId: 'river-city-response',
    memberName: 'Riley Hart',
    discordUsername: 'rileyhart',
    infractionType: 'Warning',
    reason: 'Appealing radio misuse warning',
    status: 'approved',
    submittedAt: '2026-05-27T14:30:00.000Z',
    assignedTo: 'Admin Team'
  },
  {
    id: 'appeal-005',
    communityId: 'statewide-operations',
    memberName: 'Jordan Vale',
    discordUsername: 'j.vale',
    infractionType: 'Strike',
    reason: 'Asking for evidence review',
    status: 'pending',
    submittedAt: '2026-05-28T16:10:00.000Z',
    assignedTo: 'Command'
  }
];

export const fakeInfractionAppeals = {
  records: appeals,

  async getAppeals(communityId: string) {
    await delay(250);

    return this.records.filter((appeal) => appeal.communityId === communityId);
  }
};
