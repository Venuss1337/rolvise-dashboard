'use client';

import { useMemo, useState } from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { useCommunity } from '@/features/community/hooks/use-community';
import { auditLogsQueryOptions } from '../api/queries';
import type { AuditLog, AuditLogSeverity, AuditLogType } from '../api/types';

type RecencyFilter = 'all' | 'recent' | '30d' | 'old';

const typeLabels: Record<AuditLogType, string> = {
  member: 'Member',
  role: 'Role',
  session: 'Session',
  resource: 'Resource',
  infraction: 'Infraction',
  appeal: 'Appeal',
  settings: 'Settings',
  auth: 'Auth'
};

const severityStyles: Record<AuditLogSeverity, string> = {
  info: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300',
  critical: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300'
};

const now = new Date('2026-06-01T12:00:00.000Z').getTime();

export function AuditLogsView() {
  const { communityId } = useCommunity();
  const { data: logs } = useSuspenseQuery(auditLogsQueryOptions(communityId ?? ''));
  const [search, setSearch] = useState('');
  const [type, setType] = useState<AuditLogType | 'all'>('all');
  const [recency, setRecency] = useState<RecencyFilter>('all');
  const [exactDate, setExactDate] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const filteredLogs = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    return logs.filter((log) => {
      const createdAt = new Date(log.createdAt).getTime();
      const matchesSearch =
        !normalizedSearch ||
        log.action.toLowerCase().includes(normalizedSearch) ||
        log.actor.toLowerCase().includes(normalizedSearch) ||
        log.target.toLowerCase().includes(normalizedSearch) ||
        log.summary.toLowerCase().includes(normalizedSearch) ||
        log.ipAddress.toLowerCase().includes(normalizedSearch);
      const matchesType = type === 'all' || log.type === type;
      const matchesRecency = getRecencyMatch(createdAt, recency);
      const matchesExactDate = !exactDate || log.createdAt.slice(0, 10) === exactDate;
      const matchesFrom = !fromDate || createdAt >= startOfDay(fromDate);
      const matchesTo = !toDate || createdAt <= endOfDay(toDate);

      return (
        matchesSearch &&
        matchesType &&
        matchesRecency &&
        matchesExactDate &&
        matchesFrom &&
        matchesTo
      );
    });
  }, [logs, search, type, recency, exactDate, fromDate, toDate]);

  function clearFilters() {
    setSearch('');
    setType('all');
    setRecency('all');
    setExactDate('');
    setFromDate('');
    setToDate('');
  }

  return (
    <div className='space-y-4'>
      <div className='rounded-lg border bg-card p-4 shadow-xs'>
        <div className='grid gap-3 xl:grid-cols-[minmax(260px,1fr)_160px_170px_150px_150px_150px_auto]'>
          <div className='relative'>
            <Icons.search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder='Search audit logs...'
              className='pl-9'
            />
          </div>

          <Select value={type} onValueChange={(value) => setType(value as AuditLogType | 'all')}>
            <SelectTrigger className='w-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All types</SelectItem>
              {Object.entries(typeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={recency} onValueChange={(value) => setRecency(value as RecencyFilter)}>
            <SelectTrigger className='w-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All time</SelectItem>
              <SelectItem value='recent'>Recent</SelectItem>
              <SelectItem value='30d'>Last 30 days</SelectItem>
              <SelectItem value='old'>Long time ago</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type='date'
            value={exactDate}
            onChange={(event) => setExactDate(event.target.value)}
            aria-label='Exact date'
          />
          <Input
            type='date'
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            aria-label='From date'
          />
          <Input
            type='date'
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            aria-label='To date'
          />

          <Button variant='outline' onClick={clearFilters}>
            Clear
          </Button>
        </div>

        <div className='mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
          <div className='text-sm text-muted-foreground'>
            {filteredLogs.length} {filteredLogs.length === 1 ? 'event' : 'events'}
          </div>
          <div className='flex flex-wrap gap-2'>
            <Button variant='outline' onClick={() => exportCsv(filteredLogs)}>
              <Icons.fileTypeXls />
              Export CSV
            </Button>
            <Button variant='outline' onClick={() => exportPdf(filteredLogs)}>
              <Icons.fileTypePdf />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      <div className='overflow-hidden rounded-lg border'>
        <div className='max-h-[calc(100vh-22rem)] min-h-[460px] w-full overflow-auto'>
          <Table className='min-w-[1180px]'>
            <TableHeader className='sticky top-0 z-10 bg-background'>
              <TableRow className='bg-muted/40 hover:bg-muted/40'>
                <TableHead className='w-[170px]'>Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Event ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className='font-mono text-xs'>
                    {formatTimestamp(log.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline'>{typeLabels[log.type]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant='outline'
                      className={cn('capitalize', severityStyles[log.severity])}
                    >
                      {log.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className='font-medium'>{log.action}</TableCell>
                  <TableCell>{log.actor}</TableCell>
                  <TableCell>{log.target}</TableCell>
                  <TableCell className='max-w-[360px] whitespace-normal text-muted-foreground'>
                    {log.summary}
                  </TableCell>
                  <TableCell className='font-mono text-xs'>{log.ipAddress}</TableCell>
                  <TableCell className='font-mono text-xs text-muted-foreground'>
                    {log.id}
                  </TableCell>
                </TableRow>
              ))}

              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className='h-40 text-center text-muted-foreground'>
                    No audit logs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function getRecencyMatch(createdAt: number, recency: RecencyFilter) {
  const age = now - createdAt;
  const day = 24 * 60 * 60 * 1000;

  if (recency === 'recent') {
    return age <= 7 * day;
  }

  if (recency === '30d') {
    return age <= 30 * day;
  }

  if (recency === 'old') {
    return age > 30 * day;
  }

  return true;
}

function startOfDay(date: string) {
  return new Date(`${date}T00:00:00.000Z`).getTime();
}

function endOfDay(date: string) {
  return new Date(`${date}T23:59:59.999Z`).getTime();
}

function formatTimestamp(date: string) {
  return date.replace('T', ' ').slice(0, 16);
}

function exportCsv(logs: AuditLog[]) {
  const headers = ['Time', 'Type', 'Severity', 'Action', 'Actor', 'Target', 'Summary', 'IP', 'ID'];
  const rows = logs.map((log) => [
    formatTimestamp(log.createdAt),
    typeLabels[log.type],
    log.severity,
    log.action,
    log.actor,
    log.target,
    log.summary,
    log.ipAddress,
    log.id
  ]);
  const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'audit-logs.csv';
  link.click();
  URL.revokeObjectURL(url);
}

function csvEscape(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function exportPdf(logs: AuditLog[]) {
  const rows = logs
    .map(
      (log) => `<tr>
        <td>${formatTimestamp(log.createdAt)}</td>
        <td>${typeLabels[log.type]}</td>
        <td>${log.severity}</td>
        <td>${escapeHtml(log.action)}</td>
        <td>${escapeHtml(log.actor)}</td>
        <td>${escapeHtml(log.target)}</td>
        <td>${escapeHtml(log.summary)}</td>
        <td>${log.ipAddress}</td>
      </tr>`
    )
    .join('');
  const printWindow = window.open('', '_blank', 'noopener,noreferrer');

  if (!printWindow) {
    return;
  }

  printWindow.document.write(`<!doctype html>
    <html>
      <head>
        <title>Audit Logs</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
          h1 { font-size: 20px; margin: 0 0 16px; }
          table { border-collapse: collapse; width: 100%; font-size: 11px; }
          th, td { border: 1px solid #ddd; padding: 6px; text-align: left; vertical-align: top; }
          th { background: #f3f4f6; }
        </style>
      </head>
      <body>
        <h1>Audit Logs</h1>
        <table>
          <thead>
            <tr>
              <th>Time</th><th>Type</th><th>Severity</th><th>Action</th>
              <th>Actor</th><th>Target</th><th>Summary</th><th>IP</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <script>window.print();</script>
      </body>
    </html>`);
  printWindow.document.close();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
