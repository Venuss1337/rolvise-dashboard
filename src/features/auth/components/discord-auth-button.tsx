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

export function DiscordAuthButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function startDiscordLogin() {
    setIsLoading(true);

    try {
      const params = new URLSearchParams(window.location.search);
      const response = await fetch('/api/auth/discord/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          redirectTo: getRedirectTo(params.get('claim'))
        })
      });

      const data = (await response.json()) as { authorizationUrl?: string };

      if (!response.ok || !data.authorizationUrl) {
        throw new Error('Discord authorization URL was not returned.');
      }

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
