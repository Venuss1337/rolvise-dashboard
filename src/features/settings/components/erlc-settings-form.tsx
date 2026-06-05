'use client';

import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useSettingsFormState } from './settings-state-context';

export function ErlcSettingsForm() {
  const [erlc, setErlc] = useSettingsFormState({
    serverCode: 'LIBERTY',
    joinKey: 'LC-2026',
    maxPlayers: '38',
    strictPatrolMode: false
  });

  return (
    <div className='max-w-3xl space-y-4'>
      <div className='rounded-lg border p-4'>
        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='grid gap-2'>
            <label className='text-sm font-medium' htmlFor='server-code'>
              Server code
            </label>
            <Input
              id='server-code'
              value={erlc.serverCode}
              onChange={(event) => setErlc({ ...erlc, serverCode: event.target.value })}
            />
          </div>

          <div className='grid gap-2'>
            <label className='text-sm font-medium' htmlFor='join-key'>
              Join key
            </label>
            <Input
              id='join-key'
              value={erlc.joinKey}
              onChange={(event) => setErlc({ ...erlc, joinKey: event.target.value })}
            />
          </div>
        </div>
      </div>

      <div className='rounded-lg border p-4'>
        <div className='grid gap-4'>
          <div className='grid gap-2'>
            <label className='text-sm font-medium' htmlFor='max-players'>
              Max players
            </label>
            <Input
              id='max-players'
              type='number'
              value={erlc.maxPlayers}
              onChange={(event) => setErlc({ ...erlc, maxPlayers: event.target.value })}
            />
          </div>

          <div className='flex items-center justify-between gap-4'>
            <div>
              <div className='text-sm font-medium'>Strict patrol mode</div>
              <div className='text-sm text-muted-foreground'>Require active session</div>
            </div>
            <Switch
              checked={erlc.strictPatrolMode}
              onCheckedChange={(checked) => setErlc({ ...erlc, strictPatrolMode: checked })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
