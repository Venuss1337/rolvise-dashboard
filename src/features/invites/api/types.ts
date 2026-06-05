import type { CommunityRole } from '@/lib/rolvise-backend/types';

export interface DashboardInvitePreview {
  token: string;
  organizationId: string;
  organizationName: string;
  communityId: string;
  communityName: string;
  role: CommunityRole | null;
  expiresAt: string | null;
}

export interface AcceptDashboardInviteResponse {
  accepted: true;
  organizationId: string;
  communityId: string;
}

export interface ApiErrorPayload {
  error?: {
    code?: string;
    message?: string;
  };
}
