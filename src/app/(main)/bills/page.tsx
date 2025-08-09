'use client';
import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import type { Bill, UserProfile } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

// Mock Data from dashboard
const mockUsers: UserProfile[] = [
  { uid: 'user-1', displayName: 'Alex', email: 'alex@example.com', groupId: 'group-1' },
  { uid: 'user-2', displayName: 'Beth', email: 'beth@example.com', groupId: 'group-1' },
  { uid: 'user-3', displayName: 'Charlie', email: 'charlie@example.com', groupId: 'group-1' },
];

const initialMockBills: Omit<Bill, 'id' | 'createdAt'>[] = [
  { groupId: 'group-1', description: 'Monthly Rent', amount: 1200, paidBy: 'user-1', participants: ['user-1', 'user-2', 'user-3'], category: 'Rent' },
  { groupId: 'group-1', description: 'Internet Bill', amount: 60, paidBy: 'user-2', participants: ['user-1', 'user-2', 'user-3'], category: 'Internet' },
  { groupId: 'group-1', description: 'Groceries', amount: 150, paidBy: 'user-3', participants: ['user-1', 'user-2', 'user-3'], category: 'Groceries' },
  { groupId: 'group-1', description: 'Electricity', amount: 85, paidBy: 'user-1', participants: ['user-1', 'user-2', 'user-3'], category: 'Utilities' },
  { groupId: 'group-1', description: 'Dinner Out', amount: 90, paidBy: 'user-2', participants: ['user-1', 'user-2'], category: 'Food' },
  { groupId: 'group-1', description: 'Movie Tickets', amount: 45, paidBy: 'user-1', participants: ['user-1', 'user-3'], category: 'Entertainment' },
  { groupId: 'group-1', description: 'Cleaning Supplies', amount: 30, paidBy: 'user-3', participants: ['user-1', 'user-2', 'user-3'], category: 'Shopping' },
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


export default function AllBillsPage() {
    const [bills] = useState<Bill[]>(generateMockBills());
    const [members] = useState<UserProfile[]>(mockUsers);
    const [searchTerm, setSearchTerm] = useState('');

    const getPayerName = (uid: string) => members.find(m => m.uid === uid)?.displayName || 'Unknown';

    const filteredBills = useMemo(() => {
        return bills.filter(bill =>
            bill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (bill.category && bill.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
            getPayerName(bill.paidBy).toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [bills, searchTerm, members]);

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>All Bills</CardTitle>
                    <CardDescription>A complete history of all your group's expenses.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Input
                            placeholder="Search bills..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Paid By</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBills.map(bill => (
                                <TableRow key={bill.id}>
                                    <TableCell>{format(bill.createdAt.toDate(), 'MMM d, yyyy')}</TableCell>
                                    <TableCell className="font-medium">{bill.description}</TableCell>
                                    <TableCell>{getPayerName(bill.paidBy)}</TableCell>
                                    <TableCell>
                                        {bill.category && <Badge variant="secondary">{bill.category}</Badge>}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">${bill.amount.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {filteredBills.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">
                            <p>No bills match your search.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
