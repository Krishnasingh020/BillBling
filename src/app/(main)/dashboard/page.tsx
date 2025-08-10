'use client';

import { useState, useMemo } from 'react';
import { AddBillDialog } from '@/components/dashboard/add-bill-dialog';
import type { Bill, UserProfile, Balance } from '@/types';
import { Users, Receipt, Scale, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { SpendingChart } from '@/components/dashboard/spending-chart';

// Mock Data
const mockUsers: UserProfile[] = [
  { uid: 'user-1', displayName: 'Alex', email: 'alex@example.com', groupId: 'group-1' },
  { uid: 'user-2', displayName: 'Beth', email: 'beth@example.com', groupId: 'group-1' },
  { uid: 'user-3', displayName: 'Charlie', email: 'charlie@example.com', groupId: 'group-1' },
  { uid: 'user-4', displayName: 'David', email: 'david@example.com', groupId: 'group-1' },
];

const mockCurrentUser = mockUsers[0];

const initialMockBills: Omit<Bill, 'id' | 'createdAt'>[] = [
  { groupId: 'group-1', description: 'Monthly Rent', amount: 1200, paidBy: 'user-1', participants: ['user-1', 'user-2', 'user-3', 'user-4'], category: 'Rent' },
  { groupId: 'group-1', description: 'Internet Bill', amount: 60, paidBy: 'user-2', participants: ['user-1', 'user-2', 'user-3', 'user-4'], category: 'Internet' },
  { groupId: 'group-1', description: 'Groceries', amount: 150, paidBy: 'user-3', participants: ['user-1', 'user-2', 'user-3', 'user-4'], category: 'Groceries' },
  { groupId: 'group-1', description: 'Electricity', amount: 85, paidBy: 'user-1', participants: ['user-1', 'user-2', 'user-3', 'user-4'], category: 'Utilities' },
  { groupId: 'group-1', description: 'Dinner Out', amount: 90, paidBy: 'user-2', participants: ['user-1', 'user-2'], category: 'Food' },
];

const generateMockBills = (): Bill[] => {
    return initialMockBills.map((bill, index) => ({
        ...bill,
        id: uuidv4(),
        // @ts-ignore
        createdAt: { toDate: () => new Date(Date.now() - index * 24 * 60 * 60 * 1000) },
    }));
};


export default function DashboardPage() {
    const [group] = useState({ id: 'group-1', groupName: 'The Fun House', inviteCode: 'FUN123' });
    const [bills, setBills] = useState<Bill[]>(generateMockBills());
    const [members] = useState<UserProfile[]>(mockUsers);
    const user = mockCurrentUser;
    
    const handleAddBill = (newBill: Omit<Bill, 'id'>) => {
        const billWithDate: Bill = {
            ...newBill,
            id: uuidv4(),
            // @ts-ignore
            createdAt: { toDate: () => new Date() },
        };
        setBills(prevBills => [billWithDate, ...prevBills]);
    };

    const balances = useMemo(() => {
        if (!user || members.length === 0) return { owedToMe: [], iOwe: [], groupTotal: 0, netBalances: {} };
    
        const netBalances: { [uid: string]: number } = {};
        members.forEach(m => netBalances[m.uid] = 0);
        let groupTotal = 0;
    
        bills.forEach(bill => {
            groupTotal += bill.amount;
            const share = bill.amount / bill.participants.length;
            netBalances[bill.paidBy] += bill.amount;
            bill.participants.forEach(participantId => {
                netBalances[participantId] -= share;
            });
        });
        
        return { owedToMe: [], iOwe: [], groupTotal, netBalances };
    }, [bills, members, user]);

    const getPayerName = (uid: string) => members.find(m => m.uid === uid)?.displayName || 'Unknown';

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-headline">
                        {group?.groupName || 'Dashboard'}
                    </h1>
                     <p className="text-muted-foreground">Invite code: <span className="font-mono bg-muted px-2 py-1 rounded-md">{group?.inviteCode}</span></p>
                </div>
                <AddBillDialog members={members} groupId={group?.id || ''} onBillAdded={handleAddBill} />
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
                        <div className={`text-2xl font-bold ${balances.netBalances?.[user?.uid || ''] >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                           {balances.netBalances?.[user?.uid || ''] >= 0 ? '+' : ''}${balances.netBalances?.[user?.uid || ''].toFixed(2)}
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
                                <div key={m.uid} title={m.displayName} className="inline-block h-9 w-9 rounded-full ring-2 ring-background text-primary bg-primary/20 flex items-center justify-center font-bold">
                                    {m.displayName.charAt(0).toUpperCase()}
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
                                              Paid by {getPayerName(bill.paidBy)} &bull; {format(bill.createdAt.toDate(), 'MMM d, yyyy')}
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
