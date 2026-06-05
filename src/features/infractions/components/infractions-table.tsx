'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
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
import { useCommunity } from '@/features/community/hooks/use-community';
import {
  getLocalInfractions,
  LOCAL_INFRACTIONS_CHANGED_EVENT,
  type LocalInfraction
} from '../lib/local-infractions';

function formatDate(date: string) {
  return date.slice(0, 10);
}

function useLocalInfractions() {
  const { communityId } = useCommunity();
  const [localInfractions, setLocalInfractions] = useState<LocalInfraction[]>([]);

  useEffect(() => {
    if (!communityId) {
      setLocalInfractions([]);
      return;
    }

    function syncLocalInfractions() {
      setLocalInfractions(getLocalInfractions(communityId ?? ''));
    }

    syncLocalInfractions();
    window.addEventListener(LOCAL_INFRACTIONS_CHANGED_EVENT, syncLocalInfractions);
    window.addEventListener('storage', syncLocalInfractions);

    return () => {
      window.removeEventListener(LOCAL_INFRACTIONS_CHANGED_EVENT, syncLocalInfractions);
      window.removeEventListener('storage', syncLocalInfractions);
    };
  }, [communityId]);

  return localInfractions;
}

function InfractionsTable({
  maxRows,
  showFilters = false
}: {
  maxRows?: number;
  showFilters?: boolean;
}) {
  const localInfractions = useLocalInfractions();
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('all');
  const filteredInfractions = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    return localInfractions.filter((infraction) => {
      const matchesSearch =
        !normalizedSearch ||
        infraction.memberName.toLowerCase().includes(normalizedSearch) ||
        infraction.discordUsername.toLowerCase().includes(normalizedSearch) ||
        infraction.reason.toLowerCase().includes(normalizedSearch);
      const matchesSeverity =
        severity === 'all' || infraction.infractionType.toLowerCase() === severity;

      return matchesSearch && matchesSeverity;
    });
  }, [localInfractions, search, severity]);
  const rows = maxRows ? filteredInfractions.slice(0, maxRows) : filteredInfractions;

  return (
    <div className='space-y-3'>
      {showFilters && (
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div className='relative w-full max-w-sm'>
            <Icons.search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder='Search infractions...'
              className='pl-9'
            />
          </div>
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger className='w-full sm:w-44'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All severities</SelectItem>
              <SelectItem value='mild'>Mild</SelectItem>
              <SelectItem value='moderate'>Moderate</SelectItem>
              <SelectItem value='severe'>Severe</SelectItem>
              <SelectItem value='critical'>Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className='overflow-hidden rounded-lg border'>
        <div className='w-full overflow-x-auto'>
          <Table className='min-w-[760px]'>
            <TableHeader>
              <TableRow className='bg-muted/40 hover:bg-muted/40'>
                <TableHead>Member</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Attachments</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Created By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((infraction) => (
                <TableRow key={infraction.id}>
                  <TableCell>
                    <div>
                      <div className='font-semibold'>{infraction.memberName}</div>
                      <div className='text-sm text-muted-foreground'>
                        {infraction.discordUsername}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='font-medium'>{infraction.infractionType}</TableCell>
                  <TableCell className='max-w-[340px] whitespace-normal text-muted-foreground'>
                    {infraction.reason}
                  </TableCell>
                  <TableCell>{infraction.attachments.length}</TableCell>
                  <TableCell>{formatDate(infraction.submittedAt)}</TableCell>
                  <TableCell>{infraction.assignedTo}</TableCell>
                </TableRow>
              ))}

              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className='h-24 text-center text-muted-foreground'>
                    No infractions created yet.
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

export function InfractionsPanel() {
  return (
    <section className='space-y-3'>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <h2 className='text-lg font-semibold'>Infractions</h2>
          <p className='text-sm text-muted-foreground'>Recent records</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant='outline' size='sm'>
              <Icons.externalLink />
              Expand
            </Button>
          </DialogTrigger>
          <DialogContent className='grid h-[86vh] grid-rows-[auto_minmax(0,1fr)] sm:max-w-[min(1120px,calc(100vw-2rem))]'>
            <DialogHeader>
              <DialogTitle>Infractions</DialogTitle>
            </DialogHeader>
            <div className='overflow-auto pr-1'>
              <InfractionsTable showFilters />
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <InfractionsTable maxRows={4} />
    </section>
  );
}
