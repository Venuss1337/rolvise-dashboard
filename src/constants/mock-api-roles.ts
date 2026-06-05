export type CommunityRole = {
  id: string;
  communityId: string;
  name: string;
  color: string;
  permissions: string[];
  memberCount: number;
};

const roles: CommunityRole[] = [
  {
    id: 'owner',
    communityId: 'river-city-roleplay',
    name: 'Owner',
    color: '#ef4444',
    permissions: ['manage users', 'manage servers', 'manage roles'],
    memberCount: 1
  },
  {
    id: 'command',
    communityId: 'river-city-roleplay',
    name: 'Command',
    color: '#3b82f6',
    permissions: ['manage users', 'manage servers'],
    memberCount: 2
  },
  {
    id: 'moderator',
    communityId: 'river-city-roleplay',
    name: 'Moderator',
    color: '#22c55e',
    permissions: ['manage users'],
    memberCount: 1
  },
  {
    id: 'administrator',
    communityId: 'liberty-response-network',
    name: 'Administrator',
    color: '#8b5cf6',
    permissions: ['manage users', 'manage servers', 'manage roles'],
    memberCount: 1
  },
  {
    id: 'staff',
    communityId: 'liberty-response-network',
    name: 'Staff',
    color: '#06b6d4',
    permissions: ['manage users'],
    memberCount: 1
  },
  {
    id: 'trainer',
    communityId: 'erlc-training-hub',
    name: 'Trainer',
    color: '#f59e0b',
    permissions: ['manage users', 'manage roles'],
    memberCount: 2
  }
];

export const fakeCommunityRoles = {
  async getRoles(communityId: string): Promise<CommunityRole[]> {
    return roles.filter((role) => role.communityId === communityId);
  },

  async getRoleById(communityId: string, roleId: string): Promise<CommunityRole | undefined> {
    return roles.find((role) => role.communityId === communityId && role.id === roleId);
  }
};
