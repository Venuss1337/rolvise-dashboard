export type CommunityMemberRole = string;

export type CommunityMember = {
  id: string;
  communityId: string;
  discordAvatarUrl: string;
  displayName: string;
  discordUsername: string;
  roles: CommunityMemberRole[];
  joinedAt: string;
};

const members: CommunityMember[] = [
  {
    id: 'mason-ward',
    communityId: 'river-city-roleplay',
    discordAvatarUrl: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Mason',
    displayName: 'Chief Mason',
    discordUsername: 'mason.ward',
    roles: ['owner'],
    joinedAt: '2025-08-14T12:30:00.000Z'
  },
  {
    id: 'lena-cross',
    communityId: 'river-city-roleplay',
    discordAvatarUrl: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Lena',
    displayName: 'Lena C.',
    discordUsername: 'lena.cross',
    roles: ['command'],
    joinedAt: '2025-11-02T18:20:00.000Z'
  },
  {
    id: 'avery-stone',
    communityId: 'river-city-roleplay',
    discordAvatarUrl: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Avery',
    displayName: 'Avery',
    discordUsername: 'avery_stone',
    roles: ['command', 'moderator'],
    joinedAt: '2026-01-19T09:05:00.000Z'
  },
  {
    id: 'niko-hart',
    communityId: 'liberty-response-network',
    discordAvatarUrl: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Niko',
    displayName: 'Niko H.',
    discordUsername: 'niko.hart',
    roles: ['administrator'],
    joinedAt: '2025-09-25T16:45:00.000Z'
  },
  {
    id: 'riley-frost',
    communityId: 'liberty-response-network',
    discordAvatarUrl: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Riley',
    displayName: 'Riley',
    discordUsername: 'rileyfrost',
    roles: ['staff'],
    joinedAt: '2026-02-08T20:12:00.000Z'
  },
  {
    id: 'kai-morgan',
    communityId: 'erlc-training-hub',
    discordAvatarUrl: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Kai',
    displayName: 'Kai M.',
    discordUsername: 'kai.morgan',
    roles: ['trainer'],
    joinedAt: '2026-03-11T13:18:00.000Z'
  },
  {
    id: 'sophia-vale',
    communityId: 'erlc-training-hub',
    discordAvatarUrl: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Sophia',
    displayName: 'Sophia',
    discordUsername: 'sophia.vale',
    roles: ['trainer'],
    joinedAt: '2026-04-04T10:00:00.000Z'
  }
];

export type MemberSortKey = 'displayName' | 'discordUsername' | 'joinedAt';

export type MemberFilters = {
  communityId: string;
  search?: string;
  role?: string;
  sortBy?: MemberSortKey;
  sortDirection?: 'asc' | 'desc';
};

export const fakeCommunityMembers = {
  async getMembers(filters: MemberFilters): Promise<CommunityMember[]> {
    const search = filters.search?.toLowerCase().trim();

    const filteredMembers = members
      .filter((member) => member.communityId === filters.communityId)
      .filter((member) => {
        if (!search) return true;

        return (
          member.displayName.toLowerCase().includes(search) ||
          member.discordUsername.toLowerCase().includes(search)
        );
      })
      .filter((member) => {
        if (!filters.role || filters.role === 'all') return true;
        if (filters.role === 'none') return member.roles.length === 0;

        return member.roles.includes(filters.role);
      });

    const sortBy = filters.sortBy ?? 'displayName';
    const sortDirection = filters.sortDirection ?? 'asc';

    return filteredMembers.toSorted((firstMember, secondMember) => {
      const firstValue = firstMember[sortBy];
      const secondValue = secondMember[sortBy];
      const result = firstValue.localeCompare(secondValue);

      return sortDirection === 'asc' ? result : -result;
    });
  },

  async getMemberById(id: string): Promise<CommunityMember | undefined> {
    return members.find((member) => member.id === id);
  }
};
