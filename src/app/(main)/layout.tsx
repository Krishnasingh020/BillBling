'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { GroupProvider } from '@/providers/group-provider';
import { useAuth } from '@/providers/auth-provider';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If auth is not loading and there's no user, redirect to login page.
    // Allow access to the landing page if they are not logged in.
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    // This will be briefly visible before the redirect happens.
    return null;
  }
  
  return (
    <GroupProvider>
      <div className="flex flex-col min-h-screen bg-muted/30 dark:bg-muted/10">
        <AppHeader />
        <main className="flex-1">{children}</main>
      </div>
    </GroupProvider>
  );
}
