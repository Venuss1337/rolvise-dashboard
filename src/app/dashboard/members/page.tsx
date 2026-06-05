import PageContainer from '@/components/layout/page-container';
import MembersView from '@/features/members/components/members-view';

export const metadata = {
  title: 'Dashboard: Members'
};

export default function MembersPage() {
  return (
    <PageContainer pageTitle='Members' pageDescription='Community roster'>
      <MembersView />
    </PageContainer>
  );
}
