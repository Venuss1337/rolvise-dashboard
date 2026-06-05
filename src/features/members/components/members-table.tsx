'use client';

import { useMemo, useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
import { rolesQueryOptions } from '@/features/roles/api/queries';
import { cn } from '@/lib/utils';
import { membersQueryOptions } from '../api/queries';
import type { MemberSortKey } from '../api/types';
import { MemberActions } from './member-actions';

const sortOptions: Array<{ value: MemberSortKey; label: string }> = [
  { value: 'displayName', label: 'Display name' },
  { value: 'discordUsername', label: 'Discord username' },
  { value: 'joinedAt', label: 'Join date' }
];

export function MembersTable() {
  const { communityId } = useCommunity();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState(searchParams.get('role') ?? 'all');
  const [sortBy, setSortBy] = useState<MemberSortKey>('displayName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const { data: roles } = useSuspenseQuery(rolesQueryOptions(communityId ?? ''));
  const roleById = useMemo(() => new Map(roles.map((role) => [role.id, role])), [roles]);

  const filters = useMemo(
    () => ({
      communityId: communityId ?? '',
      search,
      role: roleFilter,
      sortBy,
      sortDirection
    }),
    [communityId, roleFilter, search, sortBy, sortDirection]
  );

  const { data: members } = useSuspenseQuery(membersQueryOptions(filters));

  return (
    <div className='flex min-w-0 flex-1 flex-col gap-3'>
      <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
        <div className='relative w-full md:max-w-sm'>
          <Icons.search className='text-muted-foreground absolute top-2.5 left-2.5 size-4' />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className='pl-8'
            placeholder='Search members'
          />
        </div>

        <div className='flex flex-col gap-2 sm:flex-row'>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className='w-full sm:w-36'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All roles</SelectItem>
              <SelectItem value='none'>No roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value) => setSortBy(value as MemberSortKey)}>
            <SelectTrigger className='w-full sm:w-44'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  Sort: {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sortDirection}
            onValueChange={(value) => setSortDirection(value as 'asc' | 'desc')}
          >
            <SelectTrigger className='w-full sm:w-32'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='asc'>Ascending</SelectItem>
              <SelectItem value='desc'>Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='overflow-hidden rounded-lg border'>
        <div className='w-full overflow-x-auto'>
          <Table className='min-w-[920px]'>
            <TableHeader>
              <TableRow className='bg-muted/40 hover:bg-muted/40'>
                <TableHead className='min-w-[260px]'>User</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead className='w-[64px] text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <Avatar className='size-9'>
                        <AvatarImage src={member.discordAvatarUrl} alt={member.discordUsername} />
                        <AvatarFallback>
                          {member.displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className='min-w-0'>
                        <div className='truncate font-semibold'>{member.displayName}</div>
                        <div className='text-muted-foreground truncate text-xs'>
                          {member.discordUsername}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex flex-wrap gap-1'>
                      {member.roles.length > 0 ? (
                        member.roles.map((roleId) => {
                          const role = roleById.get(roleId);

                          return (
                            <Badge key={roleId} variant='secondary' className='gap-1.5'>
                              <span
                                className='size-2 rounded-full'
                                style={{ backgroundColor: role?.color ?? 'var(--muted)' }}
                              />
                              {role?.name ?? roleId}
                            </Badge>
                          );
                        })
                      ) : (
                        <Badge variant='outline' className='text-muted-foreground'>
                          None
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(member.joinedAt).toLocaleDateString()}</TableCell>
                  <TableCell className='text-right'>
                    <MemberActions member={member} />
                  </TableCell>
                </TableRow>
              ))}

              {members.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className='h-32 text-center'>
                    <span className={cn('text-muted-foreground text-sm')}>No members found.</span>
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
