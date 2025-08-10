'use client';

import { useMemo, useState } from 'react';
import type { Bill, UserProfile } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowRight, Scale } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Extended Mock Data for better balance demonstration
const mockUsers: UserProfile[] = [
  { uid: 'user-1', displayName: 'Alex', email: 'alex@example.com', groupId: 'group-1' },
  { uid: 'user-2', displayName: 'Beth', email: 'beth@example.com', groupId: 'group-1' },
  { uid: 'user-3', displayName: 'Charlie', email: 'charlie@example.com', groupId: 'group-1' },
  { uid: 'user-4', displayName: 'David', email: 'david@example.com', groupId: 'group-1' },
];

const initialMockBills: Omit<Bill, 'id' | 'createdAt'>[] = [
    { groupId: 'group-1', description: 'Monthly Rent', amount: 1200, paidBy: 'user-1', participants: ['user-1', 'user-2', 'user-3', 'user-4'], category: 'Rent' },
    { groupId: 'group-1', description: 'Internet Bill', amount: 60, paidBy: 'user-2', participants: ['user-1', 'user-2', 'user-3', 'user-4'], category: 'Internet' },
    { groupId: 'group-1', description: 'Groceries', amount: 150, paidBy: 'user-3', participants: ['user-1', 'user-2', 'user-3', 'user-4'], category: 'Groceries' },
    { groupId: 'group-1', description: 'Electricity', amount: 85, paidBy: 'user-1', participants: ['user-1', 'user-2', 'user-3', 'user-4'], category: 'Utilities' },
    { groupId: 'group-1', description: 'Dinner Out', amount: 90, paidBy: 'user-2', participants: ['user-1', 'user-2'], category: 'Food' },
    { groupId: 'group-1', description: 'Movie Tickets', amount: 45, paidBy: 'user-1', participants: ['user-1', 'user-3'], category: 'Entertainment' },
    { groupId: 'group-1', description: 'Cleaning Supplies', amount: 30, paidBy: 'user-4', participants: ['user-1', 'user-2', 'user-3', 'user-4'], category: 'Shopping' },
    { groupId: 'group-1', description: 'Weekend Trip Gas', amount: 50, paidBy: 'user-2', participants: ['user-1', 'user-2'], category: 'Travel' },
];


const generateMockBills = (): Bill[] => {
    return initialMockBills.map((bill, index) => ({
        ...bill,
        id: uuidv4(),
        // @ts-ignore
        createdAt: { toDate: () => new Date(Date.now() - index * 24 * 60 * 60 * 1000) },
    }));
};

const getInitials = (name?: string | null) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
};

export default function BalancesPage() {
    const [bills] = useState<Bill[]>(generateMockBills());
    const [members] = useState<UserProfile[]>(mockUsers);

    const { summary, memberBalances, simplifiedDebts } = useMemo(() => {
        const memberBalances: { [uid: string]: { paid: number, owed: number, net: number } } = {};
        members.forEach(m => {
            memberBalances[m.uid] = { paid: 0, owed: 0, net: 0 };
        });

        bills.forEach(bill => {
            if (bill.participants.length > 0) {
                memberBalances[bill.paidBy].paid += bill.amount;
                const share = bill.amount / bill.participants.length;
                bill.participants.forEach(pid => {
                    memberBalances[pid].owed += share;
                });
            }
        });
        
        let totalPaid = 0;
        Object.values(memberBalances).forEach(balance => {
            balance.net = balance.paid - balance.owed;
            totalPaid += balance.paid;
        });

        // Simplified Debts Calculation
        const debtors = members.filter(m => memberBalances[m.uid].net < 0);
        const creditors = members.filter(m => memberBalances[m.uid].net > 0);
        const simplifiedDebts: { from: string, to: string, amount: number }[] = [];
        
        // Sort for consistent results
        debtors.sort((a, b) => memberBalances[a.uid].net - memberBalances[b.uid].net);
        creditors.sort((a, b) => memberBalances[b.uid].net - memberBalances[a.uid].net);

        let i = 0, j = 0;
        while (i < debtors.length && j < creditors.length) {
            const debtorId = debtors[i].uid;
            const creditorId = creditors[j].uid;
            const debt = Math.abs(memberBalances[debtorId].net);
            const credit = memberBalances[creditorId].net;
            const settlement = Math.min(debt, credit);

            if (settlement > 0.01) { // Threshold to avoid tiny floating point settlements
                simplifiedDebts.push({
                    from: debtors[i].displayName,
                    to: creditors[j].displayName,
                    amount: settlement
                });

                memberBalances[debtorId].net += settlement;
                memberBalances[creditorId].net -= settlement;
            }

            if (Math.abs(memberBalances[debtorId].net) < 0.01) i++;
            if (Math.abs(memberBalances[creditorId].net) < 0.01) j++;
        }

        return {
            summary: { totalPaid, totalBills: bills.length },
            memberBalances,
            simplifiedDebts
        };

    }, [bills, members]);
    
    const getMemberName = (uid: string) => members.find(m => m.uid === uid)?.displayName || 'Unknown';

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Scale />
                        Settlement Summary
                    </CardTitle>
                    <CardDescription>The simplest way to settle all debts in the group.</CardDescription>
                </CardHeader>
                <CardContent>
                    {simplifiedDebts.length > 0 ? (
                        <div className="space-y-4">
                            {simplifiedDebts.map((debt, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                    <div className="flex items-center font-medium">
                                        <span className='font-bold text-primary'>{debt.from}</span>
                                        <ArrowRight className="mx-4 h-5 w-5 text-muted-foreground" />
                                        <span className='font-bold text-green-600'>{debt.to}</span>
                                    </div>
                                    <div className="font-bold text-lg">${debt.amount.toFixed(2)}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            <p>All balances are settled. Good job!</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Detailed Balances</CardTitle>
                    <CardDescription>A full breakdown of who paid, who owes, and net balances for everyone.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Member</TableHead>
                                <TableHead className="text-right">Total Paid</TableHead>
                                <TableHead className="text-right">Total Share</TableHead>
                                <TableHead className="text-right">Net Balance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {members.map(member => (
                                <TableRow key={member.uid}>
                                    <TableCell className="font-medium flex items-center gap-3">
                                         <Avatar className="h-9 w-9 border-2 border-primary/20">
                                            <AvatarFallback className="bg-primary/10">{getInitials(member.displayName)}</AvatarFallback>
                                        </Avatar>
                                        {member.displayName}
                                    </TableCell>
                                    <TableCell className="text-right text-green-600 font-medium">+${memberBalances[member.uid].paid.toFixed(2)}</TableCell>
                                    <TableCell className="text-right text-red-600 font-medium">-${memberBalances[member.uid].owed.toFixed(2)}</TableCell>
                                    <TableCell className={`text-right font-bold ${memberBalances[member.uid].net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {memberBalances[member.uid].net >= 0 ? '+' : '-'}${Math.abs(memberBalances[member.uid].net).toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}