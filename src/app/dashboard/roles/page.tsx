import PageContainer from '@/components/layout/page-container';
import { NewRoleButton } from '@/features/roles/components/new-role-button';
import RolesView from '@/features/roles/components/roles-view';

export const metadata = {
  title: 'Dashboard: Roles'
};

export default function RolesPage() {
  return (
    <PageContainer
      pageTitle='Roles'
      pageDescription='Permissions and member access'
      pageHeaderAction={<NewRoleButton />}
    >
      <RolesView />
    </PageContainer>
  );
}
