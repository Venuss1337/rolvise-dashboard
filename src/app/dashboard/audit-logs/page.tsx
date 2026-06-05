import PageContainer from '@/components/layout/page-container';
import AuditLogsPageView from '@/features/audit-logs/components/audit-logs-page';

export const metadata = {
  title: 'Dashboard: Audit Logs'
};

export default function AuditLogsPage() {
  return (
    <PageContainer pageTitle='Audit Logs' pageDescription='System events and admin activity'>
      <AuditLogsPageView />
    </PageContainer>
  );
}
