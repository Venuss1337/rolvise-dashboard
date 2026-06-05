import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ResourcesGrid } from './resources-grid';

function ResourcesGridSkeleton() {
  return (
    <div className='space-y-4'>
      <Skeleton className='h-9 w-full max-w-sm' />
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'>
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className='h-40 rounded-lg' />
        ))}
      </div>
    </div>
  );
}

export default function ResourcesView() {
  return (
    <Suspense fallback={<ResourcesGridSkeleton />}>
      <ResourcesGrid />
    </Suspense>
  );
}
