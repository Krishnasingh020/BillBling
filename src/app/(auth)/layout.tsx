import { DollarSign } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-background to-blue-100 dark:from-background dark:to-blue-900/10 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center justify-center" prefetch={false}>
              <DollarSign className="h-8 w-8 text-primary" />
              <span className="ml-2 text-3xl font-bold font-headline">BillBling</span>
            </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
