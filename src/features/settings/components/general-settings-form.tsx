'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useSettingsFormState } from './settings-state-context';

export function GeneralSettingsForm() {
  const [general, setGeneral] = useSettingsFormState({
    name: 'Liberty County Roleplay',
    inviteCode: 'LC-RP',
    timezone: 'est',
    description: 'Structured patrols, staff reviews, and community operations.'
  });

  return (
    <div className='max-w-3xl space-y-4'>
      <div className='rounded-lg border p-4'>
        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='grid gap-2'>
            <label className='text-sm font-medium' htmlFor='community-name'>
              Community name
            </label>
            <Input
              id='community-name'
              value={general.name}
              onChange={(event) => setGeneral({ ...general, name: event.target.value })}
            />
          </div>

          <div className='grid gap-2'>
            <label className='text-sm font-medium' htmlFor='invite-code'>
              Invite code
            </label>
            <Input
              id='invite-code'
              value={general.inviteCode}
              onChange={(event) => setGeneral({ ...general, inviteCode: event.target.value })}
            />
          </div>
        </div>
      </div>

      <div className='rounded-lg border p-4'>
        <div className='grid gap-4'>
          <div className='grid gap-2'>
            <label className='text-sm font-medium'>Timezone</label>
            <Select
              value={general.timezone}
              onValueChange={(value) => setGeneral({ ...general, timezone: value })}
            >
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='est'>Eastern</SelectItem>
                <SelectItem value='cst'>Central</SelectItem>
                <SelectItem value='mst'>Mountain</SelectItem>
                <SelectItem value='pst'>Pacific</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='grid gap-2'>
            <label className='text-sm font-medium' htmlFor='community-description'>
              Description
            </label>
            <Textarea
              id='community-description'
              value={general.description}
              onChange={(event) => setGeneral({ ...general, description: event.target.value })}
              className='min-h-28'
            />
          </div>
        </div>
      </div>
    </div>
  );
}
