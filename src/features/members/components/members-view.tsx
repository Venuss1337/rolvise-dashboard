import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { JoinRequestsTable } from './join-requests-table';
import { MembersTable } from './members-table';

function MembersTableSkeleton() {
  return (
    <div className='flex flex-1 flex-col gap-3'>
      <Skeleton className='h-[210px] w-full rounded-lg' />
      <div className='flex justify-between gap-2'>
        <Skeleton className='h-9 w-80' />
        <Skeleton className='h-9 w-96' />
      </div>
      <Skeleton className='h-[440px] w-full rounded-lg' />
    </div>
  );
}

export default function MembersView() {
  return (
    <div className='space-y-6'>
      <JoinRequestsTable />
      <Suspense fallback={<MembersTableSkeleton />}>
        <MembersTable />
      </Suspense>
    </div>
  );
}
