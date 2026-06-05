'use client';

import { useEffect, useMemo, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
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
import { DiscordSettingsForm } from '@/features/settings/components/discord-settings-form';
import { EmptySettingsPanel } from '@/features/settings/components/empty-settings-panel';
import { ErlcSettingsForm } from '@/features/settings/components/erlc-settings-form';
import { GeneralSettingsForm } from '@/features/settings/components/general-settings-form';
import { SessionsSettingsForm } from '@/features/settings/components/sessions-settings-form';
import { SettingsStateProvider } from '@/features/settings/components/settings-state-context';

type IntegrationType = 'community' | 'discord' | 'erlc';

type Integration = {
  id: string;
  name: string;
  type: IntegrationType;
  locked?: boolean;
};

type SettingsControls = {
  onCancel: () => void;
  onSave: () => void;
};

const STORAGE_KEY = 'rolvise:integrations';

const defaultIntegration: Integration = {
  id: 'community-settings',
  name: 'Community Settings',
  type: 'community',
  locked: true
};

const integrationMeta: Record<
  IntegrationType,
  {
    badge: string;
    icon: keyof typeof Icons;
  }
> = {
  community: {
    badge: 'Core',
    icon: 'settings'
  },
  discord: {
    badge: 'Discord',
    icon: 'chat'
  },
  erlc: {
    badge: 'ER:LC',
    icon: 'server'
  }
};

const tabsByType: Record<IntegrationType, Array<{ id: string; label: string }>> = {
  community: [
    { id: 'general', label: 'General' },
    { id: 'sessions', label: 'Sessions' },
    { id: 'members', label: 'Members' },
    { id: 'advanced', label: 'Advanced' }
  ],
  discord: [{ id: 'discord', label: 'Discord' }],
  erlc: [{ id: 'erlc', label: 'ER:LC' }]
};

export function IntegrationsView() {
  const [integrations, setIntegrations] = useState<Integration[]>([defaultIntegration]);
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string | null>(null);
  const [setupIntegration, setSetupIntegration] = useState<Integration | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    setIntegrations([defaultIntegration, ...JSON.parse(stored)]);
  }, []);

  function saveIntegrations(nextIntegrations: Integration[]) {
    setIntegrations(nextIntegrations);
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(nextIntegrations.filter((integration) => !integration.locked))
    );
  }

  const selectedIntegration = integrations.find(
    (integration) => integration.id === selectedIntegrationId
  );

  if (selectedIntegration) {
    return (
      <IntegrationSettingsView
        integration={selectedIntegration}
        onBack={() => setSelectedIntegrationId(null)}
      />
    );
  }

  return (
    <PageContainer
      pageTitle='Integrations'
      pageDescription='Community tools and connections'
      pageHeaderAction={
        <NewIntegrationDialog onSetup={(integration) => setSetupIntegration(integration)} />
      }
    >
      <div className='grid grid-cols-[repeat(auto-fill,minmax(220px,240px))] gap-3'>
        {integrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            onConfigure={() => setSelectedIntegrationId(integration.id)}
            onDelete={() =>
              saveIntegrations(integrations.filter((item) => item.id !== integration.id))
            }
          />
        ))}
      </div>

      <IntegrationSetupDialog
        integration={setupIntegration}
        onCancel={() => setSetupIntegration(null)}
        onComplete={(integration) => {
          saveIntegrations([...integrations, integration]);
          setSetupIntegration(null);
          setSelectedIntegrationId(integration.id);
        }}
      />
    </PageContainer>
  );
}

function IntegrationCard({
  integration,
  onConfigure,
  onDelete
}: {
  integration: Integration;
  onConfigure: () => void;
  onDelete: () => void;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const meta = integrationMeta[integration.type];
  const Icon = Icons[meta.icon];

  return (
    <>
      <article className='flex h-64 flex-col justify-between rounded-lg border bg-background p-4'>
        <div className='space-y-4'>
          <div className='flex items-start justify-between gap-3'>
            <div className='flex size-11 shrink-0 items-center justify-center rounded-md border bg-muted/40'>
              <Icon className='size-5' />
            </div>
            <div className='flex items-center gap-1'>
              <Badge variant='outline'>{integration.locked ? 'Default' : 'Added'}</Badge>
              {!integration.locked && (
                <Button
                  variant='ghost'
                  size='icon'
                  className='size-8 text-muted-foreground hover:text-destructive'
                  onClick={() => setDeleteOpen(true)}
                >
                  <Icons.trash className='size-4' />
                  <span className='sr-only'>Delete integration</span>
                </Button>
              )}
            </div>
          </div>

          <div className='min-w-0'>
            <h2 className='line-clamp-2 min-h-12 font-semibold'>{integration.name}</h2>
            <p className='mt-1 text-sm text-muted-foreground'>{meta.badge}</p>
          </div>
        </div>

        <div className='pt-5'>
          <Button size='sm' className='w-full' onClick={onConfigure}>
            Configure
          </Button>
        </div>
      </article>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {integration.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the integration card and its saved local configuration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              onClick={onDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function NewIntegrationDialog({ onSetup }: { onSetup: (integration: Integration) => void }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<Exclude<IntegrationType, 'community'>>('erlc');
  const [name, setName] = useState('ER:LC Connection');

  function beginSetup() {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    onSetup({
      id: `${type}-${Date.now()}`,
      name: trimmedName,
      type
    });
    setOpen(false);
    setType('erlc');
    setName('ER:LC Connection');
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Icons.add className='size-4' />
          New Integration
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[460px]'>
        <DialogHeader>
          <DialogTitle>New Integration</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='grid gap-2'>
            <label className='text-sm font-medium'>Type</label>
            <Select
              value={type}
              onValueChange={(value) => {
                const nextType = value as Exclude<IntegrationType, 'community'>;
                setType(nextType);
                setName(nextType === 'erlc' ? 'ER:LC Connection' : 'Discord Connection');
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='erlc'>ER:LC</SelectItem>
                <SelectItem value='discord'>Discord</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='grid gap-2'>
            <label className='text-sm font-medium' htmlFor='integration-name'>
              Name
            </label>
            <Input
              id='integration-name'
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={beginSetup}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function IntegrationSetupDialog({
  integration,
  onCancel,
  onComplete
}: {
  integration: Integration | null;
  onCancel: () => void;
  onComplete: (integration: Integration) => void;
}) {
  const [dirty, setDirty] = useState(false);
  const [controls, setControls] = useState<SettingsControls | null>(null);

  if (!integration) return null;
  const currentIntegration = integration;

  function completeSetup() {
    controls?.onSave();
    onComplete(currentIntegration);
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className='grid h-[86vh] grid-rows-[auto_minmax(0,1fr)_auto] sm:max-w-[min(980px,calc(100vw-2rem))]'>
        <DialogHeader>
          <DialogTitle>Configure {currentIntegration.name}</DialogTitle>
        </DialogHeader>

        <SettingsStateProvider onControlsChange={setControls} onDirtyChange={setDirty}>
          <div className='min-h-0 overflow-auto pr-1'>
            {currentIntegration.type === 'erlc' && <ErlcSettingsForm />}
            {currentIntegration.type === 'discord' && <DiscordSettingsForm />}
          </div>
        </SettingsStateProvider>

        <DialogFooter className='border-t pt-4'>
          <div className='flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className='text-sm text-muted-foreground'>
              {dirty ? 'Unsaved setup changes' : 'Setup required'}
            </div>
            <div className='flex justify-end gap-2'>
              <Button variant='outline' onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={completeSetup}>Create Integration</Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function IntegrationSettingsView({
  integration,
  onBack
}: {
  integration: Integration;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState(tabsByType[integration.type][0].id);
  const [dirty, setDirty] = useState(false);
  const [controls, setControls] = useState<SettingsControls | null>(null);
  const tabs = tabsByType[integration.type];
  const activeTabLabel = tabs.find((tab) => tab.id === activeTab)?.label ?? integration.name;

  const content = useMemo(() => {
    if (activeTab === 'general') return <GeneralSettingsForm />;
    if (activeTab === 'sessions') return <SessionsSettingsForm />;
    if (activeTab === 'discord') return <DiscordSettingsForm />;
    if (activeTab === 'erlc') return <ErlcSettingsForm />;

    return <EmptySettingsPanel />;
  }, [activeTab]);

  return (
    <SettingsStateProvider onControlsChange={setControls} onDirtyChange={setDirty}>
      <div className='grid min-h-[calc(100vh-11rem)] overflow-hidden rounded-lg border bg-background md:grid-cols-[220px_minmax(0,1fr)]'>
        <aside className='border-b bg-muted/20 p-3 md:border-r md:border-b-0'>
          <div className='mb-4 flex min-w-0 items-center gap-2'>
            <Button variant='outline' size='icon' className='size-8 shrink-0' onClick={onBack}>
              <Icons.chevronLeft className='size-4' />
            </Button>
            <div className='min-w-0'>
              <div className='truncate text-sm font-semibold'>{integration.name}</div>
              <div className='text-xs text-muted-foreground'>
                {integrationMeta[integration.type].badge}
              </div>
            </div>
          </div>

          <nav className='flex gap-2 overflow-x-auto md:flex-col md:overflow-visible'>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type='button'
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex h-9 shrink-0 items-center rounded-md px-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground md:w-full',
                  activeTab === tab.id && 'bg-background text-foreground shadow-xs'
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <section className='relative min-h-[620px] overflow-auto'>
          <div className='border-b bg-background px-4 py-4 md:px-6'>
            <h2 className='text-lg font-semibold'>{activeTabLabel}</h2>
          </div>

          <div className='mx-auto w-full max-w-5xl p-4 pb-28 md:p-6 md:pb-28'>{content}</div>

          {dirty && (
            <div className='absolute inset-x-4 bottom-4 z-20 flex flex-col gap-3 rounded-lg border bg-background p-3 shadow-lg sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <div className='text-sm font-semibold'>Unsaved changes</div>
                <div className='text-sm text-muted-foreground'>Save or cancel before leaving.</div>
              </div>
              <div className='flex gap-2'>
                <Button variant='outline' onClick={() => controls?.onCancel()}>
                  Cancel
                </Button>
                <Button onClick={() => controls?.onSave()}>Save</Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </SettingsStateProvider>
  );
}
