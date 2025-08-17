'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { GroupProvider } from '@/providers/group-provider';
import { useAuth } from '@/providers/auth-provider';
import { Loader2 } from 'lucide-react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    // This will be briefly visible before the redirect happens.
    // Or it might be the case that we are already on /login or /signup
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
