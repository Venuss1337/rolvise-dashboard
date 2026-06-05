'use client';

import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useSettingsFormState } from './settings-state-context';

export function DiscordSettingsForm() {
  const [discord, setDiscord] = useSettingsFormState({
    guildId: '1184927046182',
    logChannel: '#staff-logs',
    syncNicknames: true,
    alertRole: '@Command'
  });

  return (
    <div className='max-w-3xl space-y-4'>
      <div className='rounded-lg border p-4'>
        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='grid gap-2'>
            <label className='text-sm font-medium' htmlFor='guild-id'>
              Guild ID
            </label>
            <Input
              id='guild-id'
              value={discord.guildId}
              onChange={(event) => setDiscord({ ...discord, guildId: event.target.value })}
            />
          </div>

          <div className='grid gap-2'>
            <label className='text-sm font-medium' htmlFor='alert-role'>
              Alert role
            </label>
            <Input
              id='alert-role'
              value={discord.alertRole}
              onChange={(event) => setDiscord({ ...discord, alertRole: event.target.value })}
            />
          </div>
        </div>
      </div>

      <div className='rounded-lg border p-4'>
        <div className='grid gap-4'>
          <div className='grid gap-2'>
            <label className='text-sm font-medium' htmlFor='log-channel'>
              Log channel
            </label>
            <Input
              id='log-channel'
              value={discord.logChannel}
              onChange={(event) => setDiscord({ ...discord, logChannel: event.target.value })}
            />
          </div>

          <div className='flex items-center justify-between gap-4'>
            <div>
              <div className='text-sm font-medium'>Sync nicknames</div>
              <div className='text-sm text-muted-foreground'>Mirror Discord names</div>
            </div>
            <Switch
              checked={discord.syncNicknames}
              onCheckedChange={(checked) => setDiscord({ ...discord, syncNicknames: checked })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
