'use client';

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
import type { CommunityMember } from '../api/types';

export function MemberActions({ member }: { member: CommunityMember }) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='size-8'>
          <span className='sr-only'>Open member actions</span>
          <Icons.ellipsis className='size-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/members/${member.id}`}>
            <Icons.user className='mr-2 size-4' />
            View Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => toast.info('Edit user flow is next.')}>
          <Icons.edit className='mr-2 size-4' />
          Edit User
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast.info('Manage user flow is next.')}>
          <Icons.settings className='mr-2 size-4' />
          Manage User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
