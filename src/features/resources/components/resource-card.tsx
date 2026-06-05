import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { CommunityResource, CommunityResourceType } from '../api/types';

const resourceTypeLabels: Record<CommunityResourceType, string> = {
  document: 'Document',
  form: 'Form',
  application: 'Application'
};

const resourceTypeStyles: Record<CommunityResourceType, string> = {
  document: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
  form: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  application: 'bg-amber-500/10 text-amber-800 dark:text-amber-300'
};

const resourceTypeIcons: Record<
  CommunityResourceType,
  React.ComponentType<{ className?: string }>
> = {
  document: Icons.post,
  form: Icons.forms,
  application: Icons.page
};

function formatStableDate(date: string) {
  return date.slice(0, 10);
}

export function ResourceCard({ resource }: { resource: CommunityResource }) {
  const Icon = resourceTypeIcons[resource.type];

  return (
    <article className='group flex min-h-40 flex-col justify-between rounded-lg border bg-card p-4 shadow-xs transition-colors hover:border-foreground/20'>
      <div className='flex items-start justify-between gap-4'>
        <div
          className={cn(
            'flex size-10 items-center justify-center rounded-md',
            resourceTypeStyles[resource.type]
          )}
        >
          <Icon className='size-5' />
        </div>
        <Badge variant='outline'>{resourceTypeLabels[resource.type]}</Badge>
      </div>

      <div className='space-y-3'>
        <div>
          <h3 className='line-clamp-2 text-base font-semibold'>{resource.title}</h3>
          <p className='text-sm text-muted-foreground'>{resource.owner}</p>
        </div>
        <div className='flex items-center justify-between gap-3 text-xs text-muted-foreground'>
          <span>{formatStableDate(resource.updatedAt)}</span>
          <Icons.chevronRight className='size-4 opacity-0 transition-opacity group-hover:opacity-100' />
        </div>
      </div>
    </article>
  );
}
