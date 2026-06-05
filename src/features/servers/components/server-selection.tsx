import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { getQueryClient } from '@/lib/query-client';
import { ServerSelectionPage } from './server-selection-page';

function ServerSelectionSkeleton() {
  return (
    <div className='grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]'>
      <div className='space-y-4'>
        <Skeleton className='h-48 rounded-lg' />
        <Skeleton className='h-48 rounded-lg' />
        <Skeleton className='h-48 rounded-lg' />
      </div>
      <Skeleton className='h-64 rounded-lg' />
    </div>
  );
}

export default function ServerSelection() {
  const queryClient = getQueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ServerSelectionSkeleton />}>
        <ServerSelectionPage />
      </Suspense>
    </HydrationBoundary>
  );
}
