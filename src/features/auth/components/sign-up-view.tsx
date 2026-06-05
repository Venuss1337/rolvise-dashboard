import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Metadata } from 'next';
import Link from 'next/link';
import { InteractiveGridPattern } from './interactive-grid';
import { MockAuthForm } from './mock-auth-form';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};

export default function SignUpViewPage() {
  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <Link
        href='/auth/sign-in'
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute top-4 right-4 md:top-8 md:right-8'
        )}
      >
        Login
      </Link>
      <div className='relative hidden h-full flex-col p-10 lg:flex dark:border-r'>
        <div className='absolute inset-0 bg-sidebar' />
        <div className='text-sidebar-foreground relative z-20 flex items-center text-lg font-medium'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='mr-2 h-6 w-6'
          >
            <path d='M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3' />
          </svg>
          Rolvise
        </div>
        <InteractiveGridPattern
          className={cn(
            'mask-[radial-gradient(400px_circle_at_center,white,transparent)]',
            'inset-x-0 inset-y-[0%] h-full skew-y-12'
          )}
        />
        <div className='text-sidebar-foreground relative z-20 mt-auto'>
          <blockquote className='space-y-2'>
            <p className='text-lg'>
              &ldquo;Create a local mock account now. Real Roblox-linked auth can arrive once the
              dashboard workflow is solid.&rdquo;
            </p>
            <footer className='text-sidebar-foreground/70 text-sm'>Development access</footer>
          </blockquote>
        </div>
      </div>
      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <div className='flex w-full max-w-md flex-col items-center justify-center space-y-6'>
          <div className='w-full space-y-2 text-center'>
            <h1 className='text-2xl font-semibold tracking-tight'>Create mock account</h1>
            <p className='text-muted-foreground text-sm'>
              Any email and password signs you into the local development session.
            </p>
          </div>
          <MockAuthForm mode='sign-up' />
          <div className='text-muted-foreground space-y-2 px-8 text-center text-xs'>
            <p>This flow is intentionally permissive while the ER:LC dashboard is being shaped.</p>
          </div>
          <p className='text-muted-foreground px-8 text-center text-sm'>
            By clicking continue, you agree to our{' '}
            <Link
              href='/terms-of-service'
              className='hover:text-primary underline underline-offset-4'
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href='/privacy-policy'
              className='hover:text-primary underline underline-offset-4'
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
