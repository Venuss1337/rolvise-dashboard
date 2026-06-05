import type {
  ApiErrorPayload,
  CompleteOrganizationClaimInput,
  CompleteOrganizationClaimResponse,
  OrganizationClaimStatus
} from './types';

async function readApiResponse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => null)) as ApiErrorPayload | T | null;

  if (!response.ok) {
    const errorPayload =
      data && typeof data === 'object' && 'error' in data ? data.error : undefined;
    const message = errorPayload?.message
      ? errorPayload.message
      : `API error: ${response.status} ${response.statusText}`;

    throw new Error(message);
  }

  return data as T;
}

export async function getOrganizationClaim(claimToken: string): Promise<OrganizationClaimStatus> {
  const response = await fetch(`/api/organizations/claim/${encodeURIComponent(claimToken)}`);

  return readApiResponse<OrganizationClaimStatus>(response);
}

export async function completeOrganizationClaim(
  input: CompleteOrganizationClaimInput
): Promise<CompleteOrganizationClaimResponse> {
  const response = await fetch('/api/organizations/claim/complete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(input)
  });

  return readApiResponse<CompleteOrganizationClaimResponse>(response);
}
