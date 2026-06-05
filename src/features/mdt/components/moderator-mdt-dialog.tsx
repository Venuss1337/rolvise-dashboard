'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

type MdtPlayer = {
  id: string;
  name: string;
  robloxUsername: string;
  status: 'Civilian' | 'LEO' | 'Fire/EMS';
  joinTime: string;
  recentLogs: string[];
};

type ShiftStatus = 'off' | 'active' | 'break';

type RecentShift = {
  id: string;
  date: string;
  durationSeconds: number;
  breakSeconds: number;
  status: 'Completed' | 'Reviewed';
};

const weeklyMinimumHours = 8;
const completedWeeklySeconds = 5.2 * 60 * 60;

const recentShifts: RecentShift[] = [
  {
    id: 'shift-001',
    date: 'Today, 15:10',
    durationSeconds: 76 * 60,
    breakSeconds: 8 * 60,
    status: 'Reviewed'
  },
  {
    id: 'shift-002',
    date: 'Yesterday, 19:35',
    durationSeconds: 132 * 60,
    breakSeconds: 15 * 60,
    status: 'Completed'
  },
  {
    id: 'shift-003',
    date: 'Mon, 18:00',
    durationSeconds: 108 * 60,
    breakSeconds: 12 * 60,
    status: 'Reviewed'
  }
];

const onlinePlayers: MdtPlayer[] = [
  {
    id: 'p-001',
    name: 'Avery Stone',
    robloxUsername: 'AveryERLC',
    status: 'LEO',
    joinTime: '18:24',
    recentLogs: ['Warning issued for scene interference', 'Kick log reviewed by Command']
  },
  {
    id: 'p-002',
    name: 'Mira Vale',
    robloxUsername: 'MiraPatrol',
    status: 'Civilian',
    joinTime: '18:37',
    recentLogs: ['No active infractions', 'Profile checked during traffic stop']
  },
  {
    id: 'p-003',
    name: 'Cole Rivers',
    robloxUsername: 'Cole_Rivers',
    status: 'Fire/EMS',
    joinTime: '18:41',
    recentLogs: ['Ban appeal denied last week', 'Warning for radio misuse']
  },
  {
    id: 'p-004',
    name: 'Tessa Ray',
    robloxUsername: 'RayUnit22',
    status: 'Civilian',
    joinTime: '19:02',
    recentLogs: ['Kick log: FRP during pursuit', 'Infraction points: 2']
  }
];

const quickActions = [
  {
    label: 'Issue Infraction',
    icon: Icons.warning
  },
  {
    label: 'Issue Ban Log',
    icon: Icons.lock
  },
  {
    label: 'Issue Kick Log',
    icon: Icons.userPen
  },
  {
    label: 'Issue Warning',
    icon: Icons.alertCircle
  }
];

export function ModeratorMdtDialog({
  open,
  onOpenChange
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [shiftStartedAt, setShiftStartedAt] = useState<Date | null>(null);
  const [breakStartedAt, setBreakStartedAt] = useState<Date | null>(null);
  const [totalBreakSeconds, setTotalBreakSeconds] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [selectedPlayer, setSelectedPlayer] = useState<MdtPlayer | null>(onlinePlayers[0]);
  const [search, setSearch] = useState('');
  const shiftStatus: ShiftStatus = shiftStartedAt ? (breakStartedAt ? 'break' : 'active') : 'off';
  const isOnShift = shiftStatus !== 'off';
  const isOnBreak = shiftStatus === 'break';

  const filteredPlayers = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    if (!normalizedSearch) return onlinePlayers;

    return onlinePlayers.filter(
      (player) =>
        player.name.toLowerCase().includes(normalizedSearch) ||
        player.robloxUsername.toLowerCase().includes(normalizedSearch)
    );
  }, [search]);

  useEffect(() => {
    if (!isOnShift) return;

    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, [isOnShift]);

  function handleStartShift() {
    setNow(new Date());
    setShiftStartedAt(new Date());
    setBreakStartedAt(null);
    setTotalBreakSeconds(0);
  }

  function handleEndShift() {
    if (breakStartedAt) {
      setTotalBreakSeconds((seconds) => seconds + getElapsedSeconds(breakStartedAt, new Date()));
    }

    setShiftStartedAt(null);
    setBreakStartedAt(null);
    setTotalBreakSeconds(0);
    setNow(new Date());
  }

  function handleStartBreak() {
    if (!shiftStartedAt || breakStartedAt) return;
    setBreakStartedAt(new Date());
    setNow(new Date());
  }

  function handleEndBreak() {
    if (!breakStartedAt) return;

    const endedAt = new Date();
    setTotalBreakSeconds((seconds) => seconds + getElapsedSeconds(breakStartedAt, endedAt));
    setBreakStartedAt(null);
    setNow(endedAt);
  }

  const currentShiftSeconds = shiftStartedAt ? getElapsedSeconds(shiftStartedAt, now) : 0;
  const currentBreakSeconds =
    totalBreakSeconds + (breakStartedAt ? getElapsedSeconds(breakStartedAt, now) : 0);
  const activeShiftSeconds = Math.max(0, currentShiftSeconds - currentBreakSeconds);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='grid h-[92vh] w-[calc(100vw-2rem)] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden border-border bg-zinc-950 p-0 text-zinc-100 sm:max-w-[min(1500px,calc(100vw-2rem))]'>
        <DialogHeader className='border-b border-zinc-800 bg-zinc-950 px-5 py-4'>
          <div className='flex flex-col gap-3 pr-8 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <DialogTitle className='text-zinc-100'>Moderator MDT</DialogTitle>
              <div className='mt-1 text-sm text-zinc-400'>River City Roleplay</div>
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              <Badge
                variant='outline'
                className={cn(
                  'border-zinc-700 bg-zinc-900 text-zinc-300',
                  shiftStatus === 'active' &&
                    'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
                  shiftStatus === 'break' && 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                )}
              >
                <span
                  className={cn(
                    'mr-1.5 size-2 rounded-full bg-zinc-500',
                    shiftStatus === 'active' && 'bg-emerald-400',
                    shiftStatus === 'break' && 'bg-amber-400'
                  )}
                />
                {shiftStatus === 'break' ? 'On Break' : isOnShift ? 'On Shift' : 'Off Shift'}
              </Badge>
              <Button
                variant={isOnShift ? 'destructive' : 'default'}
                onClick={isOnShift ? handleEndShift : handleStartShift}
              >
                {isOnShift ? 'End Shift' : 'Start Shift'}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs
          defaultValue='dispatch'
          className='grid min-h-0 grid-cols-[190px_minmax(0,1fr)] gap-0'
        >
          <aside className='border-r border-zinc-800 bg-zinc-950/95 p-3'>
            <TabsList className='grid h-auto w-full gap-1 bg-transparent p-0'>
              <MdtTab value='dispatch' label='Dispatch' icon={Icons.dashboard} />
              <MdtTab value='shift' label='Current Shift' icon={Icons.clock} />
              <MdtTab value='players' label='Online Players' icon={Icons.teams} />
              <MdtTab value='logs' label='Recent Logs' icon={Icons.forms} />
            </TabsList>
          </aside>

          <div className='min-h-0 overflow-auto bg-zinc-900/70 p-4'>
            <TabsContent value='dispatch' className='m-0 space-y-4'>
              <div className='grid gap-3 lg:grid-cols-4'>
                {quickActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <Button
                      key={action.label}
                      variant='outline'
                      className='h-20 justify-start border-zinc-800 bg-zinc-950 text-zinc-100 hover:bg-zinc-900 hover:text-zinc-100'
                    >
                      <Icon className='size-5' />
                      {action.label}
                    </Button>
                  );
                })}
              </div>

              <div className='grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_380px]'>
                <MdtPlayersTable
                  players={filteredPlayers}
                  search={search}
                  selectedPlayer={selectedPlayer}
                  onSearchChange={setSearch}
                  onSelectPlayer={setSelectedPlayer}
                />
                <PlayerOverview player={selectedPlayer} />
              </div>
            </TabsContent>

            <TabsContent value='shift' className='m-0'>
              <ShiftPanel
                activeShiftSeconds={activeShiftSeconds}
                breakSeconds={currentBreakSeconds}
                isOnBreak={isOnBreak}
                isOnShift={isOnShift}
                onEndBreak={handleEndBreak}
                onEndShift={handleEndShift}
                onStartBreak={handleStartBreak}
                onStartShift={handleStartShift}
                shiftStartedAt={shiftStartedAt}
              />
            </TabsContent>

            <TabsContent value='players' className='m-0'>
              <MdtPlayersTable
                players={filteredPlayers}
                search={search}
                selectedPlayer={selectedPlayer}
                onSearchChange={setSearch}
                onSelectPlayer={setSelectedPlayer}
              />
            </TabsContent>

            <TabsContent value='logs' className='m-0 grid gap-3'>
              {[
                'Avery Stone issued Warning to RayUnit22',
                'Command reviewed kick log for Cole_Rivers',
                'MiraPatrol profile checked by ER:LC Manager',
                'Ban log created for failed scene compliance'
              ].map((log) => (
                <div key={log} className='rounded-lg border border-zinc-800 bg-zinc-950 p-4'>
                  <div className='text-sm font-medium text-zinc-100'>{log}</div>
                  <div className='mt-1 text-xs text-zinc-500'>2 minutes ago</div>
                </div>
              ))}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function ShiftPanel({
  activeShiftSeconds,
  breakSeconds,
  isOnBreak,
  isOnShift,
  onEndBreak,
  onEndShift,
  onStartBreak,
  onStartShift,
  shiftStartedAt
}: {
  activeShiftSeconds: number;
  breakSeconds: number;
  isOnBreak: boolean;
  isOnShift: boolean;
  onEndBreak: () => void;
  onEndShift: () => void;
  onStartBreak: () => void;
  onStartShift: () => void;
  shiftStartedAt: Date | null;
}) {
  const weeklyTotalSeconds = completedWeeklySeconds + activeShiftSeconds;
  const weeklyMinimumSeconds = weeklyMinimumHours * 60 * 60;
  const weeklyProgress = Math.min(100, (weeklyTotalSeconds / weeklyMinimumSeconds) * 100);
  const remainingSeconds = Math.max(0, weeklyMinimumSeconds - weeklyTotalSeconds);

  return (
    <div className='grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]'>
      <section className='space-y-4 rounded-lg border border-zinc-800 bg-zinc-950 p-4'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
          <div>
            <h3 className='font-semibold text-zinc-100'>Current Shift</h3>
            <div className='mt-1 text-sm text-zinc-500'>
              {shiftStartedAt
                ? `Started ${shiftStartedAt.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}`
                : 'Start a shift when you begin moderation duty.'}
            </div>
          </div>
          <Badge
            variant='outline'
            className={cn(
              'w-fit border-zinc-700 bg-zinc-900 text-zinc-300',
              isOnShift && !isOnBreak && 'border-emerald-500/40 text-emerald-300',
              isOnBreak && 'border-amber-500/40 text-amber-300'
            )}
          >
            {isOnBreak ? 'Break Active' : isOnShift ? 'Tracking' : 'Not Tracking'}
          </Badge>
        </div>

        <div className='grid gap-3 md:grid-cols-3'>
          <MdtStat label='Shift Time' value={formatDuration(activeShiftSeconds)} />
          <MdtStat label='Break Time' value={formatDuration(breakSeconds)} />
          <MdtStat
            label='Session State'
            value={isOnBreak ? 'On Break' : isOnShift ? 'Active' : 'Off Duty'}
          />
        </div>

        <div className='flex flex-wrap gap-2'>
          <Button
            variant={isOnShift ? 'destructive' : 'default'}
            onClick={isOnShift ? onEndShift : onStartShift}
          >
            <Icons.clock className='size-4' />
            {isOnShift ? 'End Shift' : 'Start Shift'}
          </Button>
          <Button
            variant='outline'
            className='border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100'
            disabled={!isOnShift}
            onClick={isOnBreak ? onEndBreak : onStartBreak}
          >
            <Icons.slash className='size-4' />
            {isOnBreak ? 'End Break' : 'Go On Break'}
          </Button>
        </div>
      </section>

      <section className='space-y-4 rounded-lg border border-zinc-800 bg-zinc-950 p-4'>
        <div>
          <h3 className='font-semibold text-zinc-100'>Weekly Minimum</h3>
          <div className='mt-1 text-sm text-zinc-500'>
            {formatHours(weeklyTotalSeconds)} logged of {weeklyMinimumHours}h required
          </div>
        </div>
        <Progress value={weeklyProgress} className='h-2 bg-zinc-800' />
        <div className='flex items-center justify-between text-sm'>
          <span className='text-zinc-400'>{Math.round(weeklyProgress)}% complete</span>
          <span className='font-medium text-zinc-100'>
            {remainingSeconds > 0 ? `${formatHours(remainingSeconds)} remaining` : 'Minimum met'}
          </span>
        </div>
      </section>

      <section className='rounded-lg border border-zinc-800 bg-zinc-950 p-4 xl:col-span-2'>
        <div className='mb-3 flex items-center justify-between gap-3'>
          <div>
            <h3 className='font-semibold text-zinc-100'>Recent Shifts</h3>
            <div className='text-sm text-zinc-500'>Your latest duty sessions this week</div>
          </div>
        </div>
        <div className='overflow-hidden rounded-md border border-zinc-800'>
          <Table className='min-w-[760px]'>
            <TableHeader>
              <TableRow className='border-zinc-800 bg-zinc-900 hover:bg-zinc-900'>
                <TableHead className='text-zinc-400'>Date</TableHead>
                <TableHead className='text-zinc-400'>Shift Time</TableHead>
                <TableHead className='text-zinc-400'>Breaks</TableHead>
                <TableHead className='text-right text-zinc-400'>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentShifts.map((shift) => (
                <TableRow key={shift.id} className='border-zinc-800 hover:bg-zinc-900'>
                  <TableCell className='font-medium text-zinc-100'>{shift.date}</TableCell>
                  <TableCell className='text-zinc-300'>
                    {formatDuration(shift.durationSeconds)}
                  </TableCell>
                  <TableCell className='text-zinc-300'>
                    {formatDuration(shift.breakSeconds)}
                  </TableCell>
                  <TableCell className='text-right'>
                    <Badge variant='outline' className='border-zinc-700 text-zinc-300'>
                      {shift.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}

function MdtTab({
  icon: Icon,
  label,
  value
}: {
  icon: typeof Icons.dashboard;
  label: string;
  value: string;
}) {
  return (
    <TabsTrigger
      value={value}
      className='justify-start border-0 bg-transparent px-3 text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100'
    >
      <Icon className='size-4' />
      {label}
    </TabsTrigger>
  );
}

function MdtPlayersTable({
  onSearchChange,
  onSelectPlayer,
  players,
  search,
  selectedPlayer
}: {
  onSearchChange: (value: string) => void;
  onSelectPlayer: (player: MdtPlayer) => void;
  players: MdtPlayer[];
  search: string;
  selectedPlayer: MdtPlayer | null;
}) {
  return (
    <section className='space-y-3 rounded-lg border border-zinc-800 bg-zinc-950 p-4'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h3 className='font-semibold text-zinc-100'>Online Players</h3>
          <div className='text-sm text-zinc-500'>{players.length} visible</div>
        </div>
        <div className='relative w-full sm:max-w-xs'>
          <Icons.search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500' />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder='Search player...'
            className='border-zinc-800 bg-zinc-900 pl-9 text-zinc-100 placeholder:text-zinc-500'
          />
        </div>
      </div>

      <div className='overflow-hidden rounded-md border border-zinc-800'>
        <Table className='min-w-[760px]'>
          <TableHeader>
            <TableRow className='border-zinc-800 bg-zinc-900 hover:bg-zinc-900'>
              <TableHead className='text-zinc-400'>Player</TableHead>
              <TableHead className='text-zinc-400'>Status</TableHead>
              <TableHead className='text-zinc-400'>Joined</TableHead>
              <TableHead className='text-right text-zinc-400'>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player) => (
              <TableRow
                key={player.id}
                className={cn(
                  'border-zinc-800 hover:bg-zinc-900',
                  selectedPlayer?.id === player.id && 'bg-zinc-900'
                )}
              >
                <TableCell>
                  <div className='font-medium text-zinc-100'>{player.name}</div>
                  <div className='text-xs text-zinc-500'>{player.robloxUsername}</div>
                </TableCell>
                <TableCell>
                  <Badge variant='outline' className='border-zinc-700 text-zinc-300'>
                    {player.status}
                  </Badge>
                </TableCell>
                <TableCell className='text-zinc-300'>{player.joinTime}</TableCell>
                <TableCell className='text-right'>
                  <Button
                    size='sm'
                    variant='outline'
                    className='border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100'
                    onClick={() => onSelectPlayer(player)}
                  >
                    Check Profile
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

function PlayerOverview({ player }: { player: MdtPlayer | null }) {
  if (!player) {
    return (
      <section className='rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-500'>
        Select a player.
      </section>
    );
  }

  return (
    <section className='space-y-4 rounded-lg border border-zinc-800 bg-zinc-950 p-4'>
      <div>
        <h3 className='font-semibold text-zinc-100'>{player.name}</h3>
        <div className='text-sm text-zinc-500'>{player.robloxUsername}</div>
      </div>
      <div className='grid grid-cols-2 gap-2'>
        <MdtStat label='Status' value={player.status} />
        <MdtStat label='Joined' value={player.joinTime} />
      </div>
      <div>
        <div className='mb-2 text-sm font-medium text-zinc-300'>Recent Logs</div>
        <div className='space-y-2'>
          {player.recentLogs.map((log) => (
            <div
              key={log}
              className='rounded-md border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-300'
            >
              {log}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MdtStat({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-md border border-zinc-800 bg-zinc-900 p-3'>
      <div className='text-xs uppercase text-zinc-500'>{label}</div>
      <div className='mt-1 text-sm font-medium text-zinc-100'>{value}</div>
    </div>
  );
}

function getElapsedSeconds(start: Date, end: Date) {
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function formatHours(seconds: number) {
  const hours = seconds / 3600;
  return `${hours.toFixed(hours >= 10 ? 0 : 1)}h`;
}
