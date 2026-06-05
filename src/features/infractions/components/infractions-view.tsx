import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AppealsTable } from './appeals-table';
import { InfractionsPanel } from './infractions-table';

function InfractionsSkeleton() {
  return (
    <div className='space-y-6'>
      <Skeleton className='h-[300px] rounded-lg' />
      <Skeleton className='h-[380px] rounded-lg' />
    </div>
  );
}

export default function InfractionsView() {
  return (
    <Suspense fallback={<InfractionsSkeleton />}>
      <div className='space-y-6'>
        <AppealsTable />
        <InfractionsPanel />
      </div>
    </Suspense>
  );
}
