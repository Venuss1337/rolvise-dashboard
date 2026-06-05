import PageContainer from '@/components/layout/page-container';
import LeaveOfAbsencePageView from '@/features/leave-of-absence/components/leave-of-absence-page';

export const metadata = {
  title: 'Dashboard: Leave Of Absence'
};

export default function LeaveOfAbsencePage() {
  return (
    <PageContainer pageTitle='Leave Of Absence' pageDescription='Staff availability requests'>
      <LeaveOfAbsencePageView />
    </PageContainer>
  );
}
