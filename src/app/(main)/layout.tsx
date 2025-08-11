'use client';

import { AppHeader } from '@/components/app-header';
import { GroupProvider } from '@/providers/group-provider';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  // NOTE: Auth and group checks have been removed for easier testing.
  // The original logic can be found in the git history if needed.
  return (
    <GroupProvider>
      <div className="flex flex-col min-h-screen bg-muted/30 dark:bg-muted/10">
        <AppHeader />
        <main className="flex-1">{children}</main>
      </div>
    </GroupProvider>
  );
}
