'use client';

import { useMemo, useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { useCommunity } from '@/features/community/hooks/use-community';
import { resourcesQueryOptions } from '../api/queries';
import { NewResourceButton } from './new-resource-button';
import { ResourceCard } from './resource-card';

export function ResourcesGrid() {
  const [search, setSearch] = useState('');
  const { communityId } = useCommunity();
  const filters = useMemo(
    () => ({
      communityId: communityId ?? '',
      ...(search && { search })
    }),
    [communityId, search]
  );
  const { data: resources } = useSuspenseQuery(resourcesQueryOptions(filters));

  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='relative w-full max-w-sm'>
          <Icons.search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder='Search resources...'
            className='pl-9'
          />
        </div>
        <NewResourceButton />
      </div>

      {resources.length > 0 ? (
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'>
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      ) : (
        <div className='flex h-48 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground'>
          No resources found.
        </div>
      )}
    </div>
  );
}
