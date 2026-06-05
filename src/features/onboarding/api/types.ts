import type {
  DiscordGuildLink,
  ManagedServer,
  OrganizationClaimLifecycleStatus,
  OrganizationMembership,
  OrganizationSummary
} from '@/lib/rolvise-backend/types';

export interface OrganizationClaimStatus {
  discordGuildId: string;
  discordGuildName: string;
  guildOwnerDiscordId: string;
  iconUrl: string | null;
  status: OrganizationClaimLifecycleStatus;
  expiresAt: string;
}

export interface CompleteOrganizationClaimInput {
  claimToken: string;
  organizationName: string;
  initialServerName?: string | null;
  initialServerJoinCode?: string | null;
}

export interface CompleteOrganizationClaimResponse {
  organization: OrganizationSummary;
  membership: OrganizationMembership;
  discordGuild: DiscordGuildLink;
  initialServer: ManagedServer | null;
}

export interface ApiErrorPayload {
  error?: {
    code?: string;
    message?: string;
  };
}
