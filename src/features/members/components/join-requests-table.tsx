'use client';

import { useMemo, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Icons } from '@/components/icons';

type JoinRequest = {
  id: string;
  displayName: string;
  discordUsername: string;
  discordAvatarUrl: string;
  requestedAt: string;
  joinCode: string;
  note: string;
};

const initialRequests: JoinRequest[] = [
  {
    id: 'jr-001',
    displayName: 'Evan North',
    discordUsername: 'evan.north',
    discordAvatarUrl: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Evan',
    requestedAt: '2026-06-02T08:24:00.000Z',
    joinCode: 'LC-84KQ',
    note: 'Returning member from previous patrol group.'
  },
  {
    id: 'jr-002',
    displayName: 'Mira Vale',
    discordUsername: 'mira.vale',
    discordAvatarUrl: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Mira',
    requestedAt: '2026-06-02T09:10:00.000Z',
    joinCode: 'LC-9J2P',
    note: 'Applied after Discord verification.'
  },
  {
    id: 'jr-003',
    displayName: 'Cole Rivers',
    discordUsername: 'cole.rivers',
    discordAvatarUrl: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Cole',
    requestedAt: '2026-06-01T18:42:00.000Z',
    joinCode: 'LC-2H8Z',
    note: 'Invited by Command team.'
  },
  {
    id: 'jr-004',
    displayName: 'Tessa Ray',
    discordUsername: 'tessa.ray',
    discordAvatarUrl: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Tessa',
    requestedAt: '2026-06-01T17:31:00.000Z',
    joinCode: 'LC-71PK',
    note: 'Passed staff screening.'
  },
  {
    id: 'jr-005',
    displayName: 'Iris Lane',
    discordUsername: 'iris.lane',
    discordAvatarUrl: 'https://api.dicebear.com/9.x/thumbs/svg?seed=Iris',
    requestedAt: '2026-06-01T16:05:00.000Z',
    joinCode: 'LC-3M4D',
    note: 'Wants civilian role access.'
  }
];

export function JoinRequestsTable() {
  const [requests, setRequests] = useState(initialRequests);
  const [expanded, setExpanded] = useState(false);
  const [reviewRequest, setReviewRequest] = useState<JoinRequest | null>(null);
  const [reviewAllOpen, setReviewAllOpen] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const previewRows = requests.slice(0, 2);
  const hiddenCount = Math.max(0, requests.length - previewRows.length);
  const currentBulkRequest = requests[reviewIndex] ?? null;

  function resolveRequest(requestId: string) {
    setRequests((currentRequests) => {
      const nextRequests = currentRequests.filter((request) => request.id !== requestId);
      setReviewIndex((index) => Math.min(index, Math.max(0, nextRequests.length - 1)));
      return nextRequests;
    });
    setReviewRequest(null);
  }

  function resolveCurrentBulkRequest() {
    if (!currentBulkRequest) return;
    resolveRequest(currentBulkRequest.id);
  }

  const fullTable = useMemo(
    () => <JoinRequestsInnerTable requests={requests} onReview={setReviewRequest} />,
    [requests]
  );

  return (
    <section className='space-y-3'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-lg font-semibold'>Join Requests</h2>
          <p className='text-sm text-muted-foreground'>{requests.length} pending</p>
        </div>
        <Dialog open={expanded} onOpenChange={setExpanded}>
          <DialogTrigger asChild>
            <Button variant='outline' disabled={requests.length === 0}>
              Expand
            </Button>
          </DialogTrigger>
          <DialogContent className='grid h-[82vh] grid-rows-[auto_minmax(0,1fr)] sm:max-w-[min(1180px,calc(100vw-2rem))]'>
            <DialogHeader>
              <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                <DialogTitle>Join Requests</DialogTitle>
                <Button
                  disabled={requests.length === 0}
                  onClick={() => {
                    setReviewIndex(0);
                    setReviewAllOpen(true);
                  }}
                >
                  Review All
                </Button>
              </div>
            </DialogHeader>
            <div className='min-h-0 overflow-auto'>{fullTable}</div>
          </DialogContent>
        </Dialog>
      </div>

      <div className='overflow-hidden rounded-lg border'>
        <div className='w-full overflow-x-auto'>
          <Table className='min-w-[860px]'>
            <TableHeader>
              <TableRow className='bg-muted/40 hover:bg-muted/40'>
                <TableHead className='min-w-[260px]'>User</TableHead>
                <TableHead>Join Code</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className='w-[110px] text-right'>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewRows.map((request) => (
                <JoinRequestRow key={request.id} request={request} onReview={setReviewRequest} />
              ))}
              {hiddenCount > 0 && (
                <TableRow>
                  <TableCell colSpan={5} className='h-10 text-center text-sm text-muted-foreground'>
                    {hiddenCount} more...
                  </TableCell>
                </TableRow>
              )}
              {requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className='h-24 text-center text-muted-foreground'>
                    No pending join requests.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <JoinRequestReviewDialog
        request={reviewRequest}
        onOpenChange={(open) => !open && setReviewRequest(null)}
        onApprove={(requestId) => resolveRequest(requestId)}
        onDeny={(requestId) => resolveRequest(requestId)}
      />

      <Dialog open={reviewAllOpen} onOpenChange={setReviewAllOpen}>
        <DialogContent className='sm:max-w-[640px]'>
          <DialogHeader>
            <DialogTitle>Review All</DialogTitle>
          </DialogHeader>
          {currentBulkRequest ? (
            <div className='space-y-4'>
              <div className='flex items-center justify-between gap-3'>
                <Button
                  variant='outline'
                  size='icon'
                  disabled={reviewIndex === 0}
                  onClick={() => setReviewIndex((index) => Math.max(0, index - 1))}
                >
                  <Icons.chevronLeft className='size-4' />
                </Button>
                <Badge variant='outline'>
                  {reviewIndex + 1} in {requests.length}
                </Badge>
                <Button
                  variant='outline'
                  size='icon'
                  disabled={reviewIndex >= requests.length - 1}
                  onClick={() =>
                    setReviewIndex((index) => Math.min(requests.length - 1, index + 1))
                  }
                >
                  <Icons.chevronRight className='size-4' />
                </Button>
              </div>
              <JoinRequestDetails request={currentBulkRequest} />
            </div>
          ) : (
            <div className='py-12 text-center text-sm text-muted-foreground'>
              No pending join requests.
            </div>
          )}
          <DialogFooter className='gap-2'>
            <Button variant='outline' onClick={() => setReviewAllOpen(false)}>
              Close
            </Button>
            <Button
              variant='outline'
              disabled={!currentBulkRequest}
              onClick={resolveCurrentBulkRequest}
            >
              Deny
            </Button>
            <Button disabled={!currentBulkRequest} onClick={resolveCurrentBulkRequest}>
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function JoinRequestsInnerTable({
  requests,
  onReview
}: {
  requests: JoinRequest[];
  onReview: (request: JoinRequest) => void;
}) {
  return (
    <div className='overflow-hidden rounded-lg border'>
      <div className='w-full overflow-x-auto'>
        <Table className='min-w-[980px]'>
          <TableHeader>
            <TableRow className='bg-muted/40 hover:bg-muted/40'>
              <TableHead className='min-w-[260px]'>User</TableHead>
              <TableHead>Join Code</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>Note</TableHead>
              <TableHead className='w-[110px] text-right'>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <JoinRequestRow key={request.id} request={request} onReview={onReview} />
            ))}
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className='h-24 text-center text-muted-foreground'>
                  No pending join requests.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function JoinRequestRow({
  request,
  onReview
}: {
  request: JoinRequest;
  onReview: (request: JoinRequest) => void;
}) {
  return (
    <TableRow>
      <TableCell>
        <div className='flex items-center gap-3'>
          <Avatar className='size-9'>
            <AvatarImage src={request.discordAvatarUrl} alt={request.discordUsername} />
            <AvatarFallback>{request.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className='min-w-0'>
            <div className='truncate font-semibold'>{request.displayName}</div>
            <div className='truncate text-xs text-muted-foreground'>{request.discordUsername}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant='secondary'>{request.joinCode}</Badge>
      </TableCell>
      <TableCell>{formatRequestDate(request.requestedAt)}</TableCell>
      <TableCell className='max-w-[360px] truncate text-muted-foreground'>{request.note}</TableCell>
      <TableCell className='text-right'>
        <Button size='sm' variant='outline' onClick={() => onReview(request)}>
          Review
        </Button>
      </TableCell>
    </TableRow>
  );
}

function JoinRequestReviewDialog({
  request,
  onOpenChange,
  onApprove,
  onDeny
}: {
  request: JoinRequest | null;
  onOpenChange: (open: boolean) => void;
  onApprove: (requestId: string) => void;
  onDeny: (requestId: string) => void;
}) {
  return (
    <Dialog open={!!request} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[640px]'>
        <DialogHeader>
          <DialogTitle>Review Request</DialogTitle>
        </DialogHeader>
        {request && <JoinRequestDetails request={request} />}
        <DialogFooter className='gap-2'>
          <Button variant='outline' onClick={() => request && onDeny(request.id)}>
            Deny
          </Button>
          <Button onClick={() => request && onApprove(request.id)}>Approve</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function JoinRequestDetails({ request }: { request: JoinRequest }) {
  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-3 rounded-lg border bg-muted/20 p-4'>
        <Avatar className='size-11'>
          <AvatarImage src={request.discordAvatarUrl} alt={request.discordUsername} />
          <AvatarFallback>{request.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className='min-w-0'>
          <div className='truncate font-semibold'>{request.displayName}</div>
          <div className='truncate text-sm text-muted-foreground'>{request.discordUsername}</div>
        </div>
      </div>
      <div className='grid gap-3 sm:grid-cols-2'>
        <ReviewField label='Join Code' value={request.joinCode} />
        <ReviewField label='Requested' value={formatRequestDate(request.requestedAt)} />
      </div>
      <div className='rounded-lg border p-4'>
        <div className='text-sm font-medium'>Note</div>
        <div className='mt-2 text-sm leading-6 text-muted-foreground'>{request.note}</div>
      </div>
    </div>
  );
}

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-lg border p-4'>
      <div className='text-xs font-medium uppercase text-muted-foreground'>{label}</div>
      <div className='mt-1 text-sm font-medium'>{value}</div>
    </div>
  );
}

function formatRequestDate(date: string) {
  return date.slice(0, 10);
}
