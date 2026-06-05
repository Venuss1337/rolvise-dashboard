import PageContainer from '@/components/layout/page-container';
import ResourcesView from '@/features/resources/components/resources-view';

export const metadata = {
  title: 'Dashboard: Resources'
};

export default function ResourcesPage() {
  return (
    <PageContainer pageTitle='Resources' pageDescription='Documents, forms, and applications'>
      <ResourcesView />
    </PageContainer>
  );
}
