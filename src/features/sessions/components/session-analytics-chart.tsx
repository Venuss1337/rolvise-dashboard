'use client';

import { useMemo, useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/components/icons';
import { useCommunity } from '@/features/community/hooks/use-community';
import { playersOverTimeQueryOptions } from '../api/queries';
import type { SessionRange } from '../api/types';

const chartConfig = {
  players: {
    label: 'Players',
    color: 'var(--chart-1)'
  }
} satisfies ChartConfig;

const ranges: { value: SessionRange; label: string }[] = [
  { value: '24h', label: '24 hours' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' }
];

export function SessionAnalyticsChart() {
  const [range, setRange] = useState<SessionRange>('24h');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const { communityId } = useCommunity();
  const filters = useMemo(
    () => ({
      communityId: communityId ?? '',
      range
    }),
    [communityId, range]
  );
  const { data } = useSuspenseQuery(playersOverTimeQueryOptions(filters));

  return (
    <div className='grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]'>
      <Card className='rounded-lg'>
        <CardHeader className='gap-3 sm:grid-cols-[1fr_auto]'>
          <div>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>Players over time</CardDescription>
          </div>
          <CardAction className='self-center'>
            <Tabs value={range} onValueChange={(value) => setRange(value as SessionRange)}>
              <TabsList className='w-full sm:w-fit'>
                {ranges.map((item) => (
                  <TabsTrigger key={item.value} value={item.value}>
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardAction>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className='h-[360px] w-full'>
            <LineChart accessibilityLayer data={data} margin={{ left: 8, right: 16, top: 12 }}>
              <CartesianGrid vertical={false} strokeDasharray='3 3' />
              <XAxis
                dataKey='label'
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={18}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                width={36}
                allowDecimals={false}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator='line' />} />
              <Line
                dataKey='players'
                type='monotone'
                stroke='var(--color-players)'
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className='flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-xs'>
        <Button
          onClick={() => setIsSessionActive((active) => !active)}
          variant={isSessionActive ? 'destructive' : 'default'}
          className='w-full'
        >
          {isSessionActive ? <Icons.close /> : <Icons.clock />}
          {isSessionActive ? 'End Session' : 'Start Session'}
        </Button>
        <Button variant='outline' className='w-full'>
          <Icons.forms />
          Create Poll
        </Button>
      </div>
    </div>
  );
}
