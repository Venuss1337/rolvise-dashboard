import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Dashboard: Integrations'
};

export default function SettingsPage() {
  redirect('/dashboard/integrations');
}
