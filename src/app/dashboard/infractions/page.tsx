import PageContainer from '@/components/layout/page-container';
import InfractionsView from '@/features/infractions/components/infractions-view';
import { NewInfractionButton } from '@/features/infractions/components/new-infraction-button';

export const metadata = {
  title: 'Dashboard: Infractions'
};

export default function InfractionsPage() {
  return (
    <PageContainer
      pageTitle='Infractions'
      pageDescription='Appeals and moderation records'
      pageHeaderAction={<NewInfractionButton />}
    >
      <InfractionsView />
    </PageContainer>
  );
}
