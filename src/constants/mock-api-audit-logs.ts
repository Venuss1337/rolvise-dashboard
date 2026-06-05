import { delay } from './mock-api';

export type AuditLogType =
  | 'member'
  | 'role'
  | 'session'
  | 'resource'
  | 'infraction'
  | 'appeal'
  | 'settings'
  | 'auth';

export type AuditLogSeverity = 'info' | 'warning' | 'critical';

export type AuditLog = {
  id: string;
  communityId: string;
  type: AuditLogType;
  severity: AuditLogSeverity;
  action: string;
  actor: string;
  target: string;
  summary: string;
  ipAddress: string;
  createdAt: string;
};

const auditLogs: AuditLog[] = [
  {
    id: 'aud-001',
    communityId: 'river-city-roleplay',
    type: 'appeal',
    severity: 'info',
    action: 'Appeal approved',
    actor: 'Chief Mason',
    target: 'Avery',
    summary: 'Approved warning appeal after staff review.',
    ipAddress: '192.168.12.41',
    createdAt: '2026-06-01T14:38:00.000Z'
  },
  {
    id: 'aud-002',
    communityId: 'river-city-roleplay',
    type: 'infraction',
    severity: 'warning',
    action: 'Infraction created',
    actor: 'Lena C.',
    target: 'Avery',
    summary: 'Moderate infraction created with two attachments.',
    ipAddress: '192.168.12.18',
    createdAt: '2026-06-01T13:22:00.000Z'
  },
  {
    id: 'aud-003',
    communityId: 'river-city-roleplay',
    type: 'role',
    severity: 'info',
    action: 'Role reordered',
    actor: 'Chief Mason',
    target: 'Moderator',
    summary: 'Moved Moderator below Command.',
    ipAddress: '192.168.12.41',
    createdAt: '2026-05-31T20:16:00.000Z'
  },
  {
    id: 'aud-004',
    communityId: 'river-city-roleplay',
    type: 'settings',
    severity: 'critical',
    action: 'ER:LC key changed',
    actor: 'Chief Mason',
    target: 'ER:LC Settings',
    summary: 'Join key was updated from the settings panel.',
    ipAddress: '192.168.12.41',
    createdAt: '2026-05-30T18:05:00.000Z'
  },
  {
    id: 'aud-005',
    communityId: 'river-city-roleplay',
    type: 'session',
    severity: 'info',
    action: 'Session started',
    actor: 'Lena C.',
    target: 'River City Roleplay',
    summary: 'Patrol session started from Sessions.',
    ipAddress: '192.168.12.18',
    createdAt: '2026-05-30T17:30:00.000Z'
  },
  {
    id: 'aud-006',
    communityId: 'river-city-roleplay',
    type: 'member',
    severity: 'info',
    action: 'Member profile viewed',
    actor: 'Chief Mason',
    target: 'Lena C.',
    summary: 'Opened member profile from Members.',
    ipAddress: '192.168.12.41',
    createdAt: '2026-05-28T12:44:00.000Z'
  },
  {
    id: 'aud-007',
    communityId: 'river-city-roleplay',
    type: 'resource',
    severity: 'info',
    action: 'Resource created',
    actor: 'Avery',
    target: 'Untitled Form',
    summary: 'Created a new form resource.',
    ipAddress: '192.168.12.77',
    createdAt: '2026-05-25T21:13:00.000Z'
  },
  {
    id: 'aud-008',
    communityId: 'river-city-roleplay',
    type: 'auth',
    severity: 'warning',
    action: 'Mock login',
    actor: 'Chief Mason',
    target: 'Dashboard',
    summary: 'Signed in through mock auth.',
    ipAddress: '192.168.12.41',
    createdAt: '2026-05-21T09:03:00.000Z'
  },
  {
    id: 'aud-009',
    communityId: 'river-city-roleplay',
    type: 'appeal',
    severity: 'warning',
    action: 'Appeal denied',
    actor: 'Lena C.',
    target: 'Niko H.',
    summary: 'Denied appeal after evidence check.',
    ipAddress: '192.168.12.18',
    createdAt: '2026-05-12T16:28:00.000Z'
  },
  {
    id: 'aud-010',
    communityId: 'river-city-roleplay',
    type: 'settings',
    severity: 'info',
    action: 'Discord log channel changed',
    actor: 'Chief Mason',
    target: 'Discord Settings',
    summary: 'Updated log channel to #staff-logs.',
    ipAddress: '192.168.12.41',
    createdAt: '2026-04-19T10:20:00.000Z'
  },
  {
    id: 'aud-011',
    communityId: 'river-city-roleplay',
    type: 'role',
    severity: 'critical',
    action: 'Role deleted',
    actor: 'Chief Mason',
    target: 'Trial Moderator',
    summary: 'Deleted role with zero assigned members.',
    ipAddress: '192.168.12.41',
    createdAt: '2026-03-14T19:45:00.000Z'
  },
  {
    id: 'aud-012',
    communityId: 'liberty-response-network',
    type: 'session',
    severity: 'info',
    action: 'Session ended',
    actor: 'Niko H.',
    target: 'Liberty Response Network',
    summary: 'Session ended after 92 minutes.',
    ipAddress: '172.16.4.22',
    createdAt: '2026-06-01T11:12:00.000Z'
  },
  {
    id: 'aud-013',
    communityId: 'liberty-response-network',
    type: 'member',
    severity: 'warning',
    action: 'Member managed',
    actor: 'Niko H.',
    target: 'Riley',
    summary: 'Opened manage user action.',
    ipAddress: '172.16.4.22',
    createdAt: '2026-05-27T14:39:00.000Z'
  },
  {
    id: 'aud-014',
    communityId: 'erlc-training-hub',
    type: 'resource',
    severity: 'info',
    action: 'Application created',
    actor: 'Kai M.',
    target: 'Trainer Application',
    summary: 'Created application resource.',
    ipAddress: '10.8.20.9',
    createdAt: '2026-05-29T22:06:00.000Z'
  },
  {
    id: 'aud-015',
    communityId: 'erlc-training-hub',
    type: 'settings',
    severity: 'warning',
    action: 'Strict patrol mode enabled',
    actor: 'Sophia',
    target: 'ER:LC Settings',
    summary: 'Enabled strict patrol mode.',
    ipAddress: '10.8.20.13',
    createdAt: '2026-04-02T08:31:00.000Z'
  }
];

export const fakeAuditLogs = {
  records: auditLogs,

  async getAuditLogs(communityId: string) {
    await delay(250);

    return this.records.filter((log) => log.communityId === communityId);
  }
};
