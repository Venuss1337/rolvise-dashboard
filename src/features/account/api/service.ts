import { apiClient } from '@/lib/api-client';
import type { MeResponse } from './types';

export async function getCurrentAccount(): Promise<MeResponse> {
  return apiClient<MeResponse>('/me');
}

export async function signOutCurrentAccount(): Promise<void> {
  await fetch('/api/auth/sign-out', {
    method: 'POST'
  });
}
