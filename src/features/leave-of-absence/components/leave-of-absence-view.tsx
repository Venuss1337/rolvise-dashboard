'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { useCommunity } from '@/features/community/hooks/use-community';
import { loaRequestsQueryOptions } from '../api/queries';
import type { LoaRequest, LoaStatus } from '../api/types';

const statusStyles: Record<LoaStatus, string> = {
  pending: 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300',
  approved: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  denied: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
  expired: 'border-border text-muted-foreground'
};

export function LeaveOfAbsenceView() {
  const { communityId, user } = useCommunity();
  const { data } = useSuspenseQuery(loaRequestsQueryOptions(communityId ?? ''));
  const [requests, setRequests] = useState(data);

  useEffect(() => {
    setRequests(data);
  }, [data]);

  function reviewRequest(requestId: string, status: 'approved' | 'denied') {
    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === requestId ? { ...request, status, reviewedBy: user.name } : request
      )
    );
  }

  const incoming = requests.filter((request) => request.status === 'pending');
  const archived = requests.filter((request) => request.status !== 'pending');

  return (
    <div className='space-y-6'>
      <IncomingLoaTable requests={incoming} onReview={reviewRequest} />
      <ArchivedLoaPanel requests={archived} />
    </div>
  );
}

function IncomingLoaTable({
  requests,
  onReview
}: {
  requests: LoaRequest[];
  onReview: (requestId: string, status: 'approved' | 'denied') => void;
}) {
  return (
    <section className='space-y-3'>
      <div>
        <h2 className='text-lg font-semibold'>Incoming Requests</h2>
        <p className='text-sm text-muted-foreground'>Needs admin review</p>
      </div>
      <div className='overflow-hidden rounded-lg border'>
        <div className='w-full overflow-x-auto'>
          <Table className='min-w-[900px]'>
            <TableHeader>
              <TableRow className='bg-muted/40 hover:bg-muted/40'>
                <TableHead>Member</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <div className='font-semibold'>{request.memberName}</div>
                      <div className='text-sm text-muted-foreground'>
                        {request.discordUsername} · {request.role}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='font-medium'>
                    {request.startsAt} to {request.endsAt}
                  </TableCell>
                  <TableCell>{getDurationLabel(request)}</TableCell>
                  <TableCell>{formatDate(request.submittedAt)}</TableCell>
                  <TableCell className='text-right'>
                    <IncomingLoaReviewDialog request={request} onReview={onReview} />
                  </TableCell>
                </TableRow>
              ))}

              {requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className='h-32 text-center text-muted-foreground'>
                    No incoming LOA requests.
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

function IncomingLoaReviewDialog({
  request,
  onReview
}: {
  request: LoaRequest;
  onReview: (requestId: string, status: 'approved' | 'denied') => void;
}) {
  const [open, setOpen] = useState(false);
  const profileHref = `/dashboard/members/${toMemberId(request.memberName)}`;

  function handleReview(status: 'approved' | 'denied') {
    onReview(request.id, status);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='sm' variant='outline'>
          Review
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[680px]'>
        <DialogHeader>
          <DialogTitle>Review LOA Request</DialogTitle>
          <DialogDescription>
            {request.memberName} · {request.discordUsername}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='grid gap-3 rounded-lg border bg-muted/20 p-4 sm:grid-cols-3'>
            <ReviewDetail label='Role' value={request.role} />
            <ReviewDetail label='Dates' value={`${request.startsAt} to ${request.endsAt}`} />
            <ReviewDetail label='Duration' value={getDurationLabel(request)} />
            <ReviewDetail label='Submitted' value={formatDate(request.submittedAt)} />
            <ReviewDetail label='Discord' value={request.discordUsername} />
            <div className='flex items-end'>
              <Button asChild variant='outline' className='w-full justify-center'>
                <Link href={profileHref}>
                  <Icons.user className='size-4' />
                  View User Profile
                </Link>
              </Button>
            </div>
          </div>

          <div className='space-y-2'>
            <div className='text-sm font-medium'>Reason</div>
            <div className='min-h-24 rounded-lg border bg-background p-3 text-sm leading-6 text-muted-foreground'>
              {request.reason}
            </div>
          </div>
        </div>

        <DialogFooter className='gap-2 sm:justify-between'>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <div className='flex gap-2'>
            <Button variant='outline' onClick={() => handleReview('denied')}>
              Deny
            </Button>
            <Button onClick={() => handleReview('approved')}>Approve</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReviewDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className='min-w-0'>
      <div className='text-xs font-medium uppercase text-muted-foreground'>{label}</div>
      <div className='mt-1 truncate text-sm font-medium'>{value}</div>
    </div>
  );
}

function ArchivedLoaPanel({ requests }: { requests: LoaRequest[] }) {
  return (
    <section className='space-y-3'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-lg font-semibold'>Archived Records</h2>
          <p className='text-sm text-muted-foreground'>
            {requests.length} {requests.length === 1 ? 'record' : 'records'}
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant='outline' disabled={requests.length === 0}>
              <Icons.externalLink />
              Expand
            </Button>
          </DialogTrigger>
          <DialogContent className='grid h-[88vh] w-[calc(100vw-2rem)] grid-rows-[auto_minmax(0,1fr)] sm:max-w-[min(1440px,calc(100vw-2rem))]'>
            <DialogHeader>
              <DialogTitle>Archived LOA Records</DialogTitle>
            </DialogHeader>
            <div className='overflow-auto pr-1'>
              <ArchivedLoaTable requests={requests} showFilters />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ArchivedLoaTable requests={requests} maxRows={3} />
    </section>
  );
}

function ArchivedLoaTable({
  maxRows,
  requests,
  showFilters = false
}: {
  maxRows?: number;
  requests: LoaRequest[];
  showFilters?: boolean;
}) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<LoaStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'duration'>('newest');
  const filteredRequests = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    return requests
      .filter((request) => {
        const matchesSearch =
          !normalizedSearch ||
          request.memberName.toLowerCase().includes(normalizedSearch) ||
          request.discordUsername.toLowerCase().includes(normalizedSearch) ||
          request.reason.toLowerCase().includes(normalizedSearch) ||
          request.role.toLowerCase().includes(normalizedSearch);
        const matchesStatus = status === 'all' || request.status === status;

        return matchesSearch && matchesStatus;
      })
      .toSorted((firstRequest, secondRequest) => {
        if (sortBy === 'oldest') {
          return (
            new Date(firstRequest.submittedAt).getTime() -
            new Date(secondRequest.submittedAt).getTime()
          );
        }

        if (sortBy === 'duration') {
          return getDurationDays(secondRequest) - getDurationDays(firstRequest);
        }

        return (
          new Date(secondRequest.submittedAt).getTime() -
          new Date(firstRequest.submittedAt).getTime()
        );
      });
  }, [requests, search, status, sortBy]);
  const rows = maxRows ? filteredRequests.slice(0, maxRows) : filteredRequests;
  const hiddenCount = maxRows ? Math.max(0, filteredRequests.length - rows.length) : 0;

  return (
    <div className='space-y-4'>
      {showFilters && (
        <div className='flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between'>
          <div className='relative w-full max-w-xl'>
            <Icons.search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder='Search archived records...'
              className='pl-9'
            />
          </div>
          <div className='flex flex-wrap gap-2'>
            <Select value={status} onValueChange={(value) => setStatus(value as LoaStatus | 'all')}>
              <SelectTrigger className='w-40'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All statuses</SelectItem>
                <SelectItem value='approved'>Approved</SelectItem>
                <SelectItem value='denied'>Denied</SelectItem>
                <SelectItem value='expired'>Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
              <SelectTrigger className='w-40'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='newest'>Newest</SelectItem>
                <SelectItem value='oldest'>Oldest</SelectItem>
                <SelectItem value='duration'>Duration</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className='overflow-hidden rounded-lg border'>
        <div className='w-full overflow-x-auto'>
          <Table className='min-w-[1180px]'>
            <TableHeader>
              <TableRow className='bg-muted/40 hover:bg-muted/40'>
                <TableHead className='w-[220px]'>Member</TableHead>
                <TableHead className='w-[260px]'>Dates</TableHead>
                <TableHead className='w-[140px]'>Status</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className='w-[180px]'>Reviewed By</TableHead>
                <TableHead className='w-[150px]'>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <div className='font-semibold'>{request.memberName}</div>
                      <div className='text-sm text-muted-foreground'>{request.discordUsername}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {request.startsAt} to {request.endsAt}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant='outline'
                      className={cn('capitalize', statusStyles[request.status])}
                    >
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell className='whitespace-normal text-muted-foreground'>
                    {request.reason}
                  </TableCell>
                  <TableCell>{request.reviewedBy ?? '—'}</TableCell>
                  <TableCell>{formatDate(request.submittedAt)}</TableCell>
                </TableRow>
              ))}

              {hiddenCount > 0 && (
                <TableRow>
                  <TableCell colSpan={6} className='h-10 text-center text-muted-foreground'>
                    {hiddenCount} more...
                  </TableCell>
                </TableRow>
              )}

              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className='h-24 text-center text-muted-foreground'>
                    No archived records.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function formatDate(date: string) {
  return date.slice(0, 10);
}

function toMemberId(memberName: string) {
  return memberName.toLowerCase().replaceAll(' ', '-');
}

function getDurationDays(request: LoaRequest) {
  const start = new Date(`${request.startsAt}T00:00:00.000Z`).getTime();
  const end = new Date(`${request.endsAt}T00:00:00.000Z`).getTime();

  return Math.max(1, Math.round((end - start) / (24 * 60 * 60 * 1000)) + 1);
}

function getDurationLabel(request: LoaRequest) {
  const days = getDurationDays(request);

  return `${days} ${days === 1 ? 'day' : 'days'}`;
}
