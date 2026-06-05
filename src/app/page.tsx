import { getMockSession } from '@/features/auth/api/mock-auth';
import { redirect } from 'next/navigation';

export default async function Page() {
  const user = await getMockSession();

  if (!user) {
    return redirect('/auth/sign-in');
  } else {
    redirect('/dashboard/servers');
  }
}
