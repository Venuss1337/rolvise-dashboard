import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { LeaveOfAbsenceView } from './leave-of-absence-view';

function LeaveOfAbsenceSkeleton() {
  return (
    <div className='space-y-6'>
      <Skeleton className='h-[360px] rounded-lg' />
      <Skeleton className='h-[240px] rounded-lg' />
    </div>
  );
}

export default function LeaveOfAbsencePageView() {
  return (
    <Suspense fallback={<LeaveOfAbsenceSkeleton />}>
      <LeaveOfAbsenceView />
    </Suspense>
  );
}
