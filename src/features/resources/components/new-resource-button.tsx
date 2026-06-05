'use client';

import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Icons } from '@/components/icons';
import { useCommunity } from '@/features/community/hooks/use-community';
import { createResourceMutation } from '../api/mutations';
import type { CommunityResourceType } from '../api/types';

const resourceTypeLabels: Record<CommunityResourceType, string> = {
  document: 'Document',
  form: 'Form',
  application: 'Application'
};

const resourceTypeIcons: Record<
  CommunityResourceType,
  React.ComponentType<{ className?: string }>
> = {
  document: Icons.post,
  form: Icons.forms,
  application: Icons.page
};

export function NewResourceButton() {
  const { communityId, user } = useCommunity();
  const mutation = useMutation(createResourceMutation);

  function createCard(type: CommunityResourceType) {
    if (!communityId) {
      return;
    }

    mutation.mutate({
      communityId,
      title: `Untitled ${resourceTypeLabels[type]}`,
      type,
      owner: user.name
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={!communityId || mutation.isPending} isLoading={mutation.isPending}>
          <Icons.add />
          New
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48'>
        <DropdownMenuLabel>Create</DropdownMenuLabel>
        {(Object.keys(resourceTypeLabels) as CommunityResourceType[]).map((type) => {
          const Icon = resourceTypeIcons[type];

          return (
            <DropdownMenuItem key={type} onClick={() => createCard(type)}>
              <Icon className='size-4' />
              {resourceTypeLabels[type]}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
