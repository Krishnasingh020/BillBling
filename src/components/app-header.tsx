'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DollarSign, LogOut, LayoutDashboard, FileText, UserPlus, Scale } from 'lucide-react';
import { useGroup } from '@/providers/group-provider';

export function AppHeader() {
  const router = useRouter();
  const { user } = useGroup();

  const handleLogout = async () => {
    // In a real app, this would sign the user out.
    // For now, it just redirects to the landing page.
    router.push('/');
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
      <Link href="/dashboard" className="flex items-center justify-center" prefetch={false}>
        <DollarSign className="h-6 w-6 text-primary" />
        <span className="ml-2 text-xl font-bold font-headline">BillBling</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
        <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard"><LayoutDashboard className="mr-2"/>Dashboard</Link>
        </Button>
         <Button variant="ghost" size="sm" asChild>
            <Link href="/bills"><FileText className="mr-2"/>All Bills</Link>
        </Button>
         <Button variant="ghost" size="sm" asChild>
            <Link href="/balances"><Scale className="mr-2"/>Balances</Link>
        </Button>
         <Button variant="ghost" size="sm" asChild>
            <Link href="/group"><UserPlus className="mr-2"/>Group</Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10 border-2 border-primary/50">
                <AvatarImage src={''} alt={user.displayName || 'User'} />
                <AvatarFallback className="bg-primary/20">{getInitials(user.displayName)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </header>
  );
}
