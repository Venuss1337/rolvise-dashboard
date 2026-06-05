export type DiscordSnowflake = string;
export type IsoDateTime = string;
export type OrganizationRole = 'Owner' | 'Admin' | 'Moderator' | 'Member';
export type OrganizationPermission =
  | 'mdt:open'
  | 'community:view'
  | 'community:manage'
  | 'staff:view'
  | 'staff:manage'
  | 'cases:view'
  | 'cases:manage'
  | 'settings:manage';

export interface User {
  id: string;
  discordId: DiscordSnowflake;
  name: string;
  email: string | null;
  image: string | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface DiscordProfile {
  id: DiscordSnowflake;
  username: string;
  globalName: string | null;
  discriminator: string | null;
  avatarUrl: string | null;
}

export interface Session {
  token: string;
  userId: string;
  expiresAt: IsoDateTime;
  createdAt: IsoDateTime;
}

export interface AuthSessionResponse {
  authenticated: true;
  user: User;
  discord: DiscordProfile;
  expiresAt: IsoDateTime;
}

export interface DiscordGuildLink {
  discordGuildId: DiscordSnowflake;
  name: string;
  iconUrl: string | null;
  ownerDiscordId: DiscordSnowflake;
  status: 'linked' | 'bot_missing' | 'sync_required' | 'disabled';
  memberCount: number | null;
  linkedAt: IsoDateTime;
  lastSyncedAt: IsoDateTime | null;
}

export interface OrganizationMembership {
  id: string;
  userId: string;
  organizationId: string;
  role: OrganizationRole;
  permissions: OrganizationPermission[];
  joinedAt: IsoDateTime;
}

export interface OrganizationRecord {
  id: string;
  name: string;
  slug: string | null;
  discordGuild: DiscordGuildLink;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string | null;
  role: OrganizationRole;
  permissions: OrganizationPermission[];
  discordGuild: DiscordGuildLink;
  managedServerCount?: number;
  createdAt: IsoDateTime;
}

export interface OrganizationDetail extends OrganizationSummary {
  membership: OrganizationMembership;
  updatedAt: IsoDateTime;
}

export type ManagedServerStatus = 'online' | 'maintenance' | 'offline';

export interface ManagedServer {
  id: string;
  organizationId: string;
  name: string;
  imageSeed: string | null;
  status: ManagedServerStatus;
  robloxGroupId: string | null;
  joinCode: string;
  memberCount: number;
  staffCount: number;
  activePlayers: number;
  openIncidents: number;
  lastSessionAt: IsoDateTime | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface CursorPageInfo {
  hasNextPage: boolean;
  nextCursor: string | null;
}

export interface ManagedServerListResponse {
  items: ManagedServer[];
  pageInfo: CursorPageInfo;
}

export interface CommunityRole {
  id: string;
  communityId: string;
  organizationId: string;
  name: string;
  color: string;
  permissions: string[];
  memberCount: number;
  position: number;
  systemKey: string | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface CommunityMember {
  id: string;
  communityId: string;
  organizationId: string;
  userId: string | null;
  discordId: DiscordSnowflake;
  discordUsername: string;
  discordAvatarUrl: string | null;
  displayName: string;
  roles: string[];
  joinedAt: IsoDateTime;
  lastSeenAt: IsoDateTime | null;
}

export interface CommunityMemberListResponse {
  items: CommunityMember[];
}

export interface DashboardInvite {
  id: string;
  organizationId: string;
  communityId: string;
  token: string;
  inviteUrl: string;
  roleId: string | null;
  maxUses: number | null;
  useCount: number;
  expiresAt: IsoDateTime | null;
  revokedAt: IsoDateTime | null;
  createdAt: IsoDateTime;
}

export interface DashboardInvitePreview {
  token: string;
  organizationId: string;
  organizationName: string;
  communityId: string;
  communityName: string;
  role: CommunityRole | null;
  expiresAt: IsoDateTime | null;
}

export type OrganizationClaimLifecycleStatus = 'pending' | 'completed' | 'expired' | 'revoked';

export interface OrganizationClaimRecord {
  claimToken: string;
  claimUrl: string;
  discordGuildId: DiscordSnowflake;
  discordGuildName: string;
  guildOwnerDiscordId: DiscordSnowflake;
  commandUserDiscordId: DiscordSnowflake;
  botUserDiscordId: DiscordSnowflake;
  botPermissions: string[];
  iconUrl: string | null;
  memberCount: number | null;
  status: OrganizationClaimLifecycleStatus;
  expiresAt: IsoDateTime;
  createdAt: IsoDateTime;
  completedAt: IsoDateTime | null;
}

export interface OrganizationClaim {
  claimToken: string;
  claimUrl: string;
  discordGuildId: DiscordSnowflake;
  discordGuildName: string;
  guildOwnerDiscordId: DiscordSnowflake;
  status: OrganizationClaimLifecycleStatus;
  expiresAt: IsoDateTime;
  createdAt: IsoDateTime;
}

export interface OrganizationClaimStatus {
  discordGuildId: DiscordSnowflake;
  discordGuildName: string;
  guildOwnerDiscordId: DiscordSnowflake;
  iconUrl: string | null;
  status: OrganizationClaimLifecycleStatus;
  expiresAt: IsoDateTime;
}

export interface MeResponse {
  user: User;
  discord: DiscordProfile;
  organizations: OrganizationSummary[];
  activeOrganizationId: string | null;
  activeManagedServerId?: string | null;
  onboarding?: {
    requiresOrganization: boolean;
    nextUrl: string | null;
  };
}

export interface BotGuildStatusResponse {
  discordGuildId: DiscordSnowflake;
  linked: boolean;
  organizationId: string | null;
  organizationName: string | null;
  status: 'unlinked' | 'linked' | 'sync_required' | 'disabled';
  lastSyncedAt: IsoDateTime | null;
}

export type BotEventType =
  | 'guild_installed'
  | 'guild_removed'
  | 'guild_sync'
  | 'member_sync'
  | 'role_sync'
  | 'setup_started'
  | 'status_checked';

export interface BotEventRequest {
  eventId: string;
  type: BotEventType;
  discordGuildId: DiscordSnowflake;
  occurredAt: IsoDateTime;
  actorDiscordId?: DiscordSnowflake | null;
  payload?: unknown;
}

export interface BotEventAcceptedResponse {
  accepted: true;
  eventId: string;
  duplicate?: boolean;
}

export interface AuditLog {
  id: string;
  type: string;
  organizationId: string | null;
  discordGuildId: string | null;
  actorUserId: string | null;
  actorDiscordId: string | null;
  metadata: Record<string, unknown>;
  createdAt: IsoDateTime;
}
