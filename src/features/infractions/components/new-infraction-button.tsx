'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
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
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { useCommunity } from '@/features/community/hooks/use-community';
import { membersQueryOptions } from '@/features/members/api/queries';
import type { CommunityMember } from '@/features/members/api/types';
import { saveLocalInfraction } from '../lib/local-infractions';

const severityLabels: Record<string, string> = {
  mild: 'Mild',
  moderate: 'Moderate',
  severe: 'Severe',
  critical: 'Critical'
};

export function NewInfractionButton() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<CommunityMember | null>(null);
  const [severity, setSeverity] = useState('moderate');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const { communityId, organizationId, user } = useCommunity();
  const filters = useMemo(
    () => ({
      communityId: communityId ?? '',
      organizationId: organizationId ?? '',
      ...(search && { search }),
      sortBy: 'displayName' as const,
      sortDirection: 'asc' as const
    }),
    [communityId, organizationId, search]
  );
  const { data: members = [] } = useQuery({
    ...membersQueryOptions(filters),
    enabled: !!communityId && !!organizationId
  });

  function resetForm() {
    setSearch('');
    setSelectedMember(null);
    setSeverity('moderate');
    setDescription('');
    setAttachments([]);
  }

  function createInfraction() {
    if (!communityId || !selectedMember) {
      return;
    }

    saveLocalInfraction({
      id: createLocalInfractionId(),
      communityId,
      memberName: selectedMember.displayName,
      discordUsername: selectedMember.discordUsername,
      infractionType: severityLabels[severity],
      reason: description,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      assignedTo: user.name,
      attachments
    });

    resetForm();
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Icons.add />
          New Infraction
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>New Infraction</DialogTitle>
        </DialogHeader>

        <div className='grid max-h-[70vh] gap-5 overflow-y-auto pr-1'>
          <div className='grid gap-2'>
            <label className='text-sm font-medium' htmlFor='infraction-member-search'>
              User
            </label>
            <div className='relative'>
              <Icons.search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                id='infraction-member-search'
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder='Search members...'
                className='pl-9'
              />
            </div>
            <div className='max-h-48 overflow-y-auto rounded-lg border'>
              {members.map((member) => {
                const isSelected = selectedMember?.id === member.id;

                return (
                  <button
                    key={member.id}
                    type='button'
                    onClick={() => setSelectedMember(member)}
                    className={cn(
                      'flex w-full items-center gap-3 border-b px-3 py-2 text-left last:border-b-0 hover:bg-muted/50',
                      isSelected && 'bg-muted'
                    )}
                  >
                    <Avatar className='size-9'>
                      <AvatarImage src={member.discordAvatarUrl ?? undefined} alt='' />
                      <AvatarFallback>
                        {member.displayName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className='min-w-0'>
                      <div className='truncate text-sm font-semibold'>{member.displayName}</div>
                      <div className='truncate text-xs text-muted-foreground'>
                        {member.discordUsername}
                      </div>
                    </div>
                    {isSelected && <Icons.check className='ml-auto size-4' />}
                  </button>
                );
              })}

              {members.length === 0 && (
                <div className='px-3 py-8 text-center text-sm text-muted-foreground'>
                  No members found.
                </div>
              )}
            </div>
          </div>

          <div className='grid gap-2'>
            <label className='text-sm font-medium'>Severity</label>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='mild'>Mild</SelectItem>
                <SelectItem value='moderate'>Moderate</SelectItem>
                <SelectItem value='severe'>Severe</SelectItem>
                <SelectItem value='critical'>Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='grid gap-2'>
            <label className='text-sm font-medium' htmlFor='infraction-description'>
              Description
            </label>
            <Textarea
              id='infraction-description'
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className='min-h-28'
              placeholder='Add details...'
            />
          </div>

          <div className='grid gap-2'>
            <div className='text-sm font-medium'>Attachments</div>
            <div>
              <input
                id='infraction-attachments'
                type='file'
                multiple
                className='sr-only'
                onChange={(event) =>
                  setAttachments(Array.from(event.target.files ?? []).map((file) => file.name))
                }
              />
              <Button asChild type='button' variant='outline'>
                <label htmlFor='infraction-attachments' className='cursor-pointer'>
                  <Icons.add />
                  Add attachment
                </label>
              </Button>
            </div>
            {attachments.length > 0 && (
              <div className='flex flex-wrap gap-2'>
                {attachments.map((attachment) => (
                  <span
                    key={attachment}
                    className='rounded-md border bg-muted/40 px-2 py-1 text-xs text-muted-foreground'
                  >
                    {attachment}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={createInfraction} disabled={!selectedMember || !description.trim()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function createLocalInfractionId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `local-infraction-${crypto.randomUUID()}`;
  }

  return `local-infraction-${Date.now()}`;
}
