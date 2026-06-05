import PageContainer from '@/components/layout/page-container';
import { DiscordClaimPage } from '@/features/onboarding/components/discord-claim-page';

export const metadata = {
  title: 'Dashboard: Discord Onboarding'
};

export default function DiscordOnboardingPage() {
  return (
    <PageContainer
      pageTitle='Discord onboarding'
      pageDescription='Finish linking the Discord server that started setup from the Rolvise bot.'
    >
      <DiscordClaimPage />
    </PageContainer>
  );
}
