'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
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
import { roleKeys } from '../api/queries';
import type { CommunityRole } from '../api/types';
import { ROLE_PERMISSION_OPTIONS } from '../constants/permissions';

function createRoleId(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || `role-${Date.now()}`
  );
}

export function RoleFormDialog({
  role,
  open,
  onOpenChange
}: {
  role?: CommunityRole;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = !!role;
  const { communityId } = useCommunity();
  const queryClient = useQueryClient();
  const [name, setName] = useState(role?.name ?? '');
  const [color, setColor] = useState(role?.color ?? '#3b82f6');
  const [permissions, setPermissions] = useState<string[]>(role?.permissions ?? []);

  const availablePermissions = useMemo(
    () => ROLE_PERMISSION_OPTIONS.filter((permission) => !permissions.includes(permission)),
    [permissions]
  );

  useEffect(() => {
    if (open) {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset from current role when dialog opens
  }, [open, role?.id]);

  function reset() {
    setName(role?.name ?? '');
    setColor(role?.color ?? '#3b82f6');
    setPermissions(role?.permissions ?? []);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  }

  function handleSubmit() {
    if (!communityId || !name.trim()) return;

    const nextRole: CommunityRole = {
      id: role?.id ?? createRoleId(name),
      communityId,
      name: name.trim(),
      color,
      permissions,
      memberCount: role?.memberCount ?? 0
    };

    queryClient.setQueryData<CommunityRole[]>(roleKeys.list(communityId), (currentRoles = []) => {
      if (isEdit) {
        return currentRoles.map((currentRole) =>
          currentRole.id === nextRole.id ? nextRole : currentRole
        );
      }

      return [...currentRoles, nextRole];
    });

    toast.success(isEdit ? 'Role saved' : 'Role created');
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Role' : 'New Role'}</DialogTitle>
        </DialogHeader>

        <div className='grid gap-4'>
          <div className='grid gap-2'>
            <label htmlFor='role-name' className='text-sm font-medium'>
              Name
            </label>
            <Input
              id='role-name'
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder='Role name'
            />
          </div>

          <div className='grid gap-2'>
            <label htmlFor='role-color' className='text-sm font-medium'>
              Color
            </label>
            <div className='flex items-center gap-3'>
              <Input
                id='role-color'
                type='color'
                value={color}
                onChange={(event) => setColor(event.target.value)}
                className='h-9 w-14 cursor-pointer p-1'
                aria-label='Role color'
              />
              <div className='flex items-center gap-2 text-sm'>
                <span className='size-3 rounded-full' style={{ backgroundColor: color }} />
                {color}
              </div>
            </div>
          </div>

          <div className='grid gap-2'>
            <div className='flex items-center justify-between gap-3'>
              <div className='text-sm font-medium'>Permissions</div>
              <Select
                key={permissions.join('|')}
                disabled={availablePermissions.length === 0}
                onValueChange={(permission) => {
                  setPermissions((currentPermissions) => [...currentPermissions, permission]);
                }}
              >
                <SelectTrigger size='sm' className='h-8 w-44'>
                  <Icons.add />
                  <SelectValue placeholder='Add Permission' />
                </SelectTrigger>
                <SelectContent>
                  {availablePermissions.map((permission) => (
                    <SelectItem key={permission} value={permission}>
                      {permission}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='overflow-hidden rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow className='bg-muted/40 hover:bg-muted/40'>
                    <TableHead>Permission</TableHead>
                    <TableHead className='w-10' />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map((permission) => (
                    <TableRow key={permission}>
                      <TableCell className='capitalize'>{permission}</TableCell>
                      <TableCell className='text-right'>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='size-8'
                          onClick={() =>
                            setPermissions((currentPermissions) =>
                              currentPermissions.filter(
                                (currentPermission) => currentPermission !== permission
                              )
                            )
                          }
                        >
                          <span className='sr-only'>Remove permission</span>
                          <Icons.close className='size-4' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {permissions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className='h-20 text-center text-muted-foreground'>
                        No permissions.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button type='button' onClick={handleSubmit} disabled={!name.trim()}>
            {isEdit ? 'Save' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
