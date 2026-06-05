import PageContainer from '@/components/layout/page-container';
import SessionsView from '@/features/sessions/components/sessions-view';

export const metadata = {
  title: 'Dashboard: Sessions'
};

export default function SessionsPage() {
  return (
    <PageContainer pageTitle='Sessions' pageDescription='Session analytics and controls'>
      <SessionsView />
    </PageContainer>
  );
}
