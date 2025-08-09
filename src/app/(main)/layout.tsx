'use client';

import { useAuth } from '@/providers/auth-provider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AppHeader } from '@/components/app-header';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

function LoadingSkeleton() {
    return (
        <div className="flex flex-col min-h-screen">
          <header className="px-4 lg:px-6 h-16 flex items-center bg-background sticky top-0 z-50 border-b">
            <Skeleton className="h-8 w-32" />
            <div className="ml-auto">
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </main>
        </div>
    );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<'loading' | 'no_group' | 'in_group'>('loading');

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    const checkGroupStatus = async () => {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists() && userDoc.data().groupId) {
        setStatus('in_group');
      } else {
        setStatus('no_group');
        if (pathname !== '/group') {
          router.replace('/group');
        }
      }
    };

    checkGroupStatus();
  }, [user, authLoading, router, pathname]);

  if (status === 'loading') {
    return <LoadingSkeleton />;
  }

  if (status === 'no_group' && pathname !== '/group') {
     return <LoadingSkeleton />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
