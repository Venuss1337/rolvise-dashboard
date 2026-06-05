import { db } from '@/db';
import {
  account,
  auditLogs,
  botEvents,
  discordGuildLinks,
  managedServers,
  organizationClaims,
  organizationMembers,
  organizations,
  user
} from '@/db/schema';
import { and, asc, count, eq, gt, inArray, lte } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import type {
  DiscordGuildLink,
  DiscordProfile,
  ManagedServer,
  ManagedServerListResponse,
  ManagedServerStatus,
  MeResponse,
  OrganizationClaim,
  OrganizationClaimStatus,
  OrganizationDetail,
  OrganizationMembership,
  OrganizationPermission,
  OrganizationRecord,
  OrganizationRole,
  OrganizationSummary,
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

const CLAIM_MINUTES = 15;

type AuthUser = typeof user.$inferSelect;
type Account = typeof account.$inferSelect;
type Organization = typeof organizations.$inferSelect;
type OrganizationMember = typeof organizationMembers.$inferSelect;
type DiscordGuildLinkRow = typeof discordGuildLinks.$inferSelect;
type ManagedServerRow = typeof managedServers.$inferSelect;
type OrganizationClaimRow = typeof organizationClaims.$inferSelect;

function addMinutes(minutes: number) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

function toIsoDateTime(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || null;
}

function toOpenApiUser(row: AuthUser, discordId: string): User {
  return {
    id: row.id,
    discordId,
    name: row.name,
    email: row.email,
    image: row.image,
    createdAt: toIsoDateTime(row.createdAt),
    updatedAt: toIsoDateTime(row.updatedAt)
  };
}

function toDiscordProfile(row: AuthUser, discordAccount: Account): DiscordProfile {
  return {
    id: discordAccount.accountId,
    username: row.name,
    globalName: row.name,
    discriminator: null,
    avatarUrl: row.image
  };
}

function toDiscordGuildLink(row: DiscordGuildLinkRow): DiscordGuildLink {
  return {
    discordGuildId: row.discordGuildId,
    name: row.name,
    iconUrl: row.iconUrl,
    ownerDiscordId: row.ownerDiscordId,
    status: row.status,
    memberCount: row.memberCount,
    linkedAt: toIsoDateTime(row.linkedAt),
    lastSyncedAt: row.lastSyncedAt ? toIsoDateTime(row.lastSyncedAt) : null
  };
}

function toMembership(row: OrganizationMember): OrganizationMembership {
  return {
    id: row.id,
    userId: row.userId,
    organizationId: row.organizationId,
    role: row.role,
    permissions: row.permissions as OrganizationPermission[],
    joinedAt: toIsoDateTime(row.joinedAt)
  };
}

function toManagedServer(row: ManagedServerRow): ManagedServer {
  return {
    id: row.id,
    organizationId: row.organizationId,
    name: row.name,
    imageSeed: row.imageSeed,
    status: row.status,
    robloxGroupId: row.robloxGroupId,
    joinCode: row.joinCode,
    memberCount: row.memberCount,
    staffCount: row.staffCount,
    activePlayers: row.activePlayers,
    openIncidents: row.openIncidents,
    lastSessionAt: row.lastSessionAt ? toIsoDateTime(row.lastSessionAt) : null,
    createdAt: toIsoDateTime(row.createdAt),
    updatedAt: toIsoDateTime(row.updatedAt)
  };
}

function toOrganizationRecord(
  organization: Organization,
  discordGuild: DiscordGuildLinkRow
): OrganizationRecord {
  return {
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    discordGuild: toDiscordGuildLink(discordGuild),
    createdAt: toIsoDateTime(organization.createdAt),
    updatedAt: toIsoDateTime(organization.updatedAt)
  };
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

function toClaimResponse(claim: OrganizationClaimRow): OrganizationClaim {
  return {
    claimToken: claim.claimToken,
    claimUrl: claim.claimUrl,
    discordGuildId: claim.discordGuildId,
    discordGuildName: claim.discordGuildName,
    guildOwnerDiscordId: claim.guildOwnerDiscordId,
    status: claim.status,
    expiresAt: toIsoDateTime(claim.expiresAt),
    createdAt: toIsoDateTime(claim.createdAt)
  };
}

async function expireClaims() {
  await db
    .update(organizationClaims)
    .set({ status: 'expired' })
    .where(
      and(eq(organizationClaims.status, 'pending'), lte(organizationClaims.expiresAt, new Date()))
    );
}

async function addAuditLog(values: {
  type: string;
  organizationId: string | null;
  discordGuildId: string | null;
  actorUserId: string | null;
  actorDiscordId: string | null;
  metadata: Record<string, unknown>;
}) {
  await db.insert(auditLogs).values(values);
}

async function getDiscordAccount(userId: string) {
  const [discordAccount] = await db
    .select()
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, 'discord')))
    .limit(1);

  return discordAccount ?? null;
}

async function getUserContext(userId: string) {
  const [authUser] = await db.select().from(user).where(eq(user.id, userId)).limit(1);

  if (!authUser) {
    throw new ApiError('unauthorized', 'Sign in with Discord to continue.');
  }

  const discordAccount = await getDiscordAccount(userId);

  if (!discordAccount) {
    throw new ApiError('unauthorized', 'Sign in with Discord to continue.');
  }

  return {
    user: toOpenApiUser(authUser, discordAccount.accountId),
    discord: toDiscordProfile(authUser, discordAccount)
  };
}

async function getServerCountByOrganization(organizationId: string) {
  const [result] = await db
    .select({ value: count() })
    .from(managedServers)
    .where(eq(managedServers.organizationId, organizationId));

  return result?.value ?? 0;
}

export async function getMe(userId: string): Promise<MeResponse> {
  await expireClaims();

  const context = await getUserContext(userId);
  const userOrganizations = await listOrganizationSummariesForUser(userId);
  const activeOrganizationId = userOrganizations[0]?.id ?? null;
  const [activeServer] =
    activeOrganizationId === null
      ? []
      : await db
          .select()
          .from(managedServers)
          .where(eq(managedServers.organizationId, activeOrganizationId))
          .orderBy(asc(managedServers.createdAt))
          .limit(1);

  return {
    user: context.user,
    discord: context.discord,
    organizations: userOrganizations,
    activeOrganizationId,
    activeManagedServerId: activeServer?.id ?? null,
    onboarding: {
      requiresOrganization: userOrganizations.length === 0,
      nextUrl:
        userOrganizations.length === 0 ? '/dashboard/onboarding/discord' : '/dashboard/servers'
    }
  };
}

export async function listOrganizationSummariesForUser(
  userId: string
): Promise<OrganizationSummary[]> {
  await expireClaims();

  const rows = await db
    .select({
      organization: organizations,
      membership: organizationMembers,
      discordGuild: discordGuildLinks
    })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizations.id, organizationMembers.organizationId))
    .innerJoin(discordGuildLinks, eq(discordGuildLinks.organizationId, organizations.id))
    .where(eq(organizationMembers.userId, userId))
    .orderBy(asc(organizations.createdAt));

  return Promise.all(
    rows.map(async (row) => {
      const organization = toOrganizationRecord(row.organization, row.discordGuild);
      const membership = toMembership(row.membership);
      const managedServerCount = await getServerCountByOrganization(organization.id);

      return toOrganizationSummary(organization, membership, managedServerCount);
    })
  );
}

export async function getOrganizationDetail(
  userId: string,
  organizationId: string
): Promise<OrganizationDetail> {
  await expireClaims();

  const [row] = await db
    .select({
      organization: organizations,
      membership: organizationMembers,
      discordGuild: discordGuildLinks
    })
    .from(organizations)
    .innerJoin(organizationMembers, eq(organizationMembers.organizationId, organizations.id))
    .innerJoin(discordGuildLinks, eq(discordGuildLinks.organizationId, organizations.id))
    .where(and(eq(organizations.id, organizationId), eq(organizationMembers.userId, userId)))
    .limit(1);

  if (!row) {
    const [organization] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (!organization) {
      throw new ApiError('not_found', 'Resource not found.');
    }

    throw new ApiError('forbidden', 'You do not have permission to access this resource.');
  }

  const organization = toOrganizationRecord(row.organization, row.discordGuild);
  const membership = toMembership(row.membership);

  return {
    ...toOrganizationSummary(
      organization,
      membership,
      await getServerCountByOrganization(organization.id)
    ),
    membership,
    updatedAt: organization.updatedAt
  };
}

export async function listManagedServers(
  userId: string,
  organizationId: string,
  filters: {
    status?: ManagedServerStatus;
    limit: number;
    cursor?: string;
  }
): Promise<ManagedServerListResponse> {
  await getOrganizationDetail(userId, organizationId);

  const predicates = [eq(managedServers.organizationId, organizationId)];

  if (filters.status) {
    predicates.push(eq(managedServers.status, filters.status));
  }

  if (filters.cursor) {
    predicates.push(gt(managedServers.id, filters.cursor));
  }

  const rows = await db
    .select()
    .from(managedServers)
    .where(and(...predicates))
    .orderBy(asc(managedServers.id))
    .limit(filters.limit + 1);
  const items = rows.slice(0, filters.limit).map(toManagedServer);
  const next = rows[filters.limit];

  return {
    items,
    pageInfo: {
      hasNextPage: Boolean(next),
      nextCursor: next?.id ?? null
    }
  };
}

export async function startOrganizationClaim(
  input: StartOrganizationClaimInput,
  requestUrl: string
): Promise<OrganizationClaim> {
  await expireClaims();

  if (input.guildOwnerDiscordId !== input.commandUserDiscordId) {
    throw new ApiError(
      'forbidden',
      'Only the Discord guild owner can start an organization claim.'
    );
  }

  const [existingLink] = await db
    .select()
    .from(discordGuildLinks)
    .where(eq(discordGuildLinks.discordGuildId, input.discordGuildId))
    .limit(1);

  if (existingLink) {
    throw new ApiError(
      'discord_guild_already_linked',
      'This Discord guild is already linked to a Rolvise organization.'
    );
  }

  await db
    .update(organizationClaims)
    .set({ status: 'revoked' })
    .where(
      and(
        eq(organizationClaims.discordGuildId, input.discordGuildId),
        inArray(organizationClaims.status, ['pending', 'expired'])
      )
    );

  const token = randomBytes(32).toString('base64url');
  const origin = new URL(requestUrl).origin;
  const claimUrl = `${origin}/dashboard/onboarding/discord?claim=${token}`;

  const [claim] = await db
    .insert(organizationClaims)
    .values({
      claimToken: token,
      claimUrl,
      discordGuildId: input.discordGuildId,
      discordGuildName: input.discordGuildName,
      guildOwnerDiscordId: input.guildOwnerDiscordId,
      commandUserDiscordId: input.commandUserDiscordId,
      botUserDiscordId: input.botUserDiscordId,
      botPermissions: input.botPermissions,
      iconUrl: input.iconUrl ?? null,
      memberCount: input.memberCount ?? null,
      status: 'pending',
      expiresAt: addMinutes(CLAIM_MINUTES)
    })
    .returning();

  await addAuditLog({
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

export async function getOrganizationClaimStatus(
  claimToken: string
): Promise<OrganizationClaimStatus> {
  await expireClaims();

  const [claim] = await db
    .select()
    .from(organizationClaims)
    .where(eq(organizationClaims.claimToken, claimToken))
    .limit(1);

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
    expiresAt: toIsoDateTime(claim.expiresAt)
  };
}

export async function completeOrganizationClaim(
  userId: string,
  input: CompleteOrganizationClaimInput
) {
  await expireClaims();

  const { user } = await getUserContext(userId);
  const result = await db.transaction(async (tx) => {
    const [claim] = await tx
      .select()
      .from(organizationClaims)
      .where(eq(organizationClaims.claimToken, input.claimToken))
      .limit(1);

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
      throw new ApiError(
        'forbidden',
        'The signed-in Discord user does not own this Discord guild.'
      );
    }

    const [existingLink] = await tx
      .select()
      .from(discordGuildLinks)
      .where(eq(discordGuildLinks.discordGuildId, claim.discordGuildId))
      .limit(1);

    if (existingLink) {
      throw new ApiError(
        'discord_guild_already_linked',
        'This Discord guild is already linked to a Rolvise organization.'
      );
    }

    const [organization] = await tx
      .insert(organizations)
      .values({
        name: input.organizationName,
        slug: slugify(input.organizationName)
      })
      .returning();
    const [discordGuild] = await tx
      .insert(discordGuildLinks)
      .values({
        organizationId: organization.id,
        discordGuildId: claim.discordGuildId,
        name: claim.discordGuildName,
        iconUrl: claim.iconUrl,
        ownerDiscordId: claim.guildOwnerDiscordId,
        status: 'linked',
        memberCount: claim.memberCount
      })
      .returning();
    const [membership] = await tx
      .insert(organizationMembers)
      .values({
        userId,
        organizationId: organization.id,
        role: 'Owner',
        permissions: ROLE_PERMISSIONS.Owner
      })
      .returning();
    const [initialServer] =
      input.initialServerName || input.initialServerJoinCode
        ? await tx
            .insert(managedServers)
            .values({
              organizationId: organization.id,
              name: input.initialServerName ?? input.organizationName,
              imageSeed: input.initialServerName?.slice(0, 3).toUpperCase() ?? null,
              status: 'offline',
              robloxGroupId: null,
              joinCode: input.initialServerJoinCode ?? 'SETUP',
              memberCount: 0,
              staffCount: 1,
              activePlayers: 0,
              openIncidents: 0
            })
            .returning()
        : [null];

    await tx
      .update(organizationClaims)
      .set({ status: 'completed', completedAt: new Date() })
      .where(eq(organizationClaims.claimToken, input.claimToken));
    await tx.insert(auditLogs).values({
      type: 'organization_claim_completed',
      organizationId: organization.id,
      discordGuildId: claim.discordGuildId,
      actorUserId: userId,
      actorDiscordId: user.discordId,
      metadata: {
        organizationName: input.organizationName,
        initialServerId: initialServer?.id ?? null
      }
    });

    const orgRecord = toOrganizationRecord(organization, discordGuild);
    const memberRecord = toMembership(membership);

    return {
      organization: toOrganizationSummary(orgRecord, memberRecord, initialServer ? 1 : 0),
      membership: memberRecord,
      discordGuild: toDiscordGuildLink(discordGuild),
      initialServer: initialServer ? toManagedServer(initialServer) : null
    };
  });

  return result;
}

export async function getBotGuildStatus(discordGuildId: string) {
  const [row] = await db
    .select({
      organization: organizations,
      discordGuild: discordGuildLinks
    })
    .from(discordGuildLinks)
    .innerJoin(organizations, eq(organizations.id, discordGuildLinks.organizationId))
    .where(eq(discordGuildLinks.discordGuildId, discordGuildId))
    .limit(1);

  if (!row) {
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
    organizationId: row.organization.id,
    organizationName: row.organization.name,
    status:
      row.discordGuild.status === 'disabled'
        ? ('disabled' as const)
        : row.discordGuild.status === 'sync_required'
          ? ('sync_required' as const)
          : ('linked' as const),
    lastSyncedAt: row.discordGuild.lastSyncedAt
      ? toIsoDateTime(row.discordGuild.lastSyncedAt)
      : null
  };
}

export async function ingestBotEvent(event: BotEventInput) {
  const [duplicate] = await db
    .select({ eventId: botEvents.eventId })
    .from(botEvents)
    .where(eq(botEvents.eventId, event.eventId))
    .limit(1);

  if (duplicate) {
    return {
      accepted: true as const,
      eventId: event.eventId,
      duplicate: true
    };
  }

  const [row] = await db
    .select({
      organization: organizations,
      discordGuild: discordGuildLinks
    })
    .from(discordGuildLinks)
    .innerJoin(organizations, eq(organizations.id, discordGuildLinks.organizationId))
    .where(eq(discordGuildLinks.discordGuildId, event.discordGuildId))
    .limit(1);
  const setupEventTypes = new Set(['setup_started', 'guild_installed', 'status_checked']);

  if (!row && !setupEventTypes.has(event.type)) {
    throw new ApiError('forbidden', 'Bot events for unlinked Discord guilds are not accepted.');
  }

  await db.transaction(async (tx) => {
    await tx.insert(botEvents).values({
      eventId: event.eventId,
      type: event.type,
      discordGuildId: event.discordGuildId,
      occurredAt: new Date(event.occurredAt),
      actorDiscordId: event.actorDiscordId ?? null,
      payload: event.payload ?? null
    });

    if (row) {
      if (event.type === 'guild_removed') {
        await tx
          .update(discordGuildLinks)
          .set({ status: 'bot_missing' })
          .where(eq(discordGuildLinks.id, row.discordGuild.id));
      }

      if (['guild_sync', 'member_sync', 'role_sync', 'guild_installed'].includes(event.type)) {
        await tx
          .update(discordGuildLinks)
          .set({ status: 'linked', lastSyncedAt: new Date(event.occurredAt) })
          .where(eq(discordGuildLinks.id, row.discordGuild.id));
      }
    }

    await tx.insert(auditLogs).values({
      type: `bot_${event.type}`,
      organizationId: row?.organization.id ?? null,
      discordGuildId: event.discordGuildId,
      actorUserId: null,
      actorDiscordId: event.actorDiscordId ?? null,
      metadata: {
        eventId: event.eventId,
        payload: event.payload ?? null
      }
    });
  });

  return {
    accepted: true as const,
    eventId: event.eventId,
    duplicate: false
  };
}
