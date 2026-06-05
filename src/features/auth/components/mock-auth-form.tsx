'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppForm } from '@/components/ui/tanstack-form';
import { Icons } from '@/components/icons';
import { signInWithMockCredentials } from '../api/mock-auth';

const mockAuthSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter any password to continue')
});

type MockAuthFormValues = z.infer<typeof mockAuthSchema>;

export function MockAuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useAppForm({
    defaultValues: {
      email: 'owner@erlc.community',
      password: 'password'
    } as MockAuthFormValues,
    validators: {
      onSubmit: mockAuthSchema
    },
    onSubmit: async ({ value }) => {
      startTransition(async () => {
        await signInWithMockCredentials(value);
        toast.success(mode === 'sign-in' ? 'Signed in' : 'Account created');
        router.push('/dashboard/servers');
        router.refresh();
      });
    }
  });

  return (
    <form.AppForm>
      <form.Form className='w-full space-y-4'>
        <form.AppField
          name='email'
          children={(field) => (
            <field.FieldSet>
              <field.Field>
                <field.FieldLabel htmlFor={field.name}>Email</field.FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type='email'
                  autoComplete='email'
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder='owner@erlc.community'
                  disabled={isPending}
                />
              </field.Field>
              <field.FieldError />
            </field.FieldSet>
          )}
        />

        <form.AppField
          name='password'
          children={(field) => (
            <field.FieldSet>
              <field.Field>
                <field.FieldLabel htmlFor={field.name}>Password</field.FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type='password'
                  autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder='Anything works for now'
                  disabled={isPending}
                />
              </field.Field>
              <field.FieldError />
            </field.FieldSet>
          )}
        />

        <Button className='w-full' type='submit' isLoading={isPending}>
          <Icons.login />
          {mode === 'sign-in' ? 'Login' : 'Create mock account'}
        </Button>
      </form.Form>
    </form.AppForm>
  );
}
