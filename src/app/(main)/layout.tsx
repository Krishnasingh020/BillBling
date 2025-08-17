'use client';

import { AppHeader } from '@/components/app-header';
import { GroupProvider } from '@/providers/group-provider';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <GroupProvider>
      <div className="flex flex-col min-h-screen bg-muted/30 dark:bg-muted/10">
        <AppHeader />
        <main className="flex-1">{children}</main>
      </div>
    </GroupProvider>
  );
}

    