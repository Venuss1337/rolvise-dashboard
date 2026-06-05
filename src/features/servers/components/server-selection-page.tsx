'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { serversQueryOptions } from '../api/queries';
import type { ManagedServer, ManagedServerStatus } from '../api/types';
import { useSelectedServer } from '../hooks/use-selected-server';

const statusLabels: Record<ManagedServerStatus, string> = {
  online: 'Online',
  maintenance: 'Maintenance',
  offline: 'Offline'
};

const statusClasses: Record<ManagedServerStatus, string> = {
  online: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  maintenance: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  offline: 'border-muted bg-muted text-muted-foreground'
};

function ServerCard({
  server,
  isSelected,
  onSelect
}: {
  server: ManagedServer;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <Card
      className={cn(
        'overflow-hidden rounded-lg py-0 transition-colors',
        isSelected && 'border-primary/70 bg-primary/[0.03] shadow-sm'
      )}
    >
      <CardContent className='flex h-full flex-col p-3'>
        <div className='bg-muted relative flex aspect-[16/9] min-h-28 items-center justify-center overflow-hidden rounded-md border'>
          <div className='absolute inset-0 bg-[linear-gradient(135deg,var(--muted),var(--secondary),var(--accent))]' />
          <div className='bg-background/85 text-foreground relative flex size-14 items-center justify-center rounded-md border text-base font-semibold tracking-wide shadow-sm'>
            {server.imageSeed}
          </div>
        </div>

        <div className='mt-3 flex min-w-0 items-start justify-between gap-2'>
          <div className='min-w-0'>
            <h3 className='truncate text-sm font-semibold'>{server.name}</h3>
            <div className='text-muted-foreground mt-1 text-xs'>
              {server.joinCode} · Group {server.robloxGroupId}
            </div>
          </div>
          <Badge variant='outline' className={cn('shrink-0', statusClasses[server.status])}>
            {statusLabels[server.status]}
          </Badge>
        </div>

        <div className='mt-3 flex flex-wrap gap-1.5'>
          <Badge variant='secondary'>{server.role}</Badge>
          <Badge variant='outline'>{server.activePlayers} online</Badge>
          <Badge variant='outline'>{server.openIncidents} cases</Badge>
        </div>

        <div className='mt-4 grid grid-cols-3 gap-2 text-xs'>
          <div>
            <div className='text-muted-foreground'>Members</div>
            <div className='font-medium tabular-nums'>{server.memberCount.toLocaleString()}</div>
          </div>
          <div>
            <div className='text-muted-foreground'>Staff</div>
            <div className='font-medium tabular-nums'>{server.staffCount}</div>
          </div>
          <div>
            <div className='text-muted-foreground'>Session</div>
            <div className='font-medium tabular-nums'>
              {new Date(server.lastSessionAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <Button
          size='sm'
          variant={isSelected ? 'secondary' : 'default'}
          className='mt-4 w-full'
          onClick={onSelect}
        >
          {isSelected ? (
            <>
              <Icons.check /> Selected
            </>
          ) : (
            'Select'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export function ServerSelectionPage() {
  const { data: servers } = useSuspenseQuery(serversQueryOptions());
  const { selectedServerId, selectServer } = useSelectedServer(servers);

  return (
    <div className='grid max-w-5xl gap-3 sm:grid-cols-2 xl:grid-cols-3'>
      {servers.map((server) => (
        <ServerCard
          key={server.id}
          server={server}
          isSelected={server.id === selectedServerId}
          onSelect={() => selectServer(server.id)}
        />
      ))}
    </div>
  );
}
