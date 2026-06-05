export interface DashboardInvite {
  id: string;
  organizationId: string;
  communityId: string;
  token: string;
  inviteUrl: string;
  roleId: string | null;
  maxUses: number | null;
  useCount: number;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

export interface CreateDashboardInviteInput {
  serverId: string;
  roleId?: string | null;
  maxUses?: number | null;
  expiresInHours?: number | null;
}
