import PageContainer from '@/components/layout/page-container';
import MyInboxPageView from '@/features/my-inbox/components/my-inbox-page';

export const metadata = {
  title: 'Dashboard: My Inbox'
};

export default function MyInboxPage() {
  return (
    <PageContainer pageTitle='My Inbox' pageDescription='Personal queue and notifications'>
      <MyInboxPageView />
    </PageContainer>
  );
}
