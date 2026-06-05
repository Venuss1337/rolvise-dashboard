import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { RolesTable } from './roles-table';

function RolesTableSkeleton() {
  return <Skeleton className='h-[360px] w-full rounded-lg' />;
}

export default function RolesView() {
  return (
    <Suspense fallback={<RolesTableSkeleton />}>
      <RolesTable />
    </Suspense>
  );
}
