'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

function getRedirectTo(claim: string | null) {
  if (claim) {
    return `/dashboard/onboarding/discord?claim=${encodeURIComponent(claim)}`;
  }

  return '/dashboard/servers';
}

function getClaimFromNext(next: string | null) {
  if (!next || !next.startsWith('/')) {
    return null;
  }

  try {
    const url = new URL(next, window.location.origin);

    if (url.pathname !== '/dashboard/onboarding/discord') {
      return null;
    }

    return url.searchParams.get('claim');
  } catch {
    return null;
  }
}

export function DiscordAuthButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function startDiscordLogin() {
    setIsLoading(true);

    try {
      toast.info('Starting Discord sign-in...');
      const params = new URLSearchParams(window.location.search);
      const claim = params.get('claim') ?? getClaimFromNext(params.get('next'));
      const response = await fetch('/api/auth/discord/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          redirectTo: getRedirectTo(claim)
        })
      });

      const data = (await response.json()) as { authorizationUrl?: string };

      if (!response.ok || !data.authorizationUrl) {
        throw new Error('Discord authorization URL was not returned.');
      }

      toast.success('Redirecting to Discord...');
      window.location.assign(data.authorizationUrl);
    } catch {
      setIsLoading(false);
      toast.error('Discord sign-in could not be started.');
    }
  }

  return (
    <Button className='w-full' type='button' isLoading={isLoading} onClick={startDiscordLogin}>
      <Icons.discord />
      Continue with Discord
    </Button>
  );
}
