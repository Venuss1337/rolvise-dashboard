import { db } from '@/db';
import {
  account,
  auditLogs,
  botEvents,
  communityMemberRoles,
  communityMembers,
  communityRoles,
  dashboardInvites,
  discordGuildLinks,
  managedServers,
  organizationClaims,
  organizationMembers,
  organizations,
  user
} from '@/db/schema';
import { and, asc, count, eq, gt, inArray, lte, sql } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import type {
  CommunityMember,
  CommunityMemberListResponse,
  CommunityRole,
  DashboardInvite,
  DashboardInvitePreview,
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
  CommunityMemberQueryInput,
  CommunityRoleInput,
  CommunityRolePatchInput,
  CompleteOrganizationClaimInput,
  CreateDashboardInviteInput,
  StartOrganizationClaimInput
} from './validation';
import { ApiError } from './http';

const OWNER_PERMISSIONS: OrganizationPermission[] = [
  'mdt:open',
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
    'mdt:open',
    'community:view',
    'community:manage',
    'staff:view',
    'staff:manage',
    'cases:view',
    'cases:manage'
  ],
  Moderator: ['mdt:open', 'community:view', 'staff:view', 'cases:view', 'cases:manage'],
  Member: ['mdt:open']
};

const CLAIM_MINUTES = 15;

type AuthUser = typeof user.$inferSelect;
type Account = typeof account.$inferSelect;
type Organization = typeof organizations.$inferSelect;
type OrganizationMember = typeof organizationMembers.$inferSelect;
type DiscordGuildLinkRow = typeof discordGuildLinks.$inferSelect;
type ManagedServerRow = typeof managedServers.$inferSelect;
type CommunityRoleRow = typeof communityRoles.$inferSelect;
type CommunityMemberRow = typeof communityMembers.$inferSelect;
type DashboardInviteRow = typeof dashboardInvites.$inferSelect;
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

function toCommunityRole(row: CommunityRoleRow, memberCount = 0): CommunityRole {
  return {
    id: row.id,
    communityId: row.managedServerId,
    organizationId: row.organizationId,
    name: row.name,
    color: row.color,
    permissions: row.permissions,
    memberCount,
    position: row.position,
    systemKey: row.systemKey,
    createdAt: toIsoDateTime(row.createdAt),
    updatedAt: toIsoDateTime(row.updatedAt)
  };
}

function toCommunityMember(row: CommunityMemberRow, roles: string[]): CommunityMember {
  return {
    id: row.id,
    communityId: row.managedServerId,
    organizationId: row.organizationId,
    userId: row.userId,
    discordId: row.discordId,
    discordUsername: row.discordUsername,
    discordAvatarUrl: row.discordAvatarUrl,
    displayName: row.displayName,
    roles,
    joinedAt: toIsoDateTime(row.joinedAt),
    lastSeenAt: row.lastSeenAt ? toIsoDateTime(row.lastSeenAt) : null
  };
}

function toDashboardInvite(row: DashboardInviteRow, requestUrl: string): DashboardInvite {
  const origin = new URL(requestUrl).origin;

  return {
    id: row.id,
    organizationId: row.organizationId,
    communityId: row.managedServerId,
    token: row.token,
    inviteUrl: `${origin}/join/${row.token}`,
    roleId: row.roleId,
    maxUses: row.maxUses,
    useCount: row.useCount,
    expiresAt: row.expiresAt ? toIsoDateTime(row.expiresAt) : null,
    revokedAt: row.revokedAt ? toIsoDateTime(row.revokedAt) : null,
    createdAt: toIsoDateTime(row.createdAt)
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

async function getManagedServerForOrganization(organizationId: string, serverId: string) {
  const [server] = await db
    .select()
    .from(managedServers)
    .where(and(eq(managedServers.id, serverId), eq(managedServers.organizationId, organizationId)))
    .limit(1);

  if (!server) {
    throw new ApiError('not_found', 'Managed server was not found in this organization.');
  }

  return server;
}

async function requireOrganizationManager(userId: string, organizationId: string) {
  const detail = await getOrganizationDetail(userId, organizationId);

  if (!['Owner', 'Admin'].includes(detail.role)) {
    throw new ApiError('forbidden', 'You do not have permission to manage this organization.');
  }

  return detail;
}

async function ensureDefaultCommunityRoles(organizationId: string, serverId: string) {
  const existing = await db
    .select()
    .from(communityRoles)
    .where(eq(communityRoles.managedServerId, serverId))
    .limit(1);

  if (existing.length > 0) {
    return;
  }

  for (const role of [
    {
      organizationId,
      managedServerId: serverId,
      name: 'Owner',
      color: '#f59e0b',
      permissions: ROLE_PERMISSIONS.Owner,
      position: 0,
      systemKey: 'owner'
    },
    {
      organizationId,
      managedServerId: serverId,
      name: 'Admin',
      color: '#ef4444',
      permissions: ROLE_PERMISSIONS.Admin,
      position: 1,
      systemKey: 'admin'
    },
    {
      organizationId,
      managedServerId: serverId,
      name: 'Moderator',
      color: '#3b82f6',
      permissions: ROLE_PERMISSIONS.Moderator,
      position: 2,
      systemKey: 'moderator'
    },
    {
      organizationId,
      managedServerId: serverId,
      name: 'Member',
      color: '#64748b',
      permissions: ROLE_PERMISSIONS.Member,
      position: 3,
      systemKey: 'member'
    }
  ]) {
    await db.insert(communityRoles).values(role).onConflictDoNothing();
  }
}

async function getRoleMemberCount(roleId: string) {
  const [result] = await db
    .select({ value: count() })
    .from(communityMemberRoles)
    .where(eq(communityMemberRoles.roleId, roleId));

  return result?.value ?? 0;
}

async function getSystemRole(
  organizationId: string,
  serverId: string,
  systemKey: 'owner' | 'admin' | 'moderator' | 'member'
) {
  await ensureDefaultCommunityRoles(organizationId, serverId);

  const [role] = await db
    .select()
    .from(communityRoles)
    .where(
      and(
        eq(communityRoles.organizationId, organizationId),
        eq(communityRoles.managedServerId, serverId),
        eq(communityRoles.systemKey, systemKey)
      )
    )
    .limit(1);

  return role ?? null;
}

async function ensureCommunityMemberForUser(values: {
  userId: string;
  organizationId: string;
  serverId: string;
  roleSystemKey: 'owner' | 'admin' | 'moderator' | 'member';
  roleId?: string | null;
}) {
  const context = await getUserContext(values.userId);
  const [existing] = await db
    .select()
    .from(communityMembers)
    .where(
      and(
        eq(communityMembers.managedServerId, values.serverId),
        eq(communityMembers.discordId, context.discord.id)
      )
    )
    .limit(1);

  let member = existing ?? null;

  if (!member) {
    await db
      .insert(communityMembers)
      .values({
        organizationId: values.organizationId,
        managedServerId: values.serverId,
        userId: values.userId,
        discordId: context.discord.id,
        discordUsername: context.discord.username,
        discordAvatarUrl: context.discord.avatarUrl,
        displayName: context.discord.globalName ?? context.discord.username
      })
      .onConflictDoNothing();

    [member] = await db
      .select()
      .from(communityMembers)
      .where(
        and(
          eq(communityMembers.managedServerId, values.serverId),
          eq(communityMembers.discordId, context.discord.id)
        )
      )
      .limit(1);
  }

  if (!member) {
    throw new ApiError('internal_server_error', 'Member record could not be created.');
  }

  const systemRole = await getSystemRole(
    values.organizationId,
    values.serverId,
    values.roleSystemKey
  );
  const roleIds = [values.roleId, systemRole?.id].filter((roleId): roleId is string => !!roleId);

  for (const roleId of roleIds) {
    await db
      .insert(communityMemberRoles)
      .values({ memberId: member.id, roleId })
      .onConflictDoNothing();
  }

  return member;
}

export async function listCommunityRoles(
  userId: string,
  organizationId: string,
  serverId: string
): Promise<CommunityRole[]> {
  await getOrganizationDetail(userId, organizationId);
  await getManagedServerForOrganization(organizationId, serverId);
  await ensureDefaultCommunityRoles(organizationId, serverId);

  const roles = await db
    .select()
    .from(communityRoles)
    .where(
      and(
        eq(communityRoles.organizationId, organizationId),
        eq(communityRoles.managedServerId, serverId)
      )
    )
    .orderBy(asc(communityRoles.position), asc(communityRoles.name));

  return Promise.all(
    roles.map(async (role) => toCommunityRole(role, await getRoleMemberCount(role.id)))
  );
}

export async function createCommunityRole(
  userId: string,
  organizationId: string,
  input: CommunityRoleInput
): Promise<CommunityRole> {
  await requireOrganizationManager(userId, organizationId);
  await getManagedServerForOrganization(organizationId, input.serverId);

  const existingRoles = await listCommunityRoles(userId, organizationId, input.serverId);
  const [role] = await db
    .insert(communityRoles)
    .values({
      organizationId,
      managedServerId: input.serverId,
      name: input.name,
      color: input.color,
      permissions: input.permissions,
      position: existingRoles.length
    })
    .returning();

  return toCommunityRole(role, 0);
}

export async function updateCommunityRole(
  userId: string,
  organizationId: string,
  roleId: string,
  input: CommunityRolePatchInput
): Promise<CommunityRole> {
  await requireOrganizationManager(userId, organizationId);

  const [current] = await db
    .select()
    .from(communityRoles)
    .where(and(eq(communityRoles.id, roleId), eq(communityRoles.organizationId, organizationId)))
    .limit(1);

  if (!current) {
    throw new ApiError('not_found', 'Resource not found.');
  }

  const [role] = await db
    .update(communityRoles)
    .set(input)
    .where(eq(communityRoles.id, roleId))
    .returning();

  return toCommunityRole(role, await getRoleMemberCount(role.id));
}

export async function deleteCommunityRole(userId: string, organizationId: string, roleId: string) {
  await requireOrganizationManager(userId, organizationId);

  const [role] = await db
    .select()
    .from(communityRoles)
    .where(and(eq(communityRoles.id, roleId), eq(communityRoles.organizationId, organizationId)))
    .limit(1);

  if (!role) {
    throw new ApiError('not_found', 'Resource not found.');
  }

  if (role.systemKey) {
    throw new ApiError('forbidden', 'System roles cannot be deleted.');
  }

  await db.delete(communityRoles).where(eq(communityRoles.id, roleId));

  return { deleted: true as const };
}

export async function listCommunityMembers(
  userId: string,
  organizationId: string,
  input: CommunityMemberQueryInput
): Promise<CommunityMemberListResponse> {
  const detail = await getOrganizationDetail(userId, organizationId);
  await getManagedServerForOrganization(organizationId, input.serverId);
  await ensureDefaultCommunityRoles(organizationId, input.serverId);
  await ensureCommunityMemberForUser({
    userId,
    organizationId,
    serverId: input.serverId,
    roleSystemKey:
      detail.role === 'Owner'
        ? 'owner'
        : detail.role === 'Admin'
          ? 'admin'
          : detail.role === 'Moderator'
            ? 'moderator'
            : 'member'
  });

  const rows = await db
    .select()
    .from(communityMembers)
    .where(
      and(
        eq(communityMembers.organizationId, organizationId),
        eq(communityMembers.managedServerId, input.serverId)
      )
    )
    .orderBy(
      input.sortBy === 'joinedAt'
        ? asc(communityMembers.joinedAt)
        : input.sortBy === 'discordUsername'
          ? asc(communityMembers.discordUsername)
          : asc(communityMembers.displayName)
    );

  const members = await Promise.all(
    rows.map(async (member) => {
      const roleRows = await db
        .select({ roleId: communityMemberRoles.roleId })
        .from(communityMemberRoles)
        .where(eq(communityMemberRoles.memberId, member.id));

      return toCommunityMember(
        member,
        roleRows.map((role) => role.roleId)
      );
    })
  );
  const normalizedSearch = input.search?.trim().toLowerCase() ?? '';
  const filtered = members.filter((member) => {
    if (normalizedSearch) {
      const haystack = `${member.displayName} ${member.discordUsername}`.toLowerCase();

      if (!haystack.includes(normalizedSearch)) {
        return false;
      }
    }

    if (input.role === 'none') {
      return member.roles.length === 0;
    }

    if (input.role && input.role !== 'all') {
      return member.roles.includes(input.role);
    }

    return true;
  });

  return {
    items:
      input.sortDirection === 'desc'
        ? filtered.reduce<CommunityMember[]>((items, member) => [member, ...items], [])
        : filtered
  };
}

export async function createDashboardInvite(
  userId: string,
  organizationId: string,
  input: CreateDashboardInviteInput,
  requestUrl: string
): Promise<DashboardInvite> {
  await requireOrganizationManager(userId, organizationId);
  await getManagedServerForOrganization(organizationId, input.serverId);
  await ensureDefaultCommunityRoles(organizationId, input.serverId);

  const role =
    input.roleId === undefined || input.roleId === null
      ? await getSystemRole(organizationId, input.serverId, 'member')
      : (
          await db
            .select()
            .from(communityRoles)
            .where(
              and(
                eq(communityRoles.id, input.roleId),
                eq(communityRoles.organizationId, organizationId),
                eq(communityRoles.managedServerId, input.serverId)
              )
            )
            .limit(1)
        )[0];

  if (!role) {
    throw new ApiError('not_found', 'Invite role was not found.');
  }

  const token = randomBytes(24).toString('base64url');
  const [invite] = await db
    .insert(dashboardInvites)
    .values({
      organizationId,
      managedServerId: input.serverId,
      token,
      roleId: role.id,
      createdByUserId: userId,
      maxUses: input.maxUses ?? null,
      expiresAt: input.expiresInHours ? addMinutes(input.expiresInHours * 60) : null
    })
    .returning();

  return toDashboardInvite(invite, requestUrl);
}

export async function getDashboardInvitePreview(token: string): Promise<DashboardInvitePreview> {
  const [row] = await db
    .select({
      invite: dashboardInvites,
      organization: organizations,
      server: managedServers,
      role: communityRoles
    })
    .from(dashboardInvites)
    .innerJoin(organizations, eq(organizations.id, dashboardInvites.organizationId))
    .innerJoin(managedServers, eq(managedServers.id, dashboardInvites.managedServerId))
    .leftJoin(communityRoles, eq(communityRoles.id, dashboardInvites.roleId))
    .where(eq(dashboardInvites.token, token))
    .limit(1);

  if (!row || row.invite.revokedAt) {
    throw new ApiError('not_found', 'Invite link was not found.');
  }

  if (row.invite.expiresAt && row.invite.expiresAt <= new Date()) {
    throw new ApiError('claim_expired', 'This invite link has expired.');
  }

  if (row.invite.maxUses !== null && row.invite.useCount >= row.invite.maxUses) {
    throw new ApiError('claim_consumed', 'This invite link has already been used.');
  }

  return {
    token,
    organizationId: row.organization.id,
    organizationName: row.organization.name,
    communityId: row.server.id,
    communityName: row.server.name,
    role: row.role ? toCommunityRole(row.role) : null,
    expiresAt: row.invite.expiresAt ? toIsoDateTime(row.invite.expiresAt) : null
  };
}

export async function acceptDashboardInvite(userId: string, token: string) {
  const preview = await getDashboardInvitePreview(token);
  const { user: contextUser, discord } = await getUserContext(userId);

  await db.transaction(async (tx) => {
    await tx
      .insert(organizationMembers)
      .values({
        userId,
        organizationId: preview.organizationId,
        role: 'Member',
        permissions: ROLE_PERMISSIONS.Member
      })
      .onConflictDoNothing();

    const [existingMember] = await tx
      .select()
      .from(communityMembers)
      .where(
        and(
          eq(communityMembers.managedServerId, preview.communityId),
          eq(communityMembers.discordId, contextUser.discordId)
        )
      )
      .limit(1);

    let member = existingMember ?? null;

    if (!member) {
      await tx
        .insert(communityMembers)
        .values({
          organizationId: preview.organizationId,
          managedServerId: preview.communityId,
          userId,
          discordId: contextUser.discordId,
          discordUsername: discord.username,
          discordAvatarUrl: discord.avatarUrl,
          displayName: discord.globalName ?? discord.username
        })
        .onConflictDoNothing();

      [member] = await tx
        .select()
        .from(communityMembers)
        .where(
          and(
            eq(communityMembers.managedServerId, preview.communityId),
            eq(communityMembers.discordId, contextUser.discordId)
          )
        )
        .limit(1);
    }

    if (!member) {
      throw new ApiError('internal_server_error', 'Member record could not be created.');
    }

    if (preview.role?.id) {
      await tx
        .insert(communityMemberRoles)
        .values({ memberId: member.id, roleId: preview.role.id })
        .onConflictDoNothing();
    }

    await tx
      .update(dashboardInvites)
      .set({ useCount: sql`${dashboardInvites.useCount} + 1` })
      .where(eq(dashboardInvites.token, token));
  });

  return {
    accepted: true as const,
    organizationId: preview.organizationId,
    communityId: preview.communityId
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
