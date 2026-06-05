import { queryOptions } from '@tanstack/react-query';
import { getAuditLogs } from './service';

export const auditLogKeys = {
  all: ['audit-logs'] as const,
  list: (communityId: string) => [...auditLogKeys.all, 'list', communityId] as const
};

export const auditLogsQueryOptions = (communityId: string) =>
  queryOptions({
    queryKey: auditLogKeys.list(communityId),
    queryFn: () => getAuditLogs(communityId)
  });
