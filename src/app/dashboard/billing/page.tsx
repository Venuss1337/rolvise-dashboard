'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { useCommunity } from '@/features/community/hooks/use-community';

export default function BillingPage() {
  const { community, isLoaded, role } = useCommunity();

  return (
    <PageContainer
      isLoading={!isLoaded}
      access={!!community}
      accessFallback={
        <div className='flex min-h-[400px] items-center justify-center'>
          <div className='space-y-2 text-center'>
            <h2 className='text-2xl font-semibold'>No Community Selected</h2>
            <p className='text-muted-foreground'>Select a community server first.</p>
          </div>
        </div>
      }
      pageTitle='Billing & Plans'
      pageDescription={`Mock plan controls for ${community?.name}`}
    >
      <div className='space-y-6'>
        <Alert>
          <Icons.info className='h-4 w-4' />
          <AlertDescription>
            Billing is mocked while the ER:LC management workflow is being built.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Current Access</CardTitle>
            <CardDescription>Role-based access for the selected community.</CardDescription>
          </CardHeader>
          <CardContent className='flex items-center justify-between'>
            <div>
              <div className='font-medium'>{community?.name}</div>
              <div className='text-muted-foreground text-sm'>Plan configuration comes later.</div>
            </div>
            <Badge variant='outline'>{role}</Badge>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
