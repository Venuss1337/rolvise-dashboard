import { fakeAuditLogs } from '@/constants/mock-api-audit-logs';
import type { AuditLog } from './types';

export async function getAuditLogs(communityId: string): Promise<AuditLog[]> {
  return fakeAuditLogs.getAuditLogs(communityId);
}
