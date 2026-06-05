'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { useCommunity } from '@/features/community/hooks/use-community';
import { inboxItemsQueryOptions } from '../api/queries';
import type { InboxCategory, InboxItem, InboxPriority } from '../api/types';

const categories: {
  id: InboxCategory;
  label: string;
  icon: keyof typeof Icons;
}[] = [
  { id: 'infractions', label: 'My Infractions', icon: 'warning' },
  { id: 'logs', label: 'My Logs', icon: 'adjustments' },
  { id: 'activity', label: 'My Activity', icon: 'clock' },
  { id: 'loa', label: 'My LOA', icon: 'calendar' }
];

const priorityStyles: Record<InboxPriority, string> = {
  normal: 'border-border text-muted-foreground',
  important: 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300',
  urgent: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300'
};

const priorityRank: Record<InboxPriority, number> = {
  urgent: 3,
  important: 2,
  normal: 1
};

export function MyInboxView() {
  const { communityId } = useCommunity();
  const { data: items } = useSuspenseQuery(inboxItemsQueryOptions(communityId ?? ''));
  const [category, setCategory] = useState<InboxCategory>('infractions');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const categoryItems = useMemo(
    () =>
      items.filter((item) => {
        const normalizedSearch = search.toLowerCase().trim();
        const matchesCategory = item.category === category;
        const matchesSearch =
          !normalizedSearch ||
          item.title.toLowerCase().includes(normalizedSearch) ||
          item.subject.toLowerCase().includes(normalizedSearch) ||
          item.summary.toLowerCase().includes(normalizedSearch) ||
          item.actor.toLowerCase().includes(normalizedSearch);

        return matchesCategory && matchesSearch;
      }),
    [items, category, search]
  );
  const selectedItem = categoryItems.find((item) => item.id === selectedId) ?? null;

  useEffect(() => {
    setSelectedId(null);
    setSearch('');
  }, [category]);

  function getCount(itemCategory: InboxCategory) {
    return items.filter((item) => item.category === itemCategory).length;
  }

  function getUnreadCount(itemCategory: InboxCategory) {
    return items.filter((item) => item.category === itemCategory && item.unread).length;
  }

  return (
    <div className='grid min-h-[calc(100vh-11rem)] overflow-hidden rounded-lg border bg-background lg:grid-cols-[220px_minmax(0,1fr)]'>
      <aside className='border-b bg-muted/20 p-2 lg:border-r lg:border-b-0'>
        <nav className='flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible'>
          {categories.map((item) => {
            const Icon = Icons[item.icon];
            const isActive = category === item.id;
            const unread = getUnreadCount(item.id);

            return (
              <button
                key={item.id}
                type='button'
                onClick={() => setCategory(item.id)}
                className={cn(
                  'flex h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground lg:w-full',
                  isActive && 'bg-background text-foreground shadow-xs'
                )}
              >
                <Icon className='size-4' />
                <span>{item.label}</span>
                <span className='ml-auto rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground'>
                  {unread || getCount(item.id)}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      <section className='min-h-[520px]'>
        {selectedItem ? (
          <InboxDetail item={selectedItem} onBack={() => setSelectedId(null)} />
        ) : (
          <InboxList
            items={categoryItems}
            search={search}
            onSearchChange={setSearch}
            onSelect={(itemId) => setSelectedId(itemId)}
          />
        )}
      </section>
    </div>
  );
}

function InboxList({
  items,
  search,
  onSearchChange,
  onSelect
}: {
  items: InboxItem[];
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (itemId: string) => void;
}) {
  const [priority, setPriority] = useState<InboxPriority | 'all'>('all');
  const [readState, setReadState] = useState<'all' | 'unread' | 'read'>('all');
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority' | 'unread'>('newest');
  const statuses = useMemo(
    () => Array.from(new Set(items.map((item) => item.status))).toSorted(),
    [items]
  );
  const visibleItems = useMemo(() => {
    const filteredItems = items.filter((item) => {
      const matchesPriority = priority === 'all' || item.priority === priority;
      const matchesReadState =
        readState === 'all' ||
        (readState === 'unread' && item.unread) ||
        (readState === 'read' && !item.unread);
      const matchesStatus = status === 'all' || item.status === status;

      return matchesPriority && matchesReadState && matchesStatus;
    });

    return filteredItems.toSorted((firstItem, secondItem) => {
      if (sortBy === 'oldest') {
        return new Date(firstItem.createdAt).getTime() - new Date(secondItem.createdAt).getTime();
      }

      if (sortBy === 'priority') {
        return priorityRank[secondItem.priority] - priorityRank[firstItem.priority];
      }

      if (sortBy === 'unread') {
        return Number(secondItem.unread) - Number(firstItem.unread);
      }

      return new Date(secondItem.createdAt).getTime() - new Date(firstItem.createdAt).getTime();
    });
  }, [items, priority, readState, status, sortBy]);

  function clearFilters() {
    onSearchChange('');
    setPriority('all');
    setReadState('all');
    setStatus('all');
    setSortBy('newest');
  }

  const hasActiveFilters =
    search || priority !== 'all' || readState !== 'all' || status !== 'all' || sortBy !== 'newest';

  return (
    <div className='flex h-full min-h-[520px] flex-col'>
      <div className='border-b bg-muted/10 p-3'>
        <div className='flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between'>
          <div className='flex min-w-0 flex-1 items-center gap-3'>
            <div className='relative w-full max-w-xl'>
              <Icons.search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder='Search inbox...'
                className='h-9 pl-9'
              />
            </div>
            <span className='hidden shrink-0 text-xs text-muted-foreground sm:block'>
              {visibleItems.length} {visibleItems.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            <Select
              value={priority}
              onValueChange={(value) => setPriority(value as InboxPriority | 'all')}
            >
              <SelectTrigger size='sm' className='w-[142px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All priorities</SelectItem>
                <SelectItem value='urgent'>Urgent</SelectItem>
                <SelectItem value='important'>Important</SelectItem>
                <SelectItem value='normal'>Normal</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={readState}
              onValueChange={(value) => setReadState(value as 'all' | 'unread' | 'read')}
            >
              <SelectTrigger size='sm' className='w-[118px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All mail</SelectItem>
                <SelectItem value='unread'>Unread</SelectItem>
                <SelectItem value='read'>Read</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger size='sm' className='w-[136px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All statuses</SelectItem>
                {statuses.map((itemStatus) => (
                  <SelectItem key={itemStatus} value={itemStatus}>
                    {itemStatus}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sortBy}
              onValueChange={(value) =>
                setSortBy(value as 'newest' | 'oldest' | 'priority' | 'unread')
              }
            >
              <SelectTrigger size='sm' className='w-[132px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='newest'>Newest first</SelectItem>
                <SelectItem value='oldest'>Oldest first</SelectItem>
                <SelectItem value='priority'>Priority first</SelectItem>
                <SelectItem value='unread'>Unread first</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant='ghost'
              size='sm'
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className='px-2'
            >
              <Icons.close />
              Clear
            </Button>
          </div>
        </div>
        <div className='mt-2 text-xs text-muted-foreground sm:hidden'>
          {visibleItems.length} {visibleItems.length === 1 ? 'item' : 'items'}
        </div>
      </div>

      <div className='flex-1 overflow-y-auto'>
        <div className='divide-y'>
          {visibleItems.map((item) => (
            <InboxListItem key={item.id} item={item} onClick={() => onSelect(item.id)} />
          ))}
        </div>

        {visibleItems.length === 0 && (
          <div className='flex h-48 items-center justify-center text-sm text-muted-foreground'>
            No items found.
          </div>
        )}
      </div>
    </div>
  );
}

function InboxListItem({ item, onClick }: { item: InboxItem; onClick: () => void }) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'grid w-full gap-2 px-4 py-3 text-left transition-colors hover:bg-muted/40',
        item.unread && 'bg-muted/20'
      )}
    >
      <div className='flex items-start gap-2'>
        <span
          className={cn(
            'mt-1.5 size-2 rounded-full',
            item.unread ? 'bg-primary' : 'bg-transparent'
          )}
        />
        <div className='min-w-0 flex-1'>
          <div className='flex items-start justify-between gap-2'>
            <div className='truncate text-sm font-semibold'>{item.title}</div>
            <div className='shrink-0 text-xs text-muted-foreground'>
              {formatShortDate(item.createdAt)}
            </div>
          </div>
          <div className='truncate text-sm text-muted-foreground'>{item.subject}</div>
        </div>
        <Icons.chevronRight className='mt-1 size-4 shrink-0 text-muted-foreground' />
      </div>
      <div className='line-clamp-2 pl-4 text-xs text-muted-foreground'>{item.summary}</div>
      <div className='flex items-center justify-between gap-2 pl-4'>
        <Badge variant='outline' className={cn('capitalize', priorityStyles[item.priority])}>
          {item.priority}
        </Badge>
        <span className='text-xs text-muted-foreground'>{item.status}</span>
      </div>
    </button>
  );
}

function InboxDetail({ item, onBack }: { item: InboxItem; onBack: () => void }) {
  return (
    <article className='flex h-full min-h-[520px] flex-col'>
      <div className='flex items-center gap-2 border-b p-3'>
        <Button variant='ghost' size='icon' className='size-8' onClick={onBack}>
          <span className='sr-only'>Back to inbox list</span>
          <Icons.chevronLeft className='size-4' />
        </Button>
        <div className='min-w-0'>
          <h2 className='truncate text-base font-semibold'>{item.title}</h2>
          <p className='text-sm text-muted-foreground'>{formatTimestamp(item.createdAt)}</p>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto p-5'>
        <div className='mb-5 flex flex-wrap items-center gap-2'>
          <Badge variant='outline' className={cn('capitalize', priorityStyles[item.priority])}>
            {item.priority}
          </Badge>
          <Badge variant='outline'>{item.status}</Badge>
          <span className='text-sm text-muted-foreground'>From {item.actor}</span>
        </div>

        <h3 className='mb-3 text-xl font-semibold'>{item.subject}</h3>
        <p className='max-w-3xl leading-7 text-foreground/90'>{item.body}</p>

        <div className='mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
          {item.metadata.map((entry) => (
            <div key={entry.label} className='rounded-lg border bg-muted/20 p-3'>
              <div className='text-xs font-medium uppercase text-muted-foreground'>
                {entry.label}
              </div>
              <div className='mt-1 text-sm font-semibold'>{entry.value}</div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function formatShortDate(date: string) {
  return date.slice(5, 10);
}

function formatTimestamp(date: string) {
  return date.replace('T', ' ').slice(0, 16);
}
