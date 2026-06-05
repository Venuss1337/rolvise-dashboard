import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Skeleton } from '@/components/ui/skeleton';
import { MemberProfile } from '@/features/members/components/member-profile';

export const metadata = {
  title: 'Dashboard: Member Profile'
};

type PageProps = {
  params: Promise<{ memberId: string }>;
};

export default async function MemberProfilePage(props: PageProps) {
  const { memberId } = await props.params;

  return (
    <PageContainer pageTitle='Member Profile'>
      <Suspense fallback={<Skeleton className='h-64 max-w-3xl rounded-lg' />}>
        <MemberProfile memberId={memberId} />
      </Suspense>
    </PageContainer>
  );
}
