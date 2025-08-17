'use client';

import { useMemo } from 'react';
import type { Bill, UserProfile } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowRight, Scale, Share2 } from 'lucide-react';
import { useGroup } from '@/providers/group-provider';
import { Button } from '@/components/ui/button';

const getInitials = (name?: string | null) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
};

export default function BalancesPage() {
    const { bills, members } = useGroup();

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
        
        // Create mutable copies for calculation
        const mutableBalances = JSON.parse(JSON.stringify(memberBalances));

        // Sort for consistent results
        debtors.sort((a, b) => mutableBalances[a.uid].net - mutableBalances[b.uid].net);
        creditors.sort((a, b) => mutableBalances[b.uid].net - mutableBalances[a.uid].net);

        let i = 0, j = 0;
        while (i < debtors.length && j < creditors.length) {
            const debtorId = debtors[i].uid;
            const creditorId = creditors[j].uid;
            const debt = Math.abs(mutableBalances[debtorId].net);
            const credit = mutableBalances[creditorId].net;
            const settlement = Math.min(debt, credit);

            if (settlement > 0.01) { // Threshold to avoid tiny floating point settlements
                simplifiedDebts.push({
                    from: members.find(m => m.uid === debtorId)?.displayName || 'Unknown',
                    to: members.find(m => m.uid === creditorId)?.displayName || 'Unknown',
                    amount: settlement
                });

                mutableBalances[debtorId].net += settlement;
                mutableBalances[creditorId].net -= settlement;
            }

            if (Math.abs(mutableBalances[debtorId].net) < 0.01) i++;
            if (Math.abs(mutableBalances[creditorId].net) < 0.01) j++;
        }

        return {
            summary: { totalPaid, totalBills: bills.length },
            memberBalances,
            simplifiedDebts
        };

    }, [bills, members]);
    
    const handleShareOnWhatsApp = () => {
        const summaryLines = simplifiedDebts.map(debt => 
            `- ${debt.from} owes ${debt.to} $${debt.amount.toFixed(2)}`
        );
        
        const message = `*BillBling Settlement Summary*\n\nHere's how we can settle up:\n\n${summaryLines.join('\n')}`;

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <Card className="mb-8">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                            <Scale />
                            Settlement Summary
                        </CardTitle>
                        <CardDescription>The simplest way to settle all debts in the group.</CardDescription>
                    </div>
                    {simplifiedDebts.length > 0 && (
                        <Button variant="outline" onClick={handleShareOnWhatsApp}>
                            <Share2 className="mr-2 h-4 w-4" />
                            Share on WhatsApp
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    {simplifiedDebts.length > 0 ? (
                        <div className="space-y-4">
                            {simplifiedDebts.map((debt, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                    <div className="flex items-center font-medium">
                                        <span className='font-bold text-red-600'>{debt.from}</span>
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
                                <TableHead className="text-right">Total Paid (Credit)</TableHead>
                                <TableHead className="text-right">Total Share (Debit)</TableHead>
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
                                        {memberBalances[member.uid].net >= 0 ? '+' : ''}${Math.abs(memberBalances[member.uid].net).toFixed(2)}
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
