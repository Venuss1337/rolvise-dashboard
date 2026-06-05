import { delay } from './mock-api';

export type InboxCategory = 'infractions' | 'logs' | 'activity' | 'loa';

export type InboxPriority = 'normal' | 'important' | 'urgent';

export type InboxItem = {
  id: string;
  communityId: string;
  category: InboxCategory;
  priority: InboxPriority;
  title: string;
  subject: string;
  summary: string;
  body: string;
  actor: string;
  status: string;
  createdAt: string;
  unread: boolean;
  metadata: { label: string; value: string }[];
};

const inboxItems: InboxItem[] = [
  {
    id: 'inbox-infraction-001',
    communityId: 'river-city-roleplay',
    category: 'infractions',
    priority: 'urgent',
    title: 'Severe infraction issued',
    subject: 'Infraction review required',
    summary: 'A severe infraction was issued for radio abuse during an active patrol.',
    body: 'A staff member issued a severe infraction after reviewing patrol logs, voice notes, and two attached clips. The member can submit an appeal within the configured appeal window.',
    actor: 'Lena C.',
    status: 'Open',
    createdAt: '2026-06-01T16:20:00.000Z',
    unread: true,
    metadata: [
      { label: 'Member', value: 'Avery' },
      { label: 'Severity', value: 'Severe' },
      { label: 'Evidence', value: '2 attachments' }
    ]
  },
  {
    id: 'inbox-infraction-002',
    communityId: 'river-city-roleplay',
    category: 'infractions',
    priority: 'normal',
    title: 'Mild infraction logged',
    subject: 'Patrol conduct note',
    summary: 'A mild infraction was added after a missed patrol handoff.',
    body: 'The record was created as a lightweight conduct note. No action is required unless the member repeats the same pattern during the next patrol session.',
    actor: 'Chief Mason',
    status: 'Logged',
    createdAt: '2026-05-31T13:12:00.000Z',
    unread: false,
    metadata: [
      { label: 'Member', value: 'Lena C.' },
      { label: 'Severity', value: 'Mild' },
      { label: 'Points', value: '0' }
    ]
  },
  {
    id: 'inbox-log-001',
    communityId: 'river-city-roleplay',
    category: 'logs',
    priority: 'important',
    title: 'Role permissions changed',
    subject: 'Command role updated',
    summary: 'Manage users and manage roles were added to Command.',
    body: 'The Command role was edited from the Roles page. Permission count increased and the change was recorded in Audit Logs.',
    actor: 'Chief Mason',
    status: 'Recorded',
    createdAt: '2026-06-01T14:05:00.000Z',
    unread: true,
    metadata: [
      { label: 'Role', value: 'Command' },
      { label: 'Added', value: '2 permissions' },
      { label: 'Source', value: 'Roles' }
    ]
  },
  {
    id: 'inbox-log-002',
    communityId: 'river-city-roleplay',
    category: 'logs',
    priority: 'normal',
    title: 'Resource created',
    subject: 'New staff application',
    summary: 'A new application resource was created from Resources.',
    body: 'The resource is currently a placeholder card and will later connect to the real application builder.',
    actor: 'Avery',
    status: 'Recorded',
    createdAt: '2026-05-30T19:44:00.000Z',
    unread: false,
    metadata: [
      { label: 'Resource', value: 'Staff Application' },
      { label: 'Type', value: 'Application' }
    ]
  },
  {
    id: 'inbox-activity-001',
    communityId: 'river-city-roleplay',
    category: 'activity',
    priority: 'important',
    title: 'Session reached peak activity',
    subject: '38 players online',
    summary: 'The latest session reached the highest player count this week.',
    body: 'Player activity peaked during the first patrol rotation. The Sessions graph now shows the spike in the 24 hour view.',
    actor: 'System',
    status: 'New',
    createdAt: '2026-06-01T18:10:00.000Z',
    unread: true,
    metadata: [
      { label: 'Peak', value: '38 players' },
      { label: 'Session', value: 'Evening patrol' }
    ]
  },
  {
    id: 'inbox-activity-002',
    communityId: 'river-city-roleplay',
    category: 'activity',
    priority: 'normal',
    title: 'Member profile opened',
    subject: 'Profile inspection',
    summary: 'A staff profile was opened from Members.',
    body: 'This activity is informational and helps track profile views while the dashboard remains in mock mode.',
    actor: 'Chief Mason',
    status: 'Seen',
    createdAt: '2026-05-29T11:27:00.000Z',
    unread: false,
    metadata: [
      { label: 'Member', value: 'Lena C.' },
      { label: 'Page', value: 'Members' }
    ]
  },
  {
    id: 'inbox-loa-001',
    communityId: 'river-city-roleplay',
    category: 'loa',
    priority: 'important',
    title: 'LOA request submitted',
    subject: 'Four day leave request',
    summary: 'A moderator submitted LOA for June 4 to June 8.',
    body: 'The request is waiting for a command member to approve or deny it. The final LOA system can later connect this inbox item to the staff scheduling flow.',
    actor: 'Avery',
    status: 'Pending',
    createdAt: '2026-06-01T10:35:00.000Z',
    unread: true,
    metadata: [
      { label: 'From', value: '2026-06-04' },
      { label: 'To', value: '2026-06-08' },
      { label: 'Reason', value: 'Family trip' }
    ]
  },
  {
    id: 'inbox-loa-002',
    communityId: 'river-city-roleplay',
    category: 'loa',
    priority: 'normal',
    title: 'LOA request approved',
    subject: 'Weekend leave approved',
    summary: 'A weekend LOA request was approved by Command.',
    body: 'The staff member is marked unavailable for the requested weekend. No further action is needed.',
    actor: 'Lena C.',
    status: 'Approved',
    createdAt: '2026-05-25T12:18:00.000Z',
    unread: false,
    metadata: [
      { label: 'Member', value: 'Mason Ward' },
      { label: 'Duration', value: '2 days' }
    ]
  }
];

export const fakeInbox = {
  async getInboxItems(communityId: string) {
    await delay(200);

    return inboxItems.filter((item) => item.communityId === communityId);
  }
};
