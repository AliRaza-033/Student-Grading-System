import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

import HomePage from '@/components/Homepage';

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    redirect(user.role === 'Admin' ? '/admin/dashboard' : '/student/dashboard');
  }

  // Render client UI
  return <HomePage />;
}
