'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { OrganizationClaimStatus } from '../api/types';
import { completeOrganizationClaim, getOrganizationClaim } from '../api/service';

function formatExpiry(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

export function DiscordClaimPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const claimToken = searchParams.get('claim') ?? '';
  const [claim, setClaim] = useState<OrganizationClaimStatus | null>(null);
  const [organizationName, setOrganizationName] = useState('');
  const [initialServerName, setInitialServerName] = useState('');
  const [initialServerJoinCode, setInitialServerJoinCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);

  const canSubmit = useMemo(
    () => claimToken.length > 0 && organizationName.trim().length >= 2 && !isCompleting,
    [claimToken, isCompleting, organizationName]
  );

  useEffect(() => {
    let isMounted = true;

    async function loadClaim() {
      if (!claimToken) {
        setError('This claim link is missing its claim token.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await getOrganizationClaim(claimToken);

        if (!isMounted) {
          return;
        }

        setClaim(data);
        setOrganizationName(data.discordGuildName);
        toast.success(`Claim loaded for ${data.discordGuildName}.`);
      } catch (claimError) {
        if (!isMounted) {
          return;
        }

        const message =
          claimError instanceof Error ? claimError.message : 'This claim link could not be loaded.';
        setError(message);
        toast.error(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadClaim();

    return () => {
      isMounted = false;
    };
  }, [claimToken]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    try {
      setIsCompleting(true);
      setError(null);
      toast.info('Linking Discord organization...');
      await completeOrganizationClaim({
        claimToken,
        organizationName: organizationName.trim(),
        initialServerName: initialServerName.trim() || null,
        initialServerJoinCode: initialServerJoinCode.trim() || null
      });
      toast.success('Discord organization linked.');
      router.replace('/dashboard/servers');
      router.refresh();
    } catch (claimError) {
      const message =
        claimError instanceof Error ? claimError.message : 'This organization could not be linked.';
      setError(message);
      toast.error(message);
      setIsCompleting(false);
    }
  }

  if (isLoading) {
    return (
      <Card className='max-w-2xl rounded-lg'>
        <CardContent className='flex items-center gap-3 p-6'>
          <Icons.spinner className='text-muted-foreground size-5 animate-spin' />
          <div>
            <div className='font-medium'>Loading claim link</div>
            <div className='text-muted-foreground text-sm'>
              Checking the one-time Discord setup token.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!claim) {
    return (
      <Card className='max-w-2xl rounded-lg'>
        <CardHeader>
          <CardTitle>Claim link unavailable</CardTitle>
          <CardDescription>
            This link cannot be used right now. It may be expired, already used, or malformed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant='destructive'>
              <Icons.warning />
              <AlertTitle>Could not load claim</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button asChild variant='outline'>
            <Link href='/dashboard/servers'>Back to servers</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <Card className='max-w-2xl rounded-lg'>
        <CardHeader>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <CardTitle>Link Discord organization</CardTitle>
              <CardDescription>
                Confirm the Discord server from the bot setup command.
              </CardDescription>
            </div>
            <Badge variant='outline'>{claim.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className='space-y-5'>
          {error && (
            <Alert variant='destructive'>
              <Icons.warning />
              <AlertTitle>Linking failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className='rounded-lg border p-4'>
            <div className='flex items-center gap-3'>
              <div className='bg-muted flex size-10 items-center justify-center rounded-md border'>
                <Icons.discord className='size-5' />
              </div>
              <div className='min-w-0'>
                <div className='truncate font-medium'>{claim.discordGuildName}</div>
                <div className='text-muted-foreground text-sm'>Guild ID {claim.discordGuildId}</div>
              </div>
            </div>
            <div className='text-muted-foreground mt-3 text-sm'>
              This one-time link expires {formatExpiry(claim.expiresAt)}.
            </div>
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='organization-name'>Organization name</Label>
            <Input
              id='organization-name'
              value={organizationName}
              maxLength={100}
              onChange={(event) => setOrganizationName(event.target.value)}
              required
            />
          </div>

          <div className='grid gap-3 sm:grid-cols-2'>
            <div className='grid gap-2'>
              <Label htmlFor='server-name'>First ER:LC server</Label>
              <Input
                id='server-name'
                value={initialServerName}
                maxLength={100}
                placeholder='Optional'
                onChange={(event) => setInitialServerName(event.target.value)}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='server-code'>Join code</Label>
              <Input
                id='server-code'
                value={initialServerJoinCode}
                maxLength={32}
                placeholder='Optional'
                onChange={(event) => setInitialServerJoinCode(event.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className='justify-between gap-3'>
          <Button asChild variant='outline'>
            <Link href='/dashboard/servers'>Cancel</Link>
          </Button>
          <Button type='submit' isLoading={isCompleting} disabled={!canSubmit}>
            <Icons.check />
            Link organization
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
