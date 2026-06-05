'use client';

import { Icons } from '@/components/icons';
import { signOutCurrentAccount } from '@/features/account/api/service';
import { useRouter } from 'next/navigation';
import { startTransition, useState } from 'react';
import { toast } from 'sonner';

export function SignOutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  return (
    <button
      type='button'
      className='flex w-full items-center gap-2 text-left'
      disabled={isPending}
      onClick={() => {
        setIsPending(true);
        startTransition(async () => {
          try {
            await signOutCurrentAccount();
            toast.success('Signed out');
            router.push('/auth/sign-in');
            router.refresh();
          } catch {
            toast.error('Sign out failed');
            setIsPending(false);
          }
        });
      }}
    >
      {isPending ? <Icons.spinner className='h-4 w-4 animate-spin' /> : <Icons.logout />}
      Logout
    </button>
  );
}
