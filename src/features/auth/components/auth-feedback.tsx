'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
import { useEffect, useState } from 'react';

function getMessage(params: URLSearchParams) {
  const auth = params.get('auth');
  const error = params.get('error') ?? params.get('code');
  const next = params.get('next');

  if (error) {
    return {
      title: 'Discord sign-in returned an error',
      description: `Code: ${error}. Check the Discord redirect URL, client secret, and Vercel env vars.`
    };
  }

  if (auth === 'missing-session') {
    return {
      title: 'No session cookie was found after redirect',
      description: next
        ? `Rolvise tried to open ${next}, but the browser did not send a Better Auth session cookie.`
        : 'Rolvise could not find a Better Auth session cookie.'
    };
  }

  return null;
}

export function AuthFeedback() {
  const [message, setMessage] = useState<ReturnType<typeof getMessage>>(null);

  useEffect(() => {
    setMessage(getMessage(new URLSearchParams(window.location.search)));
  }, []);

  if (!message) {
    return null;
  }

  return (
    <Alert variant='destructive'>
      <Icons.warning />
      <AlertTitle>{message.title}</AlertTitle>
      <AlertDescription>{message.description}</AlertDescription>
    </Alert>
  );
}
