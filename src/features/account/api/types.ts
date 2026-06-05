export type OrganizationRole = 'Owner' | 'Admin' | 'Moderator';

export type OrganizationPermission =
  | 'community:view'
  | 'community:manage'
  | 'staff:view'
  | 'staff:manage'
  | 'cases:view'
  | 'cases:manage'
  | 'settings:manage';

export interface AccountUser {
  id: string;
  discordId: string;
  name: string;
  email: string | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DiscordProfile {
  id: string;
  username: string;
  globalName: string | null;
  discriminator: string | null;
  avatarUrl: string | null;
}

export interface DiscordGuildLink {
  discordGuildId: string;
  name: string;
  iconUrl: string | null;
  ownerDiscordId: string;
  status: 'linked' | 'bot_missing' | 'sync_required' | 'disabled';
  memberCount: number | null;
  linkedAt: string;
  lastSyncedAt: string | null;
}

export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string | null;
  role: OrganizationRole;
  permissions: OrganizationPermission[];
  discordGuild: DiscordGuildLink;
  managedServerCount?: number;
  createdAt: string;
}

export interface MeResponse {
  user: AccountUser;
  discord: DiscordProfile;
  organizations: OrganizationSummary[];
  activeOrganizationId: string | null;
  activeManagedServerId?: string | null;
  onboarding?: {
    requiresOrganization: boolean;
    nextUrl: string | null;
  };
}
