'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { RoleFormDialog } from './role-form-dialog';

export function NewRoleButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Icons.add />
        New Role
      </Button>
      <RoleFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
