import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AuditLogsView } from './audit-logs-view';

function AuditLogsSkeleton() {
  return (
    <div className='space-y-4'>
      <Skeleton className='h-32 rounded-lg' />
      <Skeleton className='h-[520px] rounded-lg' />
    </div>
  );
}

export default function AuditLogsPageView() {
  return (
    <Suspense fallback={<AuditLogsSkeleton />}>
      <AuditLogsView />
    </Suspense>
  );
}
