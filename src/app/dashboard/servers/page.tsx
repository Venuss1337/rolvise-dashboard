import PageContainer from '@/components/layout/page-container';
import ServerSelection from '@/features/servers/components/server-selection';

export const metadata = {
  title: 'Dashboard: Servers'
};

export default function ServersPage() {
  return (
    <PageContainer
      pageTitle='Servers'
      pageDescription='Choose which ER:LC community server you are managing right now.'
    >
      <ServerSelection />
    </PageContainer>
  );
}
