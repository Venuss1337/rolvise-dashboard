import { matchSorter } from 'match-sorter';
import { delay } from './mock-api';

export type CommunityResourceType = 'document' | 'form' | 'application';

export type CommunityResource = {
  id: string;
  communityId: string;
  title: string;
  type: CommunityResourceType;
  owner: string;
  updatedAt: string;
};

type ResourceFilters = {
  communityId: string;
  search?: string;
};

export type CommunityResourceCreatePayload = {
  communityId: string;
  title: string;
  type: CommunityResourceType;
  owner: string;
};

const resources: CommunityResource[] = [
  {
    id: 'res-liberty-handbook',
    communityId: 'liberty-county-rp',
    title: 'Staff Handbook',
    type: 'document',
    owner: 'Command',
    updatedAt: '2026-05-26T14:30:00.000Z'
  },
  {
    id: 'res-liberty-report',
    communityId: 'liberty-county-rp',
    title: 'Patrol Report',
    type: 'form',
    owner: 'Moderation',
    updatedAt: '2026-05-28T18:10:00.000Z'
  },
  {
    id: 'res-liberty-staff-app',
    communityId: 'liberty-county-rp',
    title: 'Staff Application',
    type: 'application',
    owner: 'Owners',
    updatedAt: '2026-05-29T09:20:00.000Z'
  },
  {
    id: 'res-river-city-rules',
    communityId: 'river-city-response',
    title: 'Server Rules',
    type: 'document',
    owner: 'Owners',
    updatedAt: '2026-05-24T11:40:00.000Z'
  },
  {
    id: 'res-river-city-mod-app',
    communityId: 'river-city-response',
    title: 'Moderator Application',
    type: 'application',
    owner: 'Admin Team',
    updatedAt: '2026-05-27T16:50:00.000Z'
  },
  {
    id: 'res-statewide-case-review',
    communityId: 'statewide-operations',
    title: 'Case Review',
    type: 'form',
    owner: 'Command',
    updatedAt: '2026-05-25T20:15:00.000Z'
  }
];

export const fakeResources = {
  records: resources,

  async getResources({ communityId, search }: ResourceFilters) {
    await delay(250);

    let items = this.records.filter((resource) => resource.communityId === communityId);

    if (search) {
      items = matchSorter(items, search, {
        keys: ['title', 'type', 'owner']
      });
    }

    return items;
  },

  async createResource(data: CommunityResourceCreatePayload) {
    await delay(150);

    const resource: CommunityResource = {
      id: createResourceId(data.type),
      ...data,
      updatedAt: new Date().toISOString()
    };

    this.records.unshift(resource);

    return resource;
  }
};

function createResourceId(type: CommunityResourceType) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `res-${type}-${crypto.randomUUID()}`;
  }

  return `res-${type}-${Date.now()}`;
}
