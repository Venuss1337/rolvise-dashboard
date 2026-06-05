'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useSettingsFormState } from './settings-state-context';

export function SessionsSettingsForm() {
  const [sessions, setSessions] = useSettingsFormState({
    autoArchive: true,
    minPlayers: '8',
    defaultDuration: '90',
    pollMode: 'staff'
  });

  return (
    <div className='max-w-2xl space-y-5'>
      <div className='flex items-center justify-between gap-4 rounded-lg border p-4'>
        <div>
          <div className='text-sm font-medium'>Auto archive</div>
          <div className='text-sm text-muted-foreground'>After a session ends</div>
        </div>
        <Switch
          checked={sessions.autoArchive}
          onCheckedChange={(checked) => setSessions({ ...sessions, autoArchive: checked })}
        />
      </div>

      <div className='grid gap-2'>
        <label className='text-sm font-medium' htmlFor='min-players'>
          Minimum players
        </label>
        <Input
          id='min-players'
          type='number'
          value={sessions.minPlayers}
          onChange={(event) => setSessions({ ...sessions, minPlayers: event.target.value })}
        />
      </div>

      <div className='grid gap-2'>
        <label className='text-sm font-medium' htmlFor='default-duration'>
          Default duration
        </label>
        <Input
          id='default-duration'
          type='number'
          value={sessions.defaultDuration}
          onChange={(event) => setSessions({ ...sessions, defaultDuration: event.target.value })}
        />
      </div>

      <div className='grid gap-2'>
        <label className='text-sm font-medium'>Poll visibility</label>
        <Select
          value={sessions.pollMode}
          onValueChange={(value) => setSessions({ ...sessions, pollMode: value })}
        >
          <SelectTrigger className='w-full'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='staff'>Staff only</SelectItem>
            <SelectItem value='members'>Members</SelectItem>
            <SelectItem value='public'>Public</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
