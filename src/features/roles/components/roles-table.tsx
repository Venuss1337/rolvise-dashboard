'use client';

import { useEffect, useState } from 'react';
import { closestCenter, DndContext, type DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { rolesQueryOptions } from '../api/queries';
import type { CommunityRole } from '../api/types';
import { RoleActions } from './role-actions';

function SortableRoleRow({ role }: { role: CommunityRole }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: role.id
  });

  return (
    <TableRow
      ref={setNodeRef}
      className={cn(isDragging && 'bg-muted/70 opacity-80')}
      style={{
        transform: CSS.Transform.toString(transform),
        transition
      }}
    >
      <TableCell className='w-10'>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='size-8 cursor-grab active:cursor-grabbing'
          {...attributes}
          {...listeners}
        >
          <span className='sr-only'>Drag role</span>
          <Icons.gripVertical className='size-4' />
        </Button>
      </TableCell>
      <TableCell>
        <div className='flex items-center gap-3'>
          <span
            className='size-3 rounded-full ring-2 ring-background'
            style={{ backgroundColor: role.color }}
          />
          <span className='font-semibold'>{role.name}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant='outline'>{role.permissions.length}</Badge>
      </TableCell>
      <TableCell>
        <span className='font-medium tabular-nums'>{role.memberCount}</span>
      </TableCell>
      <TableCell className='text-right'>
        <RoleActions role={role} />
      </TableCell>
    </TableRow>
  );
}

function RoleRow({ role }: { role: CommunityRole }) {
  return (
    <TableRow>
      <TableCell className='w-10'>
        <Button type='button' variant='ghost' size='icon' className='size-8' disabled>
          <span className='sr-only'>Drag role</span>
          <Icons.gripVertical className='size-4' />
        </Button>
      </TableCell>
      <TableCell>
        <div className='flex items-center gap-3'>
          <span
            className='size-3 rounded-full ring-2 ring-background'
            style={{ backgroundColor: role.color }}
          />
          <span className='font-semibold'>{role.name}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant='outline'>{role.permissions.length}</Badge>
      </TableCell>
      <TableCell>
        <span className='font-medium tabular-nums'>{role.memberCount}</span>
      </TableCell>
      <TableCell className='text-right'>
        <RoleActions role={role} />
      </TableCell>
    </TableRow>
  );
}

export function RolesTable() {
  const { communityId } = useCommunity();
  const { data: roles } = useSuspenseQuery(rolesQueryOptions(communityId ?? ''));
  const [orderedRoles, setOrderedRoles] = useState(roles);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setOrderedRoles(roles);
  }, [roles]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setOrderedRoles((currentRoles) => {
      const oldIndex = currentRoles.findIndex((role) => role.id === active.id);
      const newIndex = currentRoles.findIndex((role) => role.id === over.id);

      return arrayMove(currentRoles, oldIndex, newIndex);
    });
  }

  const table = (
    <div className='overflow-hidden rounded-lg border'>
      <div className='w-full overflow-x-auto'>
        <Table className='min-w-[760px]'>
          <TableHeader>
            <TableRow className='bg-muted/40 hover:bg-muted/40'>
              <TableHead className='w-10' />
              <TableHead>Role</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Members</TableHead>
              <TableHead className='w-[64px] text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <SortableContext
              items={orderedRoles.map((role) => role.id)}
              strategy={verticalListSortingStrategy}
            >
              {orderedRoles.map((role) => (
                <SortableRoleRow key={role.id} role={role} />
              ))}
            </SortableContext>

            {orderedRoles.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className='h-32 text-center text-muted-foreground'>
                  No roles found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  if (!isMounted) {
    return (
      <div className='overflow-hidden rounded-lg border'>
        <div className='w-full overflow-x-auto'>
          <Table className='min-w-[760px]'>
            <TableHeader>
              <TableRow className='bg-muted/40 hover:bg-muted/40'>
                <TableHead className='w-10' />
                <TableHead>Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Members</TableHead>
                <TableHead className='w-[64px] text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderedRoles.map((role) => (
                <RoleRow key={role.id} role={role} />
              ))}
              {orderedRoles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className='h-32 text-center text-muted-foreground'>
                    No roles found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      id='roles-sortable-context'
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
    >
      {table}
    </DndContext>
  );
}
