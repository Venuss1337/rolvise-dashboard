'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { Icons } from '@/components/icons';

const activityData = [
  { day: 'Mon', players: 118, sessions: 3, incidents: 4 },
  { day: 'Tue', players: 134, sessions: 4, incidents: 5 },
  { day: 'Wed', players: 126, sessions: 3, incidents: 3 },
  { day: 'Thu', players: 151, sessions: 5, incidents: 6 },
  { day: 'Fri', players: 178, sessions: 6, incidents: 8 },
  { day: 'Sat', players: 214, sessions: 8, incidents: 9 },
  { day: 'Sun', players: 196, sessions: 7, incidents: 7 }
];

const staffActionData = [
  { name: 'Warnings', value: 42 },
  { name: 'Kicks', value: 18 },
  { name: 'Bans', value: 7 },
  { name: 'Appeals', value: 11 }
];

const roleActivityData = [
  { role: 'Owner', reviews: 16, actions: 22 },
  { role: 'Command', reviews: 34, actions: 48 },
  { role: 'Moderator', reviews: 52, actions: 61 },
  { role: 'Staff', reviews: 29, actions: 37 }
];

const responseData = [
  { hour: '12 AM', minutes: 9 },
  { hour: '4 AM', minutes: 14 },
  { hour: '8 AM', minutes: 7 },
  { hour: '12 PM', minutes: 5 },
  { hour: '4 PM', minutes: 6 },
  { hour: '8 PM', minutes: 8 }
];

const activityConfig = {
  players: {
    label: 'Players',
    color: 'var(--chart-1)'
  },
  sessions: {
    label: 'Sessions',
    color: 'var(--chart-2)'
  },
  incidents: {
    label: 'Incidents',
    color: 'var(--chart-3)'
  }
} satisfies ChartConfig;

const staffActionConfig = {
  value: {
    label: 'Records'
  },
  Warnings: {
    label: 'Warnings',
    color: 'var(--chart-1)'
  },
  Kicks: {
    label: 'Kicks',
    color: 'var(--chart-2)'
  },
  Bans: {
    label: 'Bans',
    color: 'var(--chart-3)'
  },
  Appeals: {
    label: 'Appeals',
    color: 'var(--chart-4)'
  }
} satisfies ChartConfig;

const roleConfig = {
  reviews: {
    label: 'Reviews',
    color: 'var(--chart-1)'
  },
  actions: {
    label: 'Actions',
    color: 'var(--chart-2)'
  }
} satisfies ChartConfig;

const responseConfig = {
  minutes: {
    label: 'Minutes',
    color: 'var(--chart-5)'
  }
} satisfies ChartConfig;

const summaryCards = [
  {
    label: 'Peak Players',
    value: '214',
    detail: '+18% this week',
    icon: Icons.trendingUp
  },
  {
    label: 'Sessions Hosted',
    value: '36',
    detail: '8 weekend sessions',
    icon: Icons.clock
  },
  {
    label: 'Moderation Actions',
    value: '78',
    detail: '11 appeals opened',
    icon: Icons.warning
  },
  {
    label: 'Avg Response',
    value: '7m',
    detail: 'Queue review time',
    icon: Icons.adjustments
  }
];

export function AnalyticsView() {
  return (
    <div className='space-y-4'>
      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        {summaryCards.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.label} className='rounded-lg'>
              <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-2'>
                <div>
                  <CardDescription>{item.label}</CardDescription>
                  <CardTitle className='mt-1 text-2xl'>{item.value}</CardTitle>
                </div>
                <div className='rounded-md border bg-muted/40 p-2'>
                  <Icon className='size-4' />
                </div>
              </CardHeader>
              <CardContent>
                <div className='text-sm text-muted-foreground'>{item.detail}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className='grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]'>
        <Card className='rounded-lg'>
          <CardHeader>
            <CardTitle>Community Activity</CardTitle>
            <CardDescription>Players, sessions, and incidents by day</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={activityConfig} className='h-[360px] w-full'>
              <AreaChart data={activityData} margin={{ left: 8, right: 16, top: 12 }}>
                <CartesianGrid vertical={false} strokeDasharray='3 3' />
                <XAxis dataKey='day' tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} width={36} />
                <ChartTooltip content={<ChartTooltipContent indicator='line' />} />
                <Area
                  dataKey='players'
                  type='monotone'
                  fill='var(--color-players)'
                  fillOpacity={0.18}
                  stroke='var(--color-players)'
                  strokeWidth={2}
                />
                <Line
                  dataKey='sessions'
                  type='monotone'
                  stroke='var(--color-sessions)'
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey='incidents'
                  type='monotone'
                  stroke='var(--color-incidents)'
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className='rounded-lg'>
          <CardHeader>
            <CardTitle>Moderation Mix</CardTitle>
            <CardDescription>Record types this week</CardDescription>
          </CardHeader>
          <CardContent className='flex items-center justify-center'>
            <ChartContainer config={staffActionConfig} className='h-[320px] w-full max-w-[360px]'>
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey='name' hideLabel />} />
                <Pie
                  data={staffActionData}
                  dataKey='value'
                  nameKey='name'
                  innerRadius={64}
                  outerRadius={110}
                  paddingAngle={4}
                >
                  {staffActionData.map((item) => (
                    <Cell key={item.name} fill={`var(--color-${item.name})`} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 xl:grid-cols-2'>
        <Card className='rounded-lg'>
          <CardHeader>
            <CardTitle>Staff Output</CardTitle>
            <CardDescription>Reviews and actions by role</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={roleConfig} className='h-[320px] w-full'>
              <BarChart data={roleActivityData}>
                <CartesianGrid vertical={false} strokeDasharray='3 3' />
                <XAxis dataKey='role' tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} width={36} />
                <ChartTooltip content={<ChartTooltipContent indicator='dashed' />} />
                <Bar dataKey='reviews' fill='var(--color-reviews)' radius={4} />
                <Bar dataKey='actions' fill='var(--color-actions)' radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className='rounded-lg'>
          <CardHeader>
            <CardTitle>
              Response Health
              <Badge variant='outline'>
                <Icons.trendingDown className='size-3' />
                Faster
              </Badge>
            </CardTitle>
            <CardDescription>Average review response time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={responseConfig} className='h-[320px] w-full'>
              <LineChart data={responseData} margin={{ left: 8, right: 16, top: 12 }}>
                <CartesianGrid vertical={false} strokeDasharray='3 3' />
                <XAxis dataKey='hour' tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} width={36} />
                <ChartTooltip content={<ChartTooltipContent indicator='line' />} />
                <Line
                  dataKey='minutes'
                  type='monotone'
                  stroke='var(--color-minutes)'
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
