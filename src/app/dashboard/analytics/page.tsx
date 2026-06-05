import PageContainer from '@/components/layout/page-container';
import { AnalyticsView } from '@/features/analytics/components/analytics-view';

export const metadata = {
  title: 'Dashboard: Analytics'
};

export default function AnalyticsPage() {
  return (
    <PageContainer pageTitle='Analytics' pageDescription='Community activity and staff metrics'>
      <AnalyticsView />
    </PageContainer>
  );
}
