'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, onSnapshot, query, orderBy, where, getDocs } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { AddBillDialog } from './add-bill-dialog';
import type { Bill, Group, UserProfile, Balance } from '@/types';
import { Loader2, Users, Receipt, Scale } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';

export function DashboardClient() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [group, setGroup] = useState<Group | null>(null);
    const [bills, setBills] = useState<Bill[]>([]);
    const [members, setMembers] = useState<UserProfile[]>([]);

    useEffect(() => {
        if (!user) return;

        let groupUnsub: () => void;
        let billsUnsub: () => void;

        const setupListeners = async () => {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists() || !userDoc.data().groupId) {
                setLoading(false);
                return;
            }
            const groupId = userDoc.data().groupId;

            groupUnsub = onSnapshot(doc(db, 'groups', groupId), async (groupDoc) => {
                if (!groupDoc.exists()) return;
                
                const groupData = { id: groupDoc.id, ...groupDoc.data() } as Group;
                setGroup(groupData);
                
                const memberQuery = query(collection(db, 'users'), where('groupId', '==', groupId));
                const memberSnapshot = await getDocs(memberQuery);
                const memberProfiles = memberSnapshot.docs.map(mdoc => ({ uid: mdoc.id, ...mdoc.data() } as UserProfile));
                setMembers(memberProfiles);
            });
            
            const billsQuery = query(collection(db, 'bills'), where("groupId", "==", groupId), orderBy('createdAt', 'desc'));
            billsUnsub = onSnapshot(billsQuery, (snapshot) => {
                const billsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Bill));
                setBills(billsData);
                setLoading(false);
            });
        };

        setupListeners();
        
        return () => {
            groupUnsub?.();
            billsUnsub?.();
        };
    }, [user]);

    const balances = useMemo(() => {
        if (!user || members.length === 0) return { owedToMe: [], iOwe: [], groupTotal: 0 };
    
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
    
        const iOwe: Balance[] = [];
        const owedToMe: Balance[] = [];
    
        members.filter(m => m.uid !== user.uid).forEach(member => {
            if (netBalances[member.uid] < netBalances[user.uid]) {
                // Simplified for demo: just show net balance vs group avg
            }
        });
        
        return { owedToMe, iOwe, groupTotal, netBalances };
    }, [bills, members, user]);

    const getPayerName = (uid: string) => members.find(m => m.uid === uid)?.displayName || 'Unknown';

    if (loading) {
        return (
            <div className="container mx-auto p-4 md:p-6 lg:p-8">
                <div className="flex items-center justify-between mb-6">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-24" />
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
                <div className="mt-8">
                    <Skeleton className="h-64 w-full" />
                </div>
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
                <AddBillDialog members={members} groupId={group?.id || ''} />
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
                        <div className="flex -space-x-2 overflow-hidden">
                            {members.map(m => (
                                <div key={m.uid} className="inline-block h-9 w-9 rounded-full ring-2 ring-background text-primary bg-primary/20 flex items-center justify-center font-bold">
                                    {m.displayName.charAt(0).toUpperCase()}
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground">in {group?.groupName}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Bills</CardTitle>
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
                            <div key={bill.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
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
                                    {bill.category && <Badge variant="secondary">{bill.category}</Badge>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                </CardContent>
            </Card>
        </div>
    );
}
