'use client';

import { useEffect, useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useCommunity } from '@/features/community/hooks/use-community';
import { infractionAppealsQueryOptions } from '../api/queries';
import type { InfractionAppeal, InfractionAppealStatus } from '../api/types';
import { AppealActions } from './appeal-actions';

const statusStyles: Record<InfractionAppealStatus, string> = {
  pending: 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300',
  approved: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  denied: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300'
};

function formatDate(date: string) {
  return date.slice(0, 10);
}

export function AppealsTable() {
  const { communityId } = useCommunity();
  const { data: appeals } = useSuspenseQuery(infractionAppealsQueryOptions(communityId ?? ''));
  const [appealRows, setAppealRows] = useState(appeals);

  useEffect(() => {
    setAppealRows(appeals);
  }, [appeals]);

  function updateAppealStatus(appealId: string, status: InfractionAppealStatus) {
    setAppealRows((currentAppeals) =>
      currentAppeals.map((appeal) => (appeal.id === appealId ? { ...appeal, status } : appeal))
    );
  }

  return (
    <section className='space-y-3'>
      <div>
        <h2 className='text-lg font-semibold'>Appeals</h2>
        <p className='text-sm text-muted-foreground'>Review queue</p>
      </div>
      <div className='overflow-hidden rounded-lg border'>
        <div className='w-full overflow-x-auto'>
          <Table className='min-w-[880px]'>
            <TableHeader>
              <TableRow className='bg-muted/40 hover:bg-muted/40'>
                <TableHead>Member</TableHead>
                <TableHead>Infraction</TableHead>
                <TableHead>Appeal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead className='w-[64px] text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appealRows.map((appeal: InfractionAppeal) => (
                <TableRow key={appeal.id}>
                  <TableCell>
                    <div>
                      <div className='font-semibold'>{appeal.memberName}</div>
                      <div className='text-sm text-muted-foreground'>{appeal.discordUsername}</div>
                    </div>
                  </TableCell>
                  <TableCell className='font-medium'>{appeal.infractionType}</TableCell>
                  <TableCell className='max-w-[340px] whitespace-normal text-muted-foreground'>
                    {appeal.reason}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant='outline'
                      className={cn('capitalize', statusStyles[appeal.status])}
                    >
                      {appeal.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(appeal.submittedAt)}</TableCell>
                  <TableCell>{appeal.assignedTo}</TableCell>
                  <TableCell className='text-right'>
                    <AppealActions
                      disabled={appeal.status !== 'pending'}
                      onApprove={() => updateAppealStatus(appeal.id, 'approved')}
                      onDeny={() => updateAppealStatus(appeal.id, 'denied')}
                    />
                  </TableCell>
                </TableRow>
              ))}

              {appealRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className='h-32 text-center text-muted-foreground'>
                    No appeals found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
