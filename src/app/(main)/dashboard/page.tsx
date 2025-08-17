'use client';

import { useMemo } from 'react';
import { AddBillDialog } from '@/components/dashboard/add-bill-dialog';
import { Users, Receipt, Scale, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { SpendingChart } from '@/components/dashboard/spending-chart';
import { useGroup } from '@/providers/group-provider';
import { useAuth } from '@/providers/auth-provider';
import { getInitials } from '@/lib/utils';

export default function DashboardPage() {
    const { user } = useAuth();
    const { group, bills, members, addBill, loading } = useGroup();

    const balances = useMemo(() => {
        if (!user || members.length === 0) return { groupTotal: 0, netBalance: 0 };
    
        let netBalance = 0;
        let groupTotal = 0;
    
        bills.forEach(bill => {
            groupTotal += bill.amount;
            if (bill.participants.length > 0) {
                const share = bill.amount / bill.participants.length;
                if (bill.paidBy === user.uid) {
                    netBalance += bill.amount - share * (bill.participants.length -1);
                } else if (bill.participants.includes(user.uid)) {
                    netBalance -= share;
                }
            }
        });
        
        return { groupTotal, netBalance };
    }, [bills, members, user]);

    const getPayerName = (uid: string) => members.find(m => m.uid === uid)?.displayName || 'Unknown';

    if (loading) {
      return (
         <div className="container mx-auto p-4 md:p-6 lg:p-8 text-center flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <p>Loading your group...</p>
        </div>
      )
    }
    
    if (!group) {
      return (
         <div className="container mx-auto p-4 md:p-6 lg:p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Welcome to BillBling!</h1>
            <p className="text-muted-foreground mb-6">To get started, create a new group or join an existing one.</p>
            <Button asChild>
                <Link href="/group">Get Started</Link>
            </Button>
        </div>
      )
    }

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-headline">
                        {group?.groupName || 'Dashboard'}
                    </h1>
                     <p className="text-muted-foreground">Invite code: <span className="font-mono bg-muted px-2 py-1 rounded-md">{group?.inviteCode}</span></p>
                </div>
                <AddBillDialog members={members} groupId={group?.id || ''} onBillAdded={addBill} />
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${balances.groupTotal.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">across {bills.length} bills</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Your Net Balance</CardTitle>
                        <Scale className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${balances.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                           {balances.netBalance >= 0 ? '+' : ''}${balances.netBalance.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">You are owed money if positive</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Group Members</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex -space-x-2 overflow-hidden p-2">
                            {members.map(m => (
                                <div key={m.uid} title={m.displayName || ''} className="inline-block h-9 w-9 rounded-full ring-2 ring-background text-primary bg-primary/20 flex items-center justify-center font-bold">
                                    {getInitials(m.displayName)}
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground">in {group?.groupName}</p>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid gap-8 md:grid-cols-5">
              <Card className="md:col-span-3">
                  <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Recent Bills</CardTitle>
                      <Button asChild variant="ghost" size="sm">
                          <Link href="/bills">View All</Link>
                      </Button>
                  </CardHeader>
                  <CardContent>
                  {bills.length === 0 ? (
                      <div className="text-center py-20 bg-background rounded-lg border border-dashed">
                          <h2 className="text-xl font-semibold">No bills yet!</h2>
                          <p className="text-muted-foreground mt-2">Add your first bill to see your balances.</p>
                      </div>
                  ) : (
                      <div className="space-y-4">
                          {bills.slice(0, 5).map(bill => (
                              <div key={bill.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                  <div className="flex items-center gap-4">
                                      <div className="p-3 bg-primary/10 rounded-full">
                                          <Receipt className="h-5 w-5 text-primary" />
                                      </div>
                                      <div>
                                          <p className="font-semibold">{bill.description}</p>
                                          <p className="text-sm text-muted-foreground">
                                              Paid by {getPayerName(bill.paidBy)} &bull; {bill.createdAt ? format(new Date(bill.createdAt), 'MMM d, yyyy') : '...'}
                                          </p>
                                      </div>
                                  </div>
                                  <div className='text-right'>
                                      <p className="font-semibold text-lg">${bill.amount.toFixed(2)}</p>
                                      {bill.category && <Badge variant="secondary" className="mt-1">{bill.category}</Badge>}
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
                  </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Spending by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <SpendingChart bills={bills} />
                </CardContent>
              </Card>
            </div>
        </div>
    );
}
