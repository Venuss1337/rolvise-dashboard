import { JoinInvitePage } from '@/features/invites/components/join-invite-page';

interface JoinPageProps {
  params: Promise<{ token: string }>;
}

export const metadata = {
  title: 'Join Rolvise'
};

export default async function JoinPage({ params }: JoinPageProps) {
  const { token } = await params;

  return <JoinInvitePage token={token} />;
}
