'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Icons } from '@/components/icons';
import { deleteCommunityRole } from '../api/service';
import { roleKeys } from '../api/queries';
import type { CommunityRole } from '../api/types';
import { RoleFormDialog } from './role-form-dialog';

export function RoleActions({ role }: { role: CommunityRole }) {
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const deleteMutation = useMutation({
    mutationFn: () => deleteCommunityRole(role.organizationId, role.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: roleKeys.list(role.organizationId, role.communityId)
      });
      toast.success('Role deleted');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Role could not be deleted.');
    }
  });

  function deleteRole() {
    deleteMutation.mutate();
  }

  return (
    <>
      <RoleFormDialog role={role} open={editOpen} onOpenChange={setEditOpen} />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='icon' className='size-8'>
            <span className='sr-only'>Open role actions</span>
            <Icons.ellipsis className='size-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Icons.edit className='mr-2 size-4' />
            Edit Role
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast.info('Add members flow is next.')}>
            <Icons.add className='mr-2 size-4' />
            Add Members
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/members?role=${encodeURIComponent(role.id)}`}>
              <Icons.teams className='mr-2 size-4' />
              View Members
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className='text-destructive focus:text-destructive'
            disabled={!!role.systemKey || deleteMutation.isPending}
            onClick={deleteRole}
          >
            <Icons.trash className='mr-2 size-4' />
            Delete Role
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
