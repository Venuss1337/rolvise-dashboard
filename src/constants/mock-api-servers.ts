export type ManagedServerRole = 'Owner' | 'Admin' | 'Moderator';

export type ManagedServerStatus = 'online' | 'maintenance' | 'offline';

export type ManagedServer = {
  id: string;
  name: string;
  imageSeed: string;
  role: ManagedServerRole;
  status: ManagedServerStatus;
  robloxGroupId: string;
  joinCode: string;
  memberCount: number;
  staffCount: number;
  activePlayers: number;
  openIncidents: number;
  lastSessionAt: string;
};

const servers: ManagedServer[] = [
  {
    id: 'river-city-roleplay',
    name: 'River City Roleplay',
    imageSeed: 'RCR',
    role: 'Owner',
    status: 'online',
    robloxGroupId: '14582011',
    joinCode: 'RCRP',
    memberCount: 4821,
    staffCount: 42,
    activePlayers: 31,
    openIncidents: 7,
    lastSessionAt: '2026-05-31T17:45:00.000Z'
  },
  {
    id: 'liberty-response-network',
    name: 'Liberty Response Network',
    imageSeed: 'LRN',
    role: 'Admin',
    status: 'online',
    robloxGroupId: '18244091',
    joinCode: 'LRN',
    memberCount: 1934,
    staffCount: 18,
    activePlayers: 16,
    openIncidents: 3,
    lastSessionAt: '2026-05-31T15:20:00.000Z'
  },
  {
    id: 'erlc-training-hub',
    name: 'ER:LC Training Hub',
    imageSeed: 'ETH',
    role: 'Moderator',
    status: 'maintenance',
    robloxGroupId: '20819472',
    joinCode: 'TRAIN',
    memberCount: 624,
    staffCount: 9,
    activePlayers: 0,
    openIncidents: 1,
    lastSessionAt: '2026-05-30T21:10:00.000Z'
  }
];

export const fakeManagedServers = {
  async getServers(): Promise<ManagedServer[]> {
    return servers;
  },

  async getServerById(id: string): Promise<ManagedServer | undefined> {
    return servers.find((server) => server.id === id);
  }
};
