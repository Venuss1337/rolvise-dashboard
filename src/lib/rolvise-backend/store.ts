import { randomBytes, randomUUID } from 'crypto';
import type {
  AuditLog,
  BotEventRequest,
  DiscordGuildLink,
  DiscordProfile,
  ManagedServer,
  ManagedServerListResponse,
  ManagedServerStatus,
  MeResponse,
  OrganizationClaim,
  OrganizationClaimRecord,
  OrganizationClaimStatus,
  OrganizationDetail,
  OrganizationMembership,
  OrganizationPermission,
  OrganizationRecord,
  OrganizationRole,
  OrganizationSummary,
  Session,
  User
} from './types';
import type {
  BotEventInput,
  CompleteOrganizationClaimInput,
  StartOrganizationClaimInput
} from './validation';
import { ApiError } from './http';

const OWNER_PERMISSIONS: OrganizationPermission[] = [
  'community:view',
  'community:manage',
  'staff:view',
  'staff:manage',
  'cases:view',
  'cases:manage',
  'settings:manage'
];

const ROLE_PERMISSIONS: Record<OrganizationRole, OrganizationPermission[]> = {
  Owner: OWNER_PERMISSIONS,
  Admin: [
    'community:view',
    'community:manage',
    'staff:view',
    'staff:manage',
    'cases:view',
    'cases:manage'
  ],
  Moderator: ['community:view', 'staff:view', 'cases:view', 'cases:manage']
};

const SESSION_DAYS = 30;
const CLAIM_MINUTES = 15;
const OAUTH_STATE_MINUTES = 10;

interface OAuthState {
  state: string;
  redirectTo: string;
  expiresAt: string;
  createdAt: string;
}

interface BackendStoreState {
  users: User[];
  discordProfiles: DiscordProfile[];
  sessions: Session[];
  oauthStates: OAuthState[];
  organizations: OrganizationRecord[];
  memberships: OrganizationMembership[];
  managedServers: ManagedServer[];
  claims: OrganizationClaimRecord[];
  botEvents: BotEventRequest[];
  auditLogs: AuditLog[];
}

const seedOrganizationId = '4ce8cdf9-eeba-4a37-95a1-9b7e4b50ce25';
const seedUserId = 'e7380e53-22eb-4f50-a507-4258d502737c';
const nowSeed = '2026-06-05T12:00:00.000Z';

const initialState: BackendStoreState = {
  users: [
    {
      id: seedUserId,
      discordId: '123456789012345678',
      name: 'ER:LC Manager',
      email: 'manager@example.com',
      image: null,
      createdAt: nowSeed,
      updatedAt: nowSeed
    }
  ],
  discordProfiles: [
    {
      id: '123456789012345678',
      username: 'erlc_manager',
      globalName: 'ER:LC Manager',
      discriminator: null,
      avatarUrl: null
    }
  ],
  sessions: [],
  oauthStates: [],
  organizations: [
    {
      id: seedOrganizationId,
      name: 'River City Roleplay',
      slug: 'river-city-roleplay',
      discordGuild: {
        discordGuildId: '987654321098765432',
        name: 'River City Roleplay',
        iconUrl: null,
        ownerDiscordId: '123456789012345678',
        status: 'linked',
        memberCount: 4821,
        linkedAt: nowSeed,
        lastSyncedAt: nowSeed
      },
      createdAt: nowSeed,
      updatedAt: nowSeed
    }
  ],
  memberships: [
    {
      id: 'c0a9221a-0e6b-49e8-a196-9ea67f4ea9d7',
      userId: seedUserId,
      organizationId: seedOrganizationId,
      role: 'Owner',
      permissions: OWNER_PERMISSIONS,
      joinedAt: nowSeed
    }
  ],
  managedServers: [
    {
      id: 'c1ae9617-208a-4f72-a4f3-25ef8c9872ed',
      organizationId: seedOrganizationId,
      name: 'River City Roleplay',
      imageSeed: 'RCR',
      status: 'online',
      robloxGroupId: '14582011',
      joinCode: 'RCRP',
      memberCount: 4821,
      staffCount: 42,
      activePlayers: 31,
      openIncidents: 7,
      lastSessionAt: '2026-05-31T17:45:00.000Z',
      createdAt: nowSeed,
      updatedAt: nowSeed
    }
  ],
  claims: [],
  botEvents: [],
  auditLogs: []
};

const globalStore = globalThis as typeof globalThis & {
  rolviseBackendStore?: BackendStoreState;
};

function getState() {
  globalStore.rolviseBackendStore ??= structuredClone(initialState);
  expireClaims(globalStore.rolviseBackendStore);
  return globalStore.rolviseBackendStore;
}

function now() {
  return new Date().toISOString();
}

function addMinutes(minutes: number) {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

function addDays(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || null;
}

function expireClaims(state: BackendStoreState) {
  const currentTime = Date.now();

  state.claims = state.claims.map((claim) => {
    if (claim.status === 'pending' && Date.parse(claim.expiresAt) <= currentTime) {
      return { ...claim, status: 'expired' };
    }

    return claim;
  });
}

function toOrganizationSummary(
  organization: OrganizationRecord,
  membership: OrganizationMembership,
  managedServerCount: number
): OrganizationSummary {
  return {
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    role: membership.role,
    permissions: membership.permissions,
    discordGuild: organization.discordGuild,
    managedServerCount,
    createdAt: organization.createdAt
  };
}

function toClaimResponse(claim: OrganizationClaimRecord): OrganizationClaim {
  return {
    claimToken: claim.claimToken,
    claimUrl: claim.claimUrl,
    discordGuildId: claim.discordGuildId,
    discordGuildName: claim.discordGuildName,
    guildOwnerDiscordId: claim.guildOwnerDiscordId,
    status: claim.status,
    expiresAt: claim.expiresAt,
    createdAt: claim.createdAt
  };
}

function addAuditLog(state: BackendStoreState, values: Omit<AuditLog, 'id' | 'createdAt'>) {
  state.auditLogs.push({
    id: randomUUID(),
    createdAt: now(),
    ...values
  });
}

export function upsertDiscordUser(profile: DiscordProfile, email: string | null): User {
  const state = getState();
  const existing = state.users.find((user) => user.discordId === profile.id);
  const timestamp = now();

  const normalizedProfile = {
    ...profile,
    globalName: profile.globalName ?? null,
    discriminator: profile.discriminator ?? null,
    avatarUrl: profile.avatarUrl ?? null
  };

  const profileIndex = state.discordProfiles.findIndex((item) => item.id === profile.id);
  if (profileIndex >= 0) {
    state.discordProfiles[profileIndex] = normalizedProfile;
  } else {
    state.discordProfiles.push(normalizedProfile);
  }

  if (existing) {
    existing.name = profile.globalName ?? profile.username;
    existing.email = email;
    existing.image = profile.avatarUrl;
    existing.updatedAt = timestamp;
    return existing;
  }

  const user: User = {
    id: randomUUID(),
    discordId: profile.id,
    name: profile.globalName ?? profile.username,
    email,
    image: profile.avatarUrl,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  state.users.push(user);
  return user;
}

export function createSession(userId: string): Session {
  const state = getState();
  const session: Session = {
    token: randomBytes(32).toString('base64url'),
    userId,
    expiresAt: addDays(SESSION_DAYS),
    createdAt: now()
  };

  state.sessions.push(session);
  return session;
}

export function deleteSession(token: string) {
  const state = getState();
  state.sessions = state.sessions.filter((session) => session.token !== token);
}

export function getSessionContext(token: string | undefined) {
  if (!token) {
    return null;
  }

  const state = getState();
  const session = state.sessions.find((item) => item.token === token);

  if (!session || Date.parse(session.expiresAt) <= Date.now()) {
    state.sessions = state.sessions.filter((item) => item.token !== token);
    return null;
  }

  const user = state.users.find((item) => item.id === session.userId);
  if (!user) {
    return null;
  }

  const discord = state.discordProfiles.find((item) => item.id === user.discordId);
  if (!discord) {
    return null;
  }

  return { session, user, discord };
}

export function createOAuthState(redirectTo: string) {
  const state = getState();
  const oauthState: OAuthState = {
    state: randomBytes(24).toString('base64url'),
    redirectTo,
    expiresAt: addMinutes(OAUTH_STATE_MINUTES),
    createdAt: now()
  };

  state.oauthStates.push(oauthState);
  return oauthState;
}

export function consumeOAuthState(stateValue: string) {
  const state = getState();
  const oauthState = state.oauthStates.find((item) => item.state === stateValue);

  if (!oauthState) {
    throw new ApiError('bad_request', 'OAuth state is invalid.');
  }

  state.oauthStates = state.oauthStates.filter((item) => item.state !== stateValue);

  if (Date.parse(oauthState.expiresAt) <= Date.now()) {
    throw new ApiError('bad_request', 'OAuth state has expired.');
  }

  return oauthState;
}

export function getMe(userId: string): MeResponse {
  const state = getState();
  const user = state.users.find((item) => item.id === userId);

  if (!user) {
    throw new ApiError('unauthorized', 'Sign in with Discord to continue.');
  }

  const discord = state.discordProfiles.find((item) => item.id === user.discordId);
  if (!discord) {
    throw new ApiError('unauthorized', 'Sign in with Discord to continue.');
  }

  const organizations = listOrganizationSummariesForUser(userId);
  const activeOrganizationId = organizations[0]?.id ?? null;
  const activeManagedServerId =
    activeOrganizationId === null
      ? null
      : (state.managedServers.find((server) => server.organizationId === activeOrganizationId)
          ?.id ?? null);

  return {
    user,
    discord,
    organizations,
    activeOrganizationId,
    activeManagedServerId,
    onboarding: {
      requiresOrganization: organizations.length === 0,
      nextUrl: organizations.length === 0 ? '/dashboard/onboarding/discord' : '/dashboard/servers'
    }
  };
}

export function listOrganizationSummariesForUser(userId: string): OrganizationSummary[] {
  const state = getState();

  return state.memberships
    .filter((membership) => membership.userId === userId)
    .map((membership) => {
      const organization = state.organizations.find(
        (item) => item.id === membership.organizationId
      );

      if (!organization) {
        return null;
      }

      const managedServerCount = state.managedServers.filter(
        (server) => server.organizationId === organization.id
      ).length;

      return toOrganizationSummary(organization, membership, managedServerCount);
    })
    .filter((organization): organization is OrganizationSummary => Boolean(organization));
}

export function getOrganizationDetail(userId: string, organizationId: string): OrganizationDetail {
  const state = getState();
  const organization = state.organizations.find((item) => item.id === organizationId);

  if (!organization) {
    throw new ApiError('not_found', 'Resource not found.');
  }

  const membership = state.memberships.find(
    (item) => item.organizationId === organizationId && item.userId === userId
  );

  if (!membership) {
    throw new ApiError('forbidden', 'You do not have permission to access this resource.');
  }

  return {
    ...toOrganizationSummary(
      organization,
      membership,
      state.managedServers.filter((server) => server.organizationId === organization.id).length
    ),
    membership,
    updatedAt: organization.updatedAt
  };
}

export function listManagedServers(
  userId: string,
  organizationId: string,
  filters: {
    status?: ManagedServerStatus;
    limit: number;
    cursor?: string;
  }
): ManagedServerListResponse {
  getOrganizationDetail(userId, organizationId);

  const state = getState();
  let servers = state.managedServers.filter((server) => server.organizationId === organizationId);

  if (filters.status) {
    servers = servers.filter((server) => server.status === filters.status);
  }

  const startIndex = filters.cursor
    ? Math.max(servers.findIndex((server) => server.id === filters.cursor) + 1, 0)
    : 0;
  const items = servers.slice(startIndex, startIndex + filters.limit);
  const next = servers[startIndex + filters.limit];

  return {
    items,
    pageInfo: {
      hasNextPage: Boolean(next),
      nextCursor: next?.id ?? null
    }
  };
}

export function startOrganizationClaim(
  input: StartOrganizationClaimInput,
  requestUrl: string
): OrganizationClaim {
  const state = getState();

  if (input.guildOwnerDiscordId !== input.commandUserDiscordId) {
    throw new ApiError(
      'forbidden',
      'Only the Discord guild owner can start an organization claim.'
    );
  }

  const existingLink = state.organizations.find(
    (organization) => organization.discordGuild.discordGuildId === input.discordGuildId
  );

  if (existingLink) {
    throw new ApiError(
      'discord_guild_already_linked',
      'This Discord guild is already linked to a Rolvise organization.'
    );
  }

  state.claims = state.claims.filter(
    (claim) =>
      !(
        claim.discordGuildId === input.discordGuildId &&
        ['pending', 'expired'].includes(claim.status)
      )
  );

  const token = randomBytes(32).toString('base64url');
  const origin = new URL(requestUrl).origin;
  const timestamp = now();
  const claim: OrganizationClaimRecord = {
    claimToken: token,
    claimUrl: `${origin}/dashboard/onboarding/discord?claim=${token}`,
    discordGuildId: input.discordGuildId,
    discordGuildName: input.discordGuildName,
    guildOwnerDiscordId: input.guildOwnerDiscordId,
    commandUserDiscordId: input.commandUserDiscordId,
    botUserDiscordId: input.botUserDiscordId,
    botPermissions: input.botPermissions,
    iconUrl: input.iconUrl ?? null,
    memberCount: input.memberCount ?? null,
    status: 'pending',
    expiresAt: addMinutes(CLAIM_MINUTES),
    createdAt: timestamp,
    completedAt: null
  };

  state.claims.push(claim);
  addAuditLog(state, {
    type: 'organization_claim_started',
    organizationId: null,
    discordGuildId: input.discordGuildId,
    actorUserId: null,
    actorDiscordId: input.commandUserDiscordId,
    metadata: {
      discordGuildName: input.discordGuildName,
      botUserDiscordId: input.botUserDiscordId,
      issuedAt: input.issuedAt
    }
  });

  return toClaimResponse(claim);
}

export function getOrganizationClaimStatus(claimToken: string): OrganizationClaimStatus {
  const state = getState();
  const claim = state.claims.find((item) => item.claimToken === claimToken);

  if (!claim) {
    throw new ApiError('not_found', 'Resource not found.');
  }

  if (claim.status === 'expired') {
    throw new ApiError('claim_expired', 'This organization claim link has expired.');
  }

  if (claim.status === 'completed') {
    throw new ApiError('claim_consumed', 'This organization claim link has already been used.');
  }

  return {
    discordGuildId: claim.discordGuildId,
    discordGuildName: claim.discordGuildName,
    guildOwnerDiscordId: claim.guildOwnerDiscordId,
    iconUrl: claim.iconUrl,
    status: claim.status,
    expiresAt: claim.expiresAt
  };
}

export function completeOrganizationClaim(userId: string, input: CompleteOrganizationClaimInput) {
  const state = getState();
  const user = state.users.find((item) => item.id === userId);

  if (!user) {
    throw new ApiError('unauthorized', 'Sign in with Discord to continue.');
  }

  const claim = state.claims.find((item) => item.claimToken === input.claimToken);

  if (!claim) {
    throw new ApiError('not_found', 'Resource not found.');
  }

  if (claim.status === 'expired') {
    throw new ApiError('claim_expired', 'This organization claim link has expired.');
  }

  if (claim.status !== 'pending') {
    throw new ApiError('claim_consumed', 'This organization claim link has already been used.');
  }

  if (user.discordId !== claim.guildOwnerDiscordId) {
    throw new ApiError('forbidden', 'The signed-in Discord user does not own this Discord guild.');
  }

  const existingLink = state.organizations.find(
    (organization) => organization.discordGuild.discordGuildId === claim.discordGuildId
  );

  if (existingLink) {
    throw new ApiError(
      'discord_guild_already_linked',
      'This Discord guild is already linked to a Rolvise organization.'
    );
  }

  const timestamp = now();
  const organizationId = randomUUID();
  const discordGuild: DiscordGuildLink = {
    discordGuildId: claim.discordGuildId,
    name: claim.discordGuildName,
    iconUrl: claim.iconUrl,
    ownerDiscordId: claim.guildOwnerDiscordId,
    status: 'linked',
    memberCount: claim.memberCount,
    linkedAt: timestamp,
    lastSyncedAt: null
  };
  const organization: OrganizationRecord = {
    id: organizationId,
    name: input.organizationName,
    slug: slugify(input.organizationName),
    discordGuild,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  const membership: OrganizationMembership = {
    id: randomUUID(),
    userId,
    organizationId,
    role: 'Owner',
    permissions: ROLE_PERMISSIONS.Owner,
    joinedAt: timestamp
  };
  const initialServer =
    input.initialServerName || input.initialServerJoinCode
      ? {
          id: randomUUID(),
          organizationId,
          name: input.initialServerName ?? input.organizationName,
          imageSeed: input.initialServerName?.slice(0, 3).toUpperCase() ?? null,
          status: 'offline' as const,
          robloxGroupId: null,
          joinCode: input.initialServerJoinCode ?? 'SETUP',
          memberCount: 0,
          staffCount: 1,
          activePlayers: 0,
          openIncidents: 0,
          lastSessionAt: null,
          createdAt: timestamp,
          updatedAt: timestamp
        }
      : null;

  state.organizations.push(organization);
  state.memberships.push(membership);

  if (initialServer) {
    state.managedServers.push(initialServer);
  }

  claim.status = 'completed';
  claim.completedAt = timestamp;

  addAuditLog(state, {
    type: 'organization_claim_completed',
    organizationId,
    discordGuildId: claim.discordGuildId,
    actorUserId: userId,
    actorDiscordId: user.discordId,
    metadata: {
      organizationName: input.organizationName,
      initialServerId: initialServer?.id ?? null
    }
  });

  return {
    organization: toOrganizationSummary(organization, membership, initialServer ? 1 : 0),
    membership,
    discordGuild,
    initialServer
  };
}

export function getBotGuildStatus(discordGuildId: string) {
  const state = getState();
  const organization = state.organizations.find(
    (item) => item.discordGuild.discordGuildId === discordGuildId
  );

  if (!organization) {
    return {
      discordGuildId,
      linked: false,
      organizationId: null,
      organizationName: null,
      status: 'unlinked' as const,
      lastSyncedAt: null
    };
  }

  return {
    discordGuildId,
    linked: true,
    organizationId: organization.id,
    organizationName: organization.name,
    status:
      organization.discordGuild.status === 'disabled'
        ? ('disabled' as const)
        : organization.discordGuild.status === 'sync_required'
          ? ('sync_required' as const)
          : ('linked' as const),
    lastSyncedAt: organization.discordGuild.lastSyncedAt
  };
}

export function ingestBotEvent(event: BotEventInput) {
  const state = getState();
  const duplicate = state.botEvents.some((item) => item.eventId === event.eventId);

  if (duplicate) {
    return {
      accepted: true as const,
      eventId: event.eventId,
      duplicate: true
    };
  }

  const organization = state.organizations.find(
    (item) => item.discordGuild.discordGuildId === event.discordGuildId
  );
  const setupEventTypes = new Set(['setup_started', 'guild_installed', 'status_checked']);

  if (!organization && !setupEventTypes.has(event.type)) {
    throw new ApiError('forbidden', 'Bot events for unlinked Discord guilds are not accepted.');
  }

  if (organization) {
    if (event.type === 'guild_removed') {
      organization.discordGuild.status = 'bot_missing';
      organization.updatedAt = now();
    }

    if (['guild_sync', 'member_sync', 'role_sync', 'guild_installed'].includes(event.type)) {
      organization.discordGuild.status = 'linked';
      organization.discordGuild.lastSyncedAt = event.occurredAt;
      organization.updatedAt = now();
    }
  }

  state.botEvents.push(event);
  addAuditLog(state, {
    type: `bot_${event.type}`,
    organizationId: organization?.id ?? null,
    discordGuildId: event.discordGuildId,
    actorUserId: null,
    actorDiscordId: event.actorDiscordId ?? null,
    metadata: {
      eventId: event.eventId,
      payload: event.payload ?? null
    }
  });

  return {
    accepted: true as const,
    eventId: event.eventId,
    duplicate: false
  };
}
