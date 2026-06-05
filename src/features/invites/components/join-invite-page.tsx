'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import type { DashboardInvitePreview } from '../api/types';
import {
  acceptDashboardInvite,
  getDashboardInvitePreview,
  startInviteDiscordLogin
} from '../api/service';

export function JoinInvitePage({ token }: { token: string }) {
  const router = useRouter();
  const [invite, setInvite] = useState<DashboardInvitePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadInvite() {
      try {
        const data = await getDashboardInvitePreview(token);

        if (isMounted) {
          setInvite(data);
          setError(null);
        }
      } catch (inviteError) {
        if (isMounted) {
          setError(inviteError instanceof Error ? inviteError.message : 'Invite could not load.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadInvite();

    return () => {
      isMounted = false;
    };
  }, [token]);

  async function acceptInvite() {
    try {
      setIsAccepting(true);
      await acceptDashboardInvite(token);
      toast.success('Joined dashboard.');
      router.replace('/dashboard/servers');
      router.refresh();
    } catch (acceptError) {
      const message =
        acceptError instanceof Error ? acceptError.message : 'Invite could not be accepted.';

      if (message.toLowerCase().includes('sign in')) {
        setIsSigningIn(true);
        await startInviteDiscordLogin(token);
        return;
      }

      toast.error(message);
      setError(message);
      setIsAccepting(false);
    }
  }

  async function signIn() {
    setIsSigningIn(true);
    await startInviteDiscordLogin(token);
  }

  return (
    <main className='bg-background flex min-h-screen items-center justify-center p-4'>
      <Card className='w-full max-w-lg rounded-lg'>
        <CardHeader>
          <div className='mb-2 flex size-11 items-center justify-center rounded-md border bg-muted/40'>
            <Icons.share className='size-5' />
          </div>
          <CardTitle>Join Rolvise dashboard</CardTitle>
          <CardDescription>
            {isLoading
              ? 'Loading invite...'
              : invite
                ? `${invite.organizationName} invited you to ${invite.communityName}.`
                : 'This invite link is not available.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invite && (
            <div className='rounded-md border p-3 text-sm'>
              <div className='font-medium'>{invite.communityName}</div>
              <div className='text-muted-foreground mt-1'>
                Access: {invite.role?.name ?? 'Member'} · Open MDT only
              </div>
            </div>
          )}
          {error && <div className='text-destructive text-sm'>{error}</div>}
        </CardContent>
        <CardFooter className='gap-2'>
          <Button
            className='flex-1'
            isLoading={isAccepting}
            disabled={!invite || isLoading}
            onClick={acceptInvite}
          >
            Accept Invite
          </Button>
          <Button variant='outline' isLoading={isSigningIn} onClick={signIn}>
            <Icons.discord />
            Sign In
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
