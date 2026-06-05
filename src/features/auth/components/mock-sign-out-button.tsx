'use client';

import { useRouter } from 'next/navigation';
import { startTransition } from 'react';
import { signOutMockUser } from '../api/mock-auth';

export function MockSignOutButton() {
  const router = useRouter();

  return (
    <button
      type='button'
      className='w-full text-left'
      onClick={() => {
        startTransition(async () => {
          await signOutMockUser();
          router.push('/auth/sign-in');
          router.refresh();
        });
      }}
    >
      Logout
    </button>
  );
}
