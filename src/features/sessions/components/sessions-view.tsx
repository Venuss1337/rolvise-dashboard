import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SessionAnalyticsChart } from './session-analytics-chart';

function SessionsSkeleton() {
  return (
    <div className='grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]'>
      <Skeleton className='h-[480px] rounded-lg' />
      <Skeleton className='h-32 rounded-lg' />
    </div>
  );
}

export default function SessionsView() {
  return (
    <Suspense fallback={<SessionsSkeleton />}>
      <SessionAnalyticsChart />
    </Suspense>
  );
}
