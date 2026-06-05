'use client';

import Link from 'next/link';
import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';
import { useCommunity } from '@/features/community/hooks/use-community';

export function ServerSwitcher() {
  const { isMobile, state } = useSidebar();
  const {
    communities,
    community,
    communityId,
    switchCommunity,
    organization,
    organizationId,
    isLoaded
  } = useCommunity();

  if (!isLoaded || !community) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size='lg' asChild={isLoaded && !!organizationId}>
            {isLoaded && organizationId ? (
              <Link href='/dashboard/servers'>
                <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg'>
                  <Icons.server className='size-4' />
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-medium'>{organization?.name ?? 'No servers'}</span>
                  <span className='text-muted-foreground truncate text-xs'>Create a server</span>
                </div>
              </Link>
            ) : (
              <>
                <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg'>
                  <Icons.server className='size-4' />
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-medium'>
                    {isLoaded ? 'No organization' : 'Loading'}
                  </span>
                  <span className='text-muted-foreground truncate text-xs'>
                    {isLoaded ? 'Run /rolvise setup' : 'Fetching context'}
                  </span>
                </div>
              </>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const hiddenWhenCollapsed =
    state === 'collapsed'
      ? 'invisible max-w-0 overflow-hidden opacity-0'
      : 'visible max-w-full opacity-100';

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg'>
                <Icons.server className='size-4' />
              </div>
              <div
                className={`grid flex-1 text-left text-sm leading-tight transition-all duration-200 ease-in-out ${hiddenWhenCollapsed}`}
              >
                <span className='truncate font-medium'>{community.name}</span>
                <span className='text-muted-foreground truncate text-xs'>
                  {organization?.role ?? community.role ?? 'Member'} · {community.activePlayers}{' '}
                  online
                </span>
              </div>
              <Icons.chevronsUpDown
                className={`ml-auto transition-all duration-200 ease-in-out ${hiddenWhenCollapsed}`}
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-muted-foreground text-xs'>
              Manage server
            </DropdownMenuLabel>
            {communities.map((server) => {
              const isActive = server.id === communityId;

              return (
                <DropdownMenuItem
                  key={server.id}
                  className='items-start gap-2 p-2'
                  onClick={() => switchCommunity(server.id)}
                >
                  <div className='mt-0.5 flex size-7 items-center justify-center rounded-md border'>
                    <Icons.server className='size-4' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='truncate font-medium'>{server.name}</div>
                    <div className='text-muted-foreground text-xs'>
                      {organization?.role ?? server.role ?? 'Member'} · {server.openIncidents} open
                      cases
                    </div>
                  </div>
                  {isActive && <Icons.check className='mt-1 size-4' />}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className='gap-2 p-2'>
              <Link href='/dashboard/servers'>
                <Icons.settings className='size-4' />
                Server selection
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
