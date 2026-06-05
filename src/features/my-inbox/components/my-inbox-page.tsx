import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { MyInboxView } from './my-inbox-view';

function MyInboxSkeleton() {
  return <Skeleton className='min-h-[calc(100vh-11rem)] rounded-lg' />;
}

export default function MyInboxPageView() {
  return (
    <Suspense fallback={<MyInboxSkeleton />}>
      <MyInboxView />
    </Suspense>
  );
}
