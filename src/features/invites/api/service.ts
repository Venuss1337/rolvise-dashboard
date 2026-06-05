import type {
  AcceptDashboardInviteResponse,
  ApiErrorPayload,
  DashboardInvitePreview
} from './types';

async function readApiResponse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => null)) as ApiErrorPayload | T | null;

  if (!response.ok) {
    const errorPayload =
      data && typeof data === 'object' && 'error' in data ? data.error : undefined;
    const message = errorPayload?.message ?? `API error: ${response.status} ${response.statusText}`;

    throw new Error(message);
  }

  return data as T;
}

export async function getDashboardInvitePreview(token: string): Promise<DashboardInvitePreview> {
  const response = await fetch(`/api/invites/${encodeURIComponent(token)}`);

  return readApiResponse<DashboardInvitePreview>(response);
}

export async function acceptDashboardInvite(token: string): Promise<AcceptDashboardInviteResponse> {
  const response = await fetch(`/api/invites/${encodeURIComponent(token)}/accept`, {
    method: 'POST'
  });

  return readApiResponse<AcceptDashboardInviteResponse>(response);
}

export async function startInviteDiscordLogin(token: string) {
  const response = await fetch('/api/auth/discord/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      redirectTo: `/join/${encodeURIComponent(token)}`
    })
  });
  const data = await readApiResponse<{ authorizationUrl: string }>(response);

  window.location.assign(data.authorizationUrl);
}
