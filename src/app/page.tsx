'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DollarSign, Users, PieChart, Loader2 } from 'lucide-react';
import { generateImage } from '@/ai/flows/generate-image-flow';

export default function Home() {
  const [heroImageUrl, setHeroImageUrl] = useState("https://placehold.co/600x600.png");
  const [isLoadingImage, setIsLoadingImage] = useState(true);

  useEffect(() => {
    generateImage({ prompt: "A modern, abstract illustration for a financial app, representing collaboration and splitting bills. Use a clean, friendly color palette with soft, rounded shapes. The style should be minimalist and approachable, conveying ease of use and trust." })
      .then(result => {
        setHeroImageUrl(result.imageUrl);
      })
      .catch(error => {
        console.error("Failed to generate hero image:", error);
      })
      .finally(() => {
        setIsLoadingImage(false);
      });
  }, []);


  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
        <Link href="/dashboard" className="flex items-center justify-center" prefetch={false}>
          <DollarSign className="h-6 w-6 text-primary" />
          <span className="ml-2 text-xl font-bold font-headline">BillBling</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
           <Button asChild variant="ghost">
            <Link href="/dashboard" prefetch={false}>
              Dashboard
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard" prefetch={false}>
              Get Started
            </Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-background to-blue-100 dark:from-slate-900 dark:to-blue-950/20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Split Bills, Not Friendships
                  </h1>
                  <p className="max-w-[600px] text-foreground/80 md:text-xl">
                    BillBling is the easiest way to manage household expenses with your flatmates. Track spending,
                    calculate who owes who, and settle up with confidence.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/dashboard" prefetch={false}>
                      Get Started for Free
                    </Link>
                  </Button>
                </div>
              </div>
               <div className="mx-auto aspect-square overflow-hidden rounded-xl flex items-center justify-center bg-muted/50">
                {isLoadingImage ? (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-10 w-10 animate-spin" />
                    <p>Generating illustration...</p>
                  </div>
                ) : (
                  <img
                    src={heroImageUrl}
                    width="600"
                    height="600"
                    alt="Hero"
                    className="object-cover w-full h-full"
                  />
                )}
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                  Everything You Need to Manage Shared Bills
                </h2>
                <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From automatic AI-powered tagging to simple settlement, BillBling is packed with features to make your
                  life easier.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:gap-16 mt-12">
              <div className="grid gap-2 text-center p-4 rounded-lg hover:bg-card transition-all">
                <Users className="h-10 w-10 mx-auto text-primary" />
                <h3 className="text-lg font-bold">Group Management</h3>
                <p className="text-sm text-muted-foreground">
                  Create a home for your flatmates, invite them, and manage all your shared expenses in one place.
                </p>
              </div>
              <div className="grid gap-2 text-center p-4 rounded-lg hover:bg-card transition-all">
                <div className="mx-auto flex items-center justify-center h-10 w-10 relative">
                  <DollarSign className="h-10 w-10 text-primary" />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-accent absolute -top-1 -right-1"
                    style={{ fill: 'currentColor' }}
                  >
                    <path d="m12 3-1.9 5.8-5.6.3 4.5 3.8-1.7 5.9 5.2-3.4 5.2 3.4-1.7-5.9 4.5-3.8-5.6-.3Z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold">AI Bill Tagging</h3>
                <p className="text-sm text-muted-foreground">
                  Our smart AI automatically suggests categories for your bills, making tracking your spending
                  effortless.
                </p>
              </div>
              <div className="grid gap-2 text-center p-4 rounded-lg hover:bg-card transition-all">
                <PieChart className="h-10 w-10 mx-auto text-primary" />
                <h3 className="text-lg font-bold">Clear Balances</h3>
                <p className="text-sm text-muted-foreground">
                  A simple dashboard shows exactly who owes who, so there's never any confusion.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 BillBling. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
